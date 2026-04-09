import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single()

    if (!cliente) return NextResponse.json({ error: 'El link es inválido o ya fue usado' }, { status: 400 })
    if (new Date(cliente.reset_token_expires) < new Date()) {
      return NextResponse.json({ error: 'El link expiró. Pedí uno nuevo.' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    await supabaseAdmin.from('clientes').update({
      password_hash: hash,
      reset_token: null,
      reset_token_expires: null,
    }).eq('id', cliente.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('reset-password error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
