import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { negocioId } = await request.json()

    // Contar clientes del negocio
    const { count } = await supabaseAdmin
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocioId)

    // Solo notificar en 45 (aviso) y 50 (límite alcanzado)
    if (count !== 45 && count !== 50) {
      return NextResponse.json({ ok: true })
    }

    // Obtener datos del negocio y email del dueño
    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select('nombre, user_id, plan')
      .eq('id', negocioId)
      .single()

    if (!negocio || negocio.plan !== 'gratis') {
      return NextResponse.json({ ok: true })
    }

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(negocio.user_id)
    if (!user?.email) return NextResponse.json({ ok: true })

    const esLimite = count === 50
    const asunto = esLimite
      ? `⚠️ Llegaste al límite de clientes en Fielty`
      : `📊 Te quedan 5 clientes para el límite en Fielty`

    const html = esLimite ? `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 22px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0e0e0e; margin-bottom: 8px;">Llegaste al límite de 50 clientes</h1>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
          Hola, tu negocio <strong>${negocio.nombre}</strong> alcanzó los 50 clientes del plan Gratis.
          A partir de ahora, los nuevos clientes no van a poder registrarse.
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 32px;">
          Pasate al plan Pro para tener clientes ilimitados y seguir haciendo crecer tu programa de fidelización.
        </p>
        <a href="https://www.fielty.app/dashboard/upgrade"
           style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none;">
          Ver planes →
        </a>
        <p style="font-size: 12px; color: #aaa; margin-top: 40px;">
          Este es un mensaje automático de Fielty · <a href="https://www.fielty.app" style="color: #aaa;">fielty.app</a>
        </p>
      </div>
    ` : `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 22px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0e0e0e; margin-bottom: 8px;">Te quedan 5 clientes para el límite</h1>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
          Hola, tu negocio <strong>${negocio.nombre}</strong> ya tiene 45 clientes registrados.
          El plan Gratis permite hasta 50.
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 32px;">
          Si querés seguir creciendo, pasate al plan Pro antes de llegar al límite.
        </p>
        <a href="https://www.fielty.app/dashboard/upgrade"
           style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none;">
          Ver planes →
        </a>
        <p style="font-size: 12px; color: #aaa; margin-top: 40px;">
          Este es un mensaje automático de Fielty · <a href="https://www.fielty.app" style="color: #aaa;">fielty.app</a>
        </p>
      </div>
    `

    await resend.emails.send({
      from: 'Fielty <onboarding@resend.dev>',
      to: user.email,
      subject: asunto,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error notificar-limite:', error)
    return NextResponse.json({ ok: true }) // No bloqueamos el flujo si falla el email
  }
}
