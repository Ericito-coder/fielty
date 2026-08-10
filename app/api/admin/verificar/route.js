import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRequestIp } from '@/lib/server'
import { rateLimit } from '@/lib/rateLimit'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Confirma contra el servidor que la sesión es la del admin. Existe para
// las páginas del panel que no piden datos a ninguna otra ruta: antes
// comparaban el email en el navegador contra NEXT_PUBLIC_ADMIN_EMAIL, que
// quedaba escrito en el bundle a la vista de cualquiera.
export async function GET(request) {
  try {
    const { ok } = await rateLimit({ key: `admin-auth:${getRequestIp(request)}`, maxAttempts: 30, windowMs: 15 * 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento.' }, { status: 429 })

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('admin/verificar error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
