import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { negocioId, nombre, dni, monto, pin } = await request.json()

    if (!negocioId || !nombre || !dni || !pin) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const { data: negocio } = await supabaseAdmin
      .from('negocios').select('*').eq('id', negocioId).single()

    if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

    // Verificar PIN
    const pinReal = negocio.pin_caja
    if (!pinReal || pin !== pinReal) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    }

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

    return NextResponse.json({
      ok: true,
      cliente: data[0],
      puntosBienvenida,
      ptsConsumo,
      puntosIniciales,
    })

  } catch (error) {
    console.error('registrar-cliente caja error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
