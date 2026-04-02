import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
})

export async function POST(request) {
  try {
    const { negocioId, plan, email } = await request.json()

    const precioMap = {
      pro: 20000,
      pro_early: 10000,
      business: 35000,
    }

    const precio = precioMap[plan] || 20000

    const preApprovalPlan = new PreApprovalPlan(client)

    const resultado = await preApprovalPlan.create({
      body: {
        reason: `Fielty ${plan === 'pro_early' ? 'Pro (Early Adopter)' : plan === 'pro' ? 'Pro' : 'Business'}`,
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

    return NextResponse.json({ 
      init_point: resultado.init_point,
      id: resultado.id 
    })

  } catch (error) {
    console.error('Error MP:', error)
    return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 })
  }
}