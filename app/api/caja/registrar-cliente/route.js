import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, validarPinCaja } from '@/lib/server'

export async function POST(request) {
  try {
    const { negocioId, sucursalId, nombre, dni, email, telefono, monto, pin } = await request.json()

    if (!negocioId || !nombre || !dni || !pin) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Valida el PIN del negocio o de la sucursal (puede tener PIN propio)
    const auth = await validarPinCaja(supabaseAdmin, { negocioId, sucursalId, pin })
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { negocio } = auth

    // Verificar límite del plan
    const { count } = await supabaseAdmin
      .from('clientes').select('*', { count: 'exact', head: true }).eq('negocio_id', negocioId)

    if (negocio.plan === 'gratis' && count >= 50) {
      return NextResponse.json({ error: 'Límite de clientes alcanzado en el plan gratuito' }, { status: 403 })
    }

    // Verificar duplicado por DNI en este negocio
    const { data: existente } = await supabaseAdmin
      .from('clientes').select('id').eq('negocio_id', negocioId).eq('dni', dni).maybeSingle()

    if (existente) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese DNI en este negocio' }, { status: 409 })
    }

    // Calcular puntos: bienvenida + consumo (si se ingresó monto)
    const puntosBienvenida = negocio.puntos_bienvenida || 10
    const ptsConsumo = monto
      ? Math.round(parseInt(monto) / (negocio.pesos_por_punto || 100) * (negocio.puntos_por_tramo || 1))
      : 0
    const puntosIniciales = puntosBienvenida + ptsConsumo

    const passwordHash = await bcrypt.hash(String(dni), 10)

    const { data, error: insertError } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombre,
        dni: String(dni),
        email: email || null,
        telefono: telefono || null,
        negocio_id: negocioId,
        puntos: puntosIniciales,
        puntos_historicos: puntosIniciales,
        password_hash: passwordHash,
        debe_cambiar_password: true,
      }])
      .select()

    if (insertError) {
      console.error('Error insertando cliente desde caja:', insertError)
      return NextResponse.json({ error: 'Error al registrar, intentá de nuevo' }, { status: 500 })
    }

    // Solo los campos que la caja necesita (nunca password_hash)
    const { id, nombre: nombreCliente, dni: dniCliente, puntos, puntos_historicos } = data[0]

    return NextResponse.json({
      ok: true,
      cliente: { id, nombre: nombreCliente, dni: dniCliente, puntos, puntos_historicos },
      puntosBienvenida,
      ptsConsumo,
      puntosIniciales,
    })

  } catch (error) {
    console.error('registrar-cliente caja error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
