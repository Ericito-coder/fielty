import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Valida el header x-signature que manda MP (HMAC-SHA256 sobre
// "id:{dataId};request-id:{x-request-id};ts:{ts};" con la "Firma
// secreta" del webhook, no con el access token). Se activa solo si
// MP_WEBHOOK_SECRET está configurado (Tus integraciones → Webhooks
// en el dashboard de MP); si no está seteado, no bloquea — así no
// rompe el webhook mientras tanto y solo suma una capa extra al
// secreto por query que ya se valida siempre.
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

export async function POST(request) {
  try {
    // Validar secret para que solo MP pueda disparar este webhook
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    if (!firmaMpValida(request, searchParams, data?.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Solo procesamos eventos de suscripciones
    if (type !== 'subscription_preapproval') {
      return NextResponse.json({ ok: true })
    }

    // Traer los detalles de la suscripción desde MP
    const preApproval = new PreApproval(client)
    const suscripcion = await preApproval.get({ id: data.id })

    const { preapproval_plan_id, status } = suscripcion

    // Buscar el negocio por el plan ID que guardamos al crear
    const { data: negocio, error } = await supabaseAdmin
      .from('negocios')
      .select('id, mp_plan_tipo')
      .eq('mp_plan_id', preapproval_plan_id)
      .single()

    if (error || !negocio) {
      console.error('Webhook MP: negocio no encontrado para plan', preapproval_plan_id)
      return NextResponse.json({ ok: true }) // Devolvemos 200 igual para que MP no reintente
    }

    if (status === 'authorized') {
      // Pago aprobado: activar el plan
      await supabaseAdmin
        .from('negocios')
        .update({ plan: negocio.mp_plan_tipo })
        .eq('id', negocio.id)

    } else if (status === 'cancelled' || status === 'paused') {
      // Suscripción cancelada o pausada: volver a gratis
      await supabaseAdmin
        .from('negocios')
        .update({ plan: 'gratis' })
        .eq('id', negocio.id)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error webhook MP:', error)
    // Devolvemos 200 para evitar reintentos de MP ante errores internos nuestros
    return NextResponse.json({ ok: true })
  }
}
