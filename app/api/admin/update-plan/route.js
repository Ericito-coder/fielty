import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'eric.bohl10@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
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

    await supabaseAdmin.from('negocios').update({ plan }).eq('id', negocioId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin update-plan error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
