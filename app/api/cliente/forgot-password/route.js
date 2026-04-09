import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Ingresá tu email' }, { status: 400 })

    const { data: clientes } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre')
      .eq('email', email)
      .limit(1)

    // Siempre responder ok para no revelar si el email existe
    if (!clientes || clientes.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const cliente = clientes[0]
    const token = randomBytes(32).toString('hex')
    const expira = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

    await supabaseAdmin.from('clientes').update({
      reset_token: token,
      reset_token_expires: expira.toISOString(),
    }).eq('id', cliente.id)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'
    const resetUrl = `${appUrl}/mi-tarjeta/reset?token=${token}`

    await resend.emails.send({
      from: 'Fielty <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperá tu contraseña de Fielty',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <div style="margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #0e0e0e; margin-bottom: 8px;">Recuperá tu contraseña</h1>
          <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 32px;">
            Hola ${cliente.nombre}, recibimos una solicitud para resetear tu contraseña. Hacé click en el botón para crear una nueva.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; margin-bottom: 32px;">
            Resetear contraseña →
          </a>
          <p style="font-size: 13px; color: #888; line-height: 1.6;">
            Este link expira en 1 hora. Si no pediste este email, ignoralo.
          </p>
          <p style="font-size: 12px; color: #aaa; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8eaf0;">
            Fielty · <a href="${appUrl}" style="color: #aaa; text-decoration: none;">fielty.app</a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('forgot-password error:', error)
    return NextResponse.json({ ok: true })
  }
}
