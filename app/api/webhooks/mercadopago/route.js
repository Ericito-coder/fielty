import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, data } = body

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
