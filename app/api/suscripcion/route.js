import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago'
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
    // Solo el dueño autenticado puede contratar una suscripción para SU negocio
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { negocioId, plan, email } = await request.json()

    const precioMap = {
      pro: 20000,
      pro_early: 10000,
      business: 35000,
    }

    if (!negocioId || !precioMap[plan]) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select('id, user_id, nombre')
      .eq('id', negocioId)
      .single()

    if (!negocio || negocio.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const precio = precioMap[plan]

    const preApprovalPlan = new PreApprovalPlan(client)

    const resultado = await preApprovalPlan.create({
      body: {
        // El nombre del negocio va en el reason: si el mismo dueño paga
        // por varios negocios, en Mercado Pago se distingue cuál es cuál
        // (antes las tres suscripciones se veían idénticas).
        reason: `Fielty ${plan === 'business' ? 'Business' : 'Pro'} — ${(negocio.nombre || '').slice(0, 60)}`.trim(),
        // Clave para poder asociar el pago al negocio desde el webhook
        // o desde la verificación activa, sin depender de mp_plan_id.
        external_reference: negocioId,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: precio,
          currency_id: 'ARS',
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'}/dashboard?suscripcion=ok`,
        payment_methods_allowed: {
          payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }],
        },
      }
    })

    // Historial de intentos: nunca se sobreescribe, así un pago hecho
    // con un link anterior sigue siendo atribuible a este negocio.
    await supabaseAdmin
      .from('suscripciones')
      .insert([{ negocio_id: negocioId, mp_plan_id: resultado.id, plan_tipo: plan, estado: 'pendiente' }])

    // Campo legacy: sigue apuntando al último intento
    await supabaseAdmin
      .from('negocios')
      .update({ mp_plan_id: resultado.id, mp_plan_tipo: plan })
      .eq('id', negocioId)

    return NextResponse.json({
      init_point: resultado.init_point,
      id: resultado.id
    })

  } catch (error) {
    console.error('Error MP:', error)
    return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 })
  }
}