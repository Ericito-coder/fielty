import { NextResponse, after } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import crypto from 'crypto'
import { enviarEmail } from '@/lib/email'
import { getSupabaseAdmin } from '@/lib/server'
import { mpGet, resolverNegocio, sincronizarSuscripcion } from '@/lib/mp'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
// Valida el header x-signature que manda MP (HMAC-SHA256 sobre
// "id:{dataId};request-id:{x-request-id};ts:{ts};" con la "Firma
// secreta" del webhook). Se activa solo si MP_WEBHOOK_SECRET está
// configurado; si no, no bloquea.
function firmaMpValida(request, searchParams, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  if (!xSignature || !xRequestId || !dataId) return false

  const partes = Object.fromEntries(
    xSignature.split(',').map(p => p.trim().split('=').map(s => s.trim()))
  )
  const { ts, v1 } = partes
  if (!ts || !v1) return false

  const idParaManifest = (searchParams.get('data.id') || String(dataId)).toLowerCase()
  const manifest = `id:${idParaManifest};request-id:${xRequestId};ts:${ts};`
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  const a = Buffer.from(hash)
  const b = Buffer.from(v1)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Tipos de evento de suscripción que manda MP según la versión de la API
const TIPOS_SUSCRIPCION = ['subscription_preapproval', 'preapproval', 'subscription_authorized_payment']

// El query builder de Supabase es un thenable, no una Promise: no
// tiene .catch(). Loguear nunca debe tumbar la respuesta al webhook.
async function logEvento(supabaseAdmin, fila) {
  try {
    await supabaseAdmin.from('mp_eventos').insert([fila])
  } catch (error) {
    console.error('log mp_eventos falló:', error?.message)
  }
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  let body = null

  try {
    const { searchParams } = new URL(request.url)

    // Autenticación: alcanza con el secreto por query O con una firma
    // válida de MP. Así el webhook sigue funcionando si el secreto de
    // la URL configurada en MP quedó desactualizado.
    const secret = searchParams.get('secret')
    const secretOk = !!process.env.WEBHOOK_SECRET && secret === process.env.WEBHOOK_SECRET

    body = await request.json().catch(() => null)
    const { type, action, data } = body || {}
    const firmaOk = !!process.env.MP_WEBHOOK_SECRET && firmaMpValida(request, searchParams, data?.id)

    if (!secretOk && !firmaOk) {
      // Se registra igual: si MP está pegando y rebota, queda rastro
      await logEvento(supabaseAdmin, {
        tipo: type || 'desconocido', data_id: data?.id ? String(data.id) : null,
        estado: 'rechazado_auth', resuelto: false, payload: body,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tipoEvento = type || action?.split('.')?.[0]
    if (!TIPOS_SUSCRIPCION.includes(tipoEvento)) {
      return NextResponse.json({ ok: true })
    }

    if (!data?.id) return NextResponse.json({ ok: true })

    // En subscription_authorized_payment el data.id es el de la cuota
    // cobrada (authorized_payment), no el de la suscripción: pedirlo como
    // preapproval da 404 "Preapproval not found". Primero se trae la
    // cuota, que dice a qué suscripción pertenece en preapproval_id.
    let preapprovalId = data.id
    let cuota = null
    if (tipoEvento === 'subscription_authorized_payment') {
      cuota = await mpGet(`/authorized_payments/${encodeURIComponent(data.id)}`)
      preapprovalId = cuota?.preapproval_id

      if (!preapprovalId) {
        // Sin suscripción no hay negocio que sincronizar. Queda registrado
        // y se responde 200: un reintento de MP no lo arregla, y el cron
        // diario deja el plan como corresponde de todos modos.
        await logEvento(supabaseAdmin, {
          tipo: tipoEvento,
          data_id: String(data.id),
          estado: cuota ? 'cuota_sin_preapproval_id' : 'cuota_no_disponible',
          resuelto: false,
          payload: body,
        })
        return NextResponse.json({ ok: true })
      }
    }

    // Traer los detalles de la suscripción desde MP
    const preApproval = new PreApproval(client)
    const suscripcion = await preApproval.get({ id: preapprovalId })
    const estado = suscripcion?.status

    const resuelto = await resolverNegocio(supabaseAdmin, suscripcion)

    await logEvento(supabaseAdmin, {
      tipo: tipoEvento,
      data_id: String(data.id),
      estado,
      negocio_id: resuelto?.negocioId || null,
      resuelto: !!resuelto,
      payload: {
        external_reference: suscripcion?.external_reference, preapproval_plan_id: suscripcion?.preapproval_plan_id, status: estado, via: resuelto?.via,
        // En los eventos de cuota el data_id no es el de la suscripción, así
        // que se guarda aparte, junto con cómo salió el cobro: es lo que hay
        // que mirar cuando un cliente dice que le rechazaron el pago.
        ...(cuota && {
          preapproval_id: String(preapprovalId),
          cuota: { status: cuota.status, pago: cuota.payment?.status, detalle: cuota.payment?.status_detail },
        }),
      },
    })

    if (!resuelto) {
      // Pago que no se puede asociar a ningún negocio: avisar para
      // resolverlo a mano antes de que el cliente reclame.
      console.error('Webhook MP: no se pudo asociar la suscripción', preapprovalId, suscripcion?.preapproval_plan_id)
      after(() => avisarHuerfano({ dataId: preapprovalId, planId: suscripcion?.preapproval_plan_id, estado }).catch(() => {}))
      return NextResponse.json({ ok: true })
    }

    // La sincronización consulta MP y deja el plan igual a la realidad
    // (más confiable que actuar solo sobre el estado de este evento).
    await sincronizarSuscripcion(supabaseAdmin, resuelto.negocioId)

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error webhook MP:', error)
    await logEvento(supabaseAdmin, {
      tipo: 'error', estado: String(error?.message || error).slice(0, 200), resuelto: false, payload: body,
    })
    // 200 para evitar reintentos infinitos de MP ante errores nuestros
    return NextResponse.json({ ok: true })
  }
}

async function avisarHuerfano({ dataId, planId, estado }) {
  const admin = process.env.ADMIN_EMAIL
  if (!admin) return
  await enviarEmail({
    from: 'Fielty <hola@fielty.app>',
    to: admin,
    subject: '⚠️ Pago de Mercado Pago sin negocio asociado',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; padding: 24px;">
        <h2 style="font-size:18px;">Un pago no se pudo asociar a ningún negocio</h2>
        <p style="font-size:14px; color:#555; line-height:1.7;">
          Suscripción <strong>${dataId}</strong> (estado: ${estado})<br/>
          Plan de MP: <strong>${planId || 'sin plan'}</strong>
        </p>
        <p style="font-size:14px; color:#555;">Revisalo en el panel de admin para activar el plan a mano.</p>
      </div>
    `,
  })
}
