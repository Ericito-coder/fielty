import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { dni, password } = await request.json()
    if (!dni || !password) return NextResponse.json({ error: 'Ingresá tu DNI y contraseña' }, { status: 400 })

    const { data: clientes } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, negocio_id, password_hash, negocio:negocios(nombre, color)')
      .eq('dni', dni)

    if (!clientes || clientes.length === 0) {
      return NextResponse.json({ error: 'DNI o contraseña incorrectos' }, { status: 401 })
    }

    // Verificar contraseña contra el primer registro que tenga hash
    const conHash = clientes.find(c => c.password_hash)
    if (!conHash) {
      return NextResponse.json({ error: 'Esta cuenta no tiene contraseña configurada. Contactá al negocio.' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, conHash.password_hash)
    if (!ok) {
      return NextResponse.json({ error: 'DNI o contraseña incorrectos' }, { status: 401 })
    }

    // Devolver todas las tarjetas del cliente (puede estar en varios negocios)
    const tarjetas = clientes.map(c => ({
      id: c.id,
      negocioNombre: c.negocio?.nombre,
      negocioColor: c.negocio?.color,
      nombre: c.nombre,
    }))

    return NextResponse.json({ ok: true, tarjetas })
  } catch (error) {
    console.error('login cliente error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
