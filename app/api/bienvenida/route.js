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
    // Solo el dueño autenticado puede disparar su email de bienvenida
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { negocioId } = await request.json()

    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select('nombre, slug, user_id')
      .eq('id', negocioId)
      .single()

    if (!negocio) return NextResponse.json({ ok: true })
    if (negocio.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (!user.email) return NextResponse.json({ ok: true })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'
    const registroUrl = `${appUrl}/registro/${negocio.slug}`
    const dashboardUrl = `${appUrl}/dashboard`

    await resend.emails.send({
      from: 'Fielty <hola@fielty.app>',
      to: user.email,
      subject: `Tu programa de fidelización está listo — ${negocio.nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">

          <div style="margin-bottom: 32px;">
            <span style="font-size: 22px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
          </div>

          <h1 style="font-size: 26px; font-weight: 800; color: #0e0e0e; margin-bottom: 8px;">
            Tu programa de fidelización esta listo
          </h1>
          <p style="font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 32px;">
            <strong>${negocio.nombre}</strong> ya esta activo en Fielty. Tus clientes pueden empezar a acumular puntos y canjear recompensas hoy mismo.
          </p>

          <!-- Link de registro -->
          <div style="background: #f5f6fa; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin: 0 0 8px;">Link de registro para tus clientes</p>
            <p style="font-size: 14px; color: #0e0e0e; font-family: monospace; word-break: break-all; margin: 0 0 12px;">${registroUrl}</p>
            <a href="${registroUrl}" style="display: inline-block; background: #0e0e0e; color: white; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none;">
              Ver pagina de registro
            </a>
          </div>

          <!-- Próximos pasos -->
          <div style="margin-bottom: 24px;">
            <p style="font-size: 14px; font-weight: 700; color: #0e0e0e; margin: 0 0 16px;">3 pasos para empezar:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 36px; vertical-align: top; padding-bottom: 16px;">
                  <div style="width: 26px; height: 26px; border-radius: 50%; background: #e0001b; text-align: center; line-height: 26px; font-size: 13px; font-weight: 800; color: white;">1</div>
                </td>
                <td style="vertical-align: top; padding-bottom: 16px; padding-left: 12px;">
                  <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.7; padding-top: 3px;">Imprimí el QR y ponelo en el mostrador — tus clientes lo escanean para registrarse.</p>
                </td>
              </tr>
              <tr>
                <td style="width: 36px; vertical-align: top; padding-bottom: 16px;">
                  <div style="width: 26px; height: 26px; border-radius: 50%; background: #e0001b; text-align: center; line-height: 26px; font-size: 13px; font-weight: 800; color: white;">2</div>
                </td>
                <td style="vertical-align: top; padding-bottom: 16px; padding-left: 12px;">
                  <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.7; padding-top: 3px;">Usa la caja (<strong style="color: #0e0e0e;">fielty.app/c/${negocio.slug}</strong>) para acreditar puntos en cada compra.</p>
                </td>
              </tr>
              <tr>
                <td style="width: 36px; vertical-align: top;">
                  <div style="width: 26px; height: 26px; border-radius: 50%; background: #e0001b; text-align: center; line-height: 26px; font-size: 13px; font-weight: 800; color: white;">3</div>
                </td>
                <td style="vertical-align: top; padding-left: 12px;">
                  <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.7; padding-top: 3px;">Seguí las métricas desde tu panel y ajustá las recompensas cuando quieras.</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Nota PIN -->
          <div style="background: #fff8e6; border-left: 3px solid #f0a500; padding: 14px 18px; margin-bottom: 32px;">
            <p style="font-size: 13px; color: #7a5800; margin: 0; line-height: 1.6;">
              <strong>Importante:</strong> antes de usar la caja, configura tu PIN de acceso desde el panel en <a href="${dashboardUrl}" style="color: #7a5800; font-weight: 700;">Configuracion</a>. Esto protege el acceso al sistema de puntos de tu negocio.
            </p>
          </div>

          <a href="${dashboardUrl}" style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; margin-bottom: 40px;">
            Ir a mi panel
          </a>

          <p style="font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 4px;">
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
