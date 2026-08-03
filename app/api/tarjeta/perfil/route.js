import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { rateLimit } from '@/lib/rateLimit'

// El cliente edita sus propios datos desde la tarjeta. La autorización es
// la misma que en el resto de /tarjeta: conocer el UUID es tener la
// tarjeta. El email NO se puede tocar acá — es la clave con la que entra
// el que se registró con Google, y cambiarlo movería la tarjeta a otra
// cuenta.

export async function POST(request) {
  try {
    const body = await request.json()
    const { clienteId } = body

    if (!clienteId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const { ok } = await rateLimit({ key: `perfil:${clienteId}`, maxAttempts: 10, windowMs: 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento.' }, { status: 429 })

    const supabaseAdmin = getSupabaseAdmin()

    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id, negocio_id, password_hash')
      .eq('id', clienteId)
      .single()

    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const nombre = String(body.nombre || '').trim()
    const dni = String(body.dni || '').trim()
    const telefono = String(body.telefono || '').trim()
    const fechaNacimiento = body.fechaNacimiento || null

    if (!nombre) return NextResponse.json({ error: 'Ingresá tu nombre' }, { status: 400 })

    // Las cuentas con contraseña entran con DNI + contraseña: si lo borran
    // se quedan afuera de su propia tarjeta.
    if (cliente.password_hash && !dni) {
      return NextResponse.json({ error: 'Necesitás mantener tu DNI: es con lo que entrás a tu tarjeta.' }, { status: 400 })
    }

    // Duplicados dentro del mismo negocio (excluyendo la propia tarjeta)
    if (dni) {
      const { data: otro } = await supabaseAdmin
        .from('clientes').select('id')
        .eq('negocio_id', cliente.negocio_id).eq('dni', dni).neq('id', clienteId).limit(1)
      if (otro?.length > 0) {
        return NextResponse.json({ error: 'Ese DNI ya está usado por otra tarjeta de este negocio.' }, { status: 409 })
      }
    }

    if (telefono) {
      const { data: otro } = await supabaseAdmin
        .from('clientes').select('id')
        .eq('negocio_id', cliente.negocio_id).eq('telefono', telefono).neq('id', clienteId).limit(1)
      if (otro?.length > 0) {
        return NextResponse.json({ error: 'Ese WhatsApp ya está usado por otra tarjeta de este negocio.' }, { status: 409 })
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('clientes')
      .update({
        nombre,
        dni: dni || null,
        telefono: telefono || null,
        fecha_nacimiento: fechaNacimiento || null,
      })
      .eq('id', clienteId)

    if (updateError) {
      console.error('Error actualizando perfil:', updateError)
      return NextResponse.json({ error: 'Hubo un error, intentá de nuevo' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      cliente: { nombre, dni: dni || null, telefono: telefono || null, fecha_nacimiento: fechaNacimiento || null },
    })
  } catch (error) {
    console.error('perfil error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
