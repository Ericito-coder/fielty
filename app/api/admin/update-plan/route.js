import { NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRequestIp } from '@/lib/server'
import { sincronizarClaseWallet } from '@/lib/googleWallet'
import { rateLimit } from '@/lib/rateLimit'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { ok } = await rateLimit({ key: `admin-auth:${getRequestIp(request)}`, maxAttempts: 30, windowMs: 15 * 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento.' }, { status: 429 })

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { negocioId, plan } = await request.json()
    const planesValidos = ['gratis', 'pro_early', 'pro', 'business']
    if (!negocioId || !planesValidos.includes(plan)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    // Un plan pago puesto a mano es una excepción: se marca para que el cron
    // que sincroniza con Mercado Pago no lo baje a gratis al no encontrar
    // ninguna suscripción activa. Volver a gratis quita la excepción.
    await supabaseAdmin
      .from('negocios')
      .update({ plan, plan_manual: plan !== 'gratis' })
      .eq('id', negocioId)

    // El logo propio es feature de pago: al cambiar el plan cambia lo que
    // tiene que mostrar el pase. Los cambios automáticos ya lo hacen desde
    // sincronizarSuscripcion; este es el camino manual.
    after(() => sincronizarClaseWallet(negocioId))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin update-plan error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
