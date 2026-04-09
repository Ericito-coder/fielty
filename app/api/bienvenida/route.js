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

    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select('nombre, slug, user_id')
      .eq('id', negocioId)
      .single()

    if (!negocio) return NextResponse.json({ ok: true })

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(negocio.user_id)
    if (!user?.email) return NextResponse.json({ ok: true })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'
    const registroUrl = `${appUrl}/registro/${negocio.slug}`
    const dashboardUrl = `${appUrl}/dashboard`

    await resend.emails.send({
      from: 'Fielty <onboarding@resend.dev>',
      to: user.email,
      subject: `¡Bienvenido a Fielty, ${negocio.nombre}! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">

          <div style="margin-bottom: 32px;">
            <span style="font-size: 22px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
          </div>

          <h1 style="font-size: 26px; font-weight: 800; color: #0e0e0e; margin-bottom: 8px;">
            ¡Tu programa de fidelización está listo! 🎉
          </h1>
          <p style="font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 32px;">
            <strong>${negocio.nombre}</strong> ya está activo en Fielty. Tus clientes pueden empezar a acumular puntos y canjear recompensas hoy mismo.
          </p>

          <!-- Link de registro -->
          <div style="background: #f5f6fa; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin: 0 0 8px;">Link de registro para tus clientes</p>
            <p style="font-size: 14px; color: #0e0e0e; font-family: monospace; word-break: break-all; margin: 0 0 12px;">${registroUrl}</p>
            <a href="${registroUrl}" style="display: inline-block; background: #0e0e0e; color: white; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none;">
              Ver página de registro
            </a>
          </div>

          <!-- Próximos pasos -->
          <div style="margin-bottom: 32px;">
            <p style="font-size: 14px; font-weight: 700; color: #0e0e0e; margin-bottom: 14px;">3 pasos para empezar:</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: #e0001b; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; text-align: center; line-height: 24px;">1</div>
                <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.6;">Imprimí el QR y poné en el mostrador — tus clientes escanean para registrarse.</p>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: #e0001b; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; text-align: center; line-height: 24px;">2</div>
                <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.6;">Usá la caja (<strong>fielty.app/c/${negocio.slug}</strong>) para acreditar puntos en cada compra.</p>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: #e0001b; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; text-align: center; line-height: 24px;">3</div>
                <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.6;">Seguí las métricas desde tu panel y ajustá las recompensas cuando quieras.</p>
              </div>
            </div>
          </div>

          <a href="${dashboardUrl}" style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; margin-bottom: 40px;">
            Ir a mi panel →
          </a>

          <p style="font-size: 13px; color: #888; line-height: 1.6; margin-bottom: 4px;">
            ¿Tenés alguna duda? Respondé este email y te ayudamos.
          </p>
          <p style="font-size: 12px; color: #aaa; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8eaf0;">
            Fielty · <a href="${appUrl}" style="color: #aaa; text-decoration: none;">fielty.app</a> ·
            <a href="${appUrl}/terminos" style="color: #aaa; text-decoration: none;">Términos</a> ·
            <a href="${appUrl}/privacidad" style="color: #aaa; text-decoration: none;">Privacidad</a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error bienvenida:', error)
    return NextResponse.json({ ok: true })
  }
}
