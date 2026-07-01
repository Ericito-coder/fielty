import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { clienteId, dni, nuevaPassword } = await request.json()

    if (!clienteId || !dni || !nuevaPassword) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }
    if (nuevaPassword.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    // Verificar que el cliente existe y que la contraseña actual es el DNI
    const { data: cliente } = await supabaseAdmin
      .from('clientes').select('id, dni, password_hash').eq('id', clienteId).single()

    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const ok = await bcrypt.compare(String(dni), cliente.password_hash)
    if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Actualizar contraseña en todos los registros del mismo DNI (puede estar en varios negocios)
    const nuevoHash = await bcrypt.hash(nuevaPassword, 10)
    await supabaseAdmin
      .from('clientes')
      .update({ password_hash: nuevoHash, debe_cambiar_password: false })
      .eq('dni', cliente.dni)

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('cambiar-password error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
