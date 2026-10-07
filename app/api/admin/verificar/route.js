import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verificarAdmin } from '@/lib/server'

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
    const admin = await verificarAdmin(supabaseAdmin, request)
    if (admin.error) return NextResponse.json({ error: admin.error, mfa: admin.mfa }, { status: admin.status })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('admin/verificar error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
