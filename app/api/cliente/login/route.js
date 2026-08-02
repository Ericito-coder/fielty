import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rateLimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { ok: rateLimitOk } = await rateLimit({ key: `login:${ip}`, maxAttempts: 5, windowMs: 15 * 60 * 1000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Demasiados intentos. Esperá 15 minutos e intentá de nuevo.' }, { status: 429 })
    }

    const { dni, password } = await request.json()
    if (!dni || !password) return NextResponse.json({ error: 'Ingresá tu DNI y contraseña' }, { status: 400 })

    const { data: clientes } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, negocio_id, password_hash, debe_cambiar_password, via_google, negocio:negocios(nombre, color)')
      .eq('dni', dni)

    if (!clientes || clientes.length === 0) {
      return NextResponse.json({ error: 'DNI o contraseña incorrectos' }, { status: 401 })
    }

    // Verificar contraseña contra el primer registro que tenga hash
    const conHash = clientes.find(c => c.password_hash)
    if (!conHash) {
      if (clientes.some(c => c.via_google)) {
        return NextResponse.json({ error: 'Tu cuenta se creó con Google. Tocá "Continuar con Google" para entrar.' }, { status: 401 })
      }
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

    return NextResponse.json({ ok: true, tarjetas, debe_cambiar_password: conHash.debe_cambiar_password || false, clienteId: conHash.id })
  } catch (error) {
    console.error('login cliente error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
