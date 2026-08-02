import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rateLimit'
import { verificarGoogleToken } from '@/lib/googleToken'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { ok: rateLimitOk } = await rateLimit({ key: `login-google:${ip}`, maxAttempts: 10, windowMs: 15 * 60 * 1000 })
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Demasiados intentos. Esperá 15 minutos e intentá de nuevo.' }, { status: 429 })
    }

    const { googleToken } = await request.json()
    const google = await verificarGoogleToken(googleToken)
    if (!google) {
      return NextResponse.json({ error: 'No pudimos verificar tu cuenta de Google. Probá de nuevo.' }, { status: 401 })
    }

    // Matchea cualquier tarjeta con ese email, se haya registrado con
    // Google o la haya creado el negocio en el mostrador con su email.
    const { data: clientes } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, negocio_id, negocio:negocios(nombre, color)')
      .ilike('email', google.email)

    if (!clientes || clientes.length === 0) {
      return NextResponse.json({ error: `No encontramos ninguna tarjeta con ${google.email}. Si te registraron en el mostrador, ingresá con tu DNI y contraseña.` }, { status: 404 })
    }

    const tarjetas = clientes.map(c => ({
      id: c.id,
      negocioNombre: c.negocio?.nombre,
      negocioColor: c.negocio?.color,
      nombre: c.nombre,
    }))

    return NextResponse.json({ ok: true, tarjetas })
  } catch (error) {
    console.error('login-google cliente error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
