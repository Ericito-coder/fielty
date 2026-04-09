import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { clienteId, password } = await request.json()
    if (!clienteId || !password) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const hash = await bcrypt.hash(password, 10)
    await supabaseAdmin.from('clientes').update({ password_hash: hash }).eq('id', clienteId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('set-password error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
