import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/server'
import { puedeUsarCampanas } from '@/lib/planes'
import { rateLimit } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)

// Envío de campañas puede tardar (un email por cliente)
export const maxDuration = 60

const MAX_POR_CAMPANA = 100 // límite diario del plan gratis de Resend

// Envía una campaña de email al segmento elegido. Solo el dueño
// autenticado del negocio. Guardrails: opt-out (acepta_marketing),
// máximo 1 contacto por cliente cada 30 días, tope por campaña.
export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { negocioId, segmento, asunto, mensaje } = await request.json()
    if (!negocioId || !segmento || !asunto?.trim() || !mensaje?.trim()) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select('id, nombre, color, user_id, plan')
      .eq('id', negocioId)
      .single()
    if (!negocio || negocio.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (!puedeUsarCampanas(negocio.plan)) {
      return NextResponse.json({ error: 'Las campañas están disponibles en los planes Pro y Business.' }, { status: 403 })
    }

    const { ok } = await rateLimit({ key: `campana:${negocioId}`, maxAttempts: 3, windowMs: 60 * 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Máximo 3 campañas por hora. Esperá un rato.' }, { status: 429 })

    // Armar el segmento
    const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const hace60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

    let query = supabaseAdmin
      .from('clientes')
      .select('id, nombre, email, puntos')
      .eq('negocio_id', negocioId)
      .eq('acepta_marketing', true)
      .not('email', 'is', null)
      // frecuencia: no contactar al mismo cliente más de 1 vez cada 30 días
      .or(`ultima_campana_at.is.null,ultima_campana_at.lte.${hace30}`)

    if (segmento === 'inactivos30') {
      query = query.or(`ultima_visita.is.null,ultima_visita.lte.${hace30}`)
    } else if (segmento === 'inactivos60') {
      query = query.or(`ultima_visita.is.null,ultima_visita.lte.${hace60}`)
    } else if (segmento !== 'todos') {
      return NextResponse.json({ error: 'Segmento inválido' }, { status: 400 })
    }

    const { data: clientes } = await query.limit(MAX_POR_CAMPANA)

    if (!clientes?.length) {
      return NextResponse.json({ error: 'No hay clientes para contactar en este segmento (los contactados hace menos de 30 días se omiten).' }, { status: 400 })
    }

    // Registrar la campaña antes de enviar
    const { data: campana } = await supabaseAdmin
      .from('campanas')
      .insert([{ negocio_id: negocioId, segmento, asunto: asunto.trim(), mensaje: mensaje.trim(), enviados: 0 }])
      .select()
      .single()
    if (!campana) return NextResponse.json({ error: 'Error al crear la campaña' }, { status: 500 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'
    let enviados = 0

    // Enviar en tandas de 10 para no exceder el timeout
    for (let i = 0; i < clientes.length; i += 10) {
      const tanda = clientes.slice(i, i + 10)
      const resultados = await Promise.allSettled(tanda.map(c => {
        const cuerpo = reemplazarVariables(mensaje, c, negocio)
        return resend.emails.send({
          from: 'Fielty <hola@fielty.app>',
          to: c.email,
          subject: reemplazarVariables(asunto, c, negocio),
          html: armarHtml({ cuerpo, negocio, clienteId: c.id, appUrl }),
        })
      }))
      resultados.forEach((r, j) => {
        if (r.status === 'fulfilled' && !r.value?.error) {
          enviados++
          tanda[j]._enviado = true
        }
      })
    }

    const enviadosIds = clientes.filter(c => c._enviado).map(c => c.id)
    if (enviadosIds.length) {
      await supabaseAdmin
        .from('campana_envios')
        .insert(enviadosIds.map(id => ({ campana_id: campana.id, cliente_id: id, negocio_id: negocioId })))
      await supabaseAdmin
        .from('clientes')
        .update({ ultima_campana_at: new Date().toISOString() })
        .in('id', enviadosIds)
    }
    await supabaseAdmin.from('campanas').update({ enviados }).eq('id', campana.id)

    return NextResponse.json({ ok: true, enviados, omitidos: clientes.length - enviados })
  } catch (error) {
    console.error('campanas/enviar error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

function reemplazarVariables(texto, cliente, negocio) {
  return texto
    .replaceAll('{nombre}', cliente.nombre.split(' ')[0])
    .replaceAll('{puntos}', String(cliente.puntos ?? 0))
    .replaceAll('{negocio}', negocio.nombre)
}

function escaparHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function armarHtml({ cuerpo, negocio, clienteId, appUrl }) {
  const parrafos = escaparHtml(cuerpo).split('\n').filter(Boolean)
    .map(p => `<p style="font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 16px;">${p}</p>`)
    .join('')
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
      <div style="margin-bottom: 28px; display: flex; align-items: center; gap: 10px;">
        <span style="display: inline-block; width: 34px; height: 34px; border-radius: 10px; background: ${negocio.color || '#e0001b'}; color: white; text-align: center; line-height: 34px; font-weight: 900; font-size: 13px;">${escaparHtml(negocio.nombre.slice(0, 2).toUpperCase())}</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: #0e0e0e; margin: 0 0 16px;">${escaparHtml(negocio.nombre)}</h1>
      ${parrafos}
      <a href="${appUrl}/tarjeta/${clienteId}" style="display: inline-block; background: ${negocio.color || '#e0001b'}; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; margin: 12px 0 32px;">
        Ver mi tarjeta →
      </a>
      <p style="font-size: 12px; color: #aaa; padding-top: 20px; border-top: 1px solid #e8eaf0; margin: 0;">
        Recibiste este email porque estás en el programa de puntos de ${escaparHtml(negocio.nombre)} ·
        <a href="${appUrl}/api/campanas/baja?c=${clienteId}" style="color: #aaa;">No recibir más emails</a><br/>
        Enviado con <a href="${appUrl}" style="color: #aaa; text-decoration: none;">Fielty</a>
      </p>
    </div>
  `
}
