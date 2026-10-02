import { NextResponse } from 'next/server'
import { enviarEmail } from '@/lib/email'
import { getSupabaseAdmin, getRequestIp } from '@/lib/server'
import { rateLimit } from '@/lib/rateLimit'

// Reset de contraseña del dueño.
//
// Antes lo mandaba Supabase Auth (resetPasswordForEmail) con su plantilla
// por defecto: llegaba en inglés ("Reset Your Password") y sin nada que
// dijera Fielty. Esa plantilla vive en el panel de Supabase, fuera del
// repo. Acá a Supabase se le pide solo el link y el mail lo mandamos
// nosotros, igual que el de los clientes (/api/cliente/forgot-password).
//
// El link es el mismo que generaba Supabase: verifica el token y vuelve a
// /reset-password con la sesión puesta, así que esa página no cambia.
export async function POST(request) {
  try {
    const { ok: sinBloqueo } = await rateLimit({ key: `forgot-dueno:${getRequestIp(request)}`, maxAttempts: 5, windowMs: 60 * 60 * 1000 })
    if (!sinBloqueo) {
      return NextResponse.json({ ok: true }) // Respuesta genérica para no revelar el bloqueo
    }

    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Ingresá tu email' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'

    // Vuelve al mismo dominio desde el que se pidió, que es lo que hacía
    // el navegador con window.location.origin: así sigue valiendo la lista
    // de URLs de redirección que ya está cargada en Supabase.
    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
      type: 'recovery',
      email: String(email).trim(),
      options: { redirectTo: `${new URL(request.url).origin}/reset-password` },
    })

    // Sin cuenta con ese email Supabase devuelve error. Siempre responder
    // ok para no revelar si el email existe.
    const resetUrl = data?.properties?.action_link
    if (error || !resetUrl) {
      return NextResponse.json({ ok: true })
    }

    await enviarEmail({
      from: 'Fielty <hola@fielty.app>',
      to: String(email).trim(),
      subject: 'Recuperá tu contraseña de Fielty',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <div style="margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #0e0e0e; margin-bottom: 8px;">Recuperá tu contraseña</h1>
          <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 32px;">
            Recibimos un pedido para cambiar la contraseña de tu cuenta de Fielty. Hacé click en el botón para crear una nueva.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; margin-bottom: 32px;">
            Resetear contraseña →
          </a>
          <p style="font-size: 13px; color: #666; line-height: 1.6;">
            El link se puede usar una sola vez. Si no pediste este email, ignoralo: tu contraseña sigue siendo la misma.
          </p>
          <p style="font-size: 12px; color: #aaa; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e8eaf0;">
            Fielty · <a href="${appUrl}" style="color: #aaa; text-decoration: none;">fielty.app</a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('dueno/forgot-password error:', error)
    return NextResponse.json({ ok: true })
  }
}
