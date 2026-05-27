import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { negocioId, clienteId, monto, pin, sucursalId } = await request.json()

    if (!negocioId || !clienteId || !monto || !pin) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const montoNum = parseInt(monto)
    if (!montoNum || montoNum < 100) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    // Validar negocio y PIN
    const { data: negocio, error: negocioError } = await supabaseAdmin
      .from('negocios')
      .select('id, pin_caja, pesos_por_punto, puntos_por_tramo')
      .eq('id', negocioId)
      .single()

    if (negocioError || !negocio) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    if (!negocio.pin_caja || pin !== negocio.pin_caja) {
      return NextResponse.json({ error: 'PIN inválido' }, { status: 401 })
    }

    // Validar que el cliente pertenece al negocio
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .select('id, puntos, puntos_historicos, visitas')
      .eq('id', clienteId)
      .eq('negocio_id', negocioId)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const pesosPorPunto = negocio.pesos_por_punto || 100
    const puntosPorTramo = negocio.puntos_por_tramo || 1
    const pts = Math.floor(montoNum / pesosPorPunto) * puntosPorTramo

    const nuevosPuntos = cliente.puntos + pts
    const nuevosHistoricos = (cliente.puntos_historicos || 0) + pts

    await supabaseAdmin
      .from('clientes')
      .update({
        puntos: nuevosPuntos,
        puntos_historicos: nuevosHistoricos,
        visitas: (cliente.visitas || 0) + 1,
        ultima_visita: new Date().toISOString()
      })
      .eq('id', cliente.id)

    let descripcion = `Compra $${montoNum.toLocaleString('es-AR')}`
    if (sucursalId) {
      const { data: suc } = await supabaseAdmin
        .from('sucursales').select('nombre').eq('id', sucursalId).single()
      if (suc) descripcion += ` — ${suc.nombre}`
    }

    await supabaseAdmin
      .from('transacciones')
      .insert([{
        cliente_id: clienteId,
        negocio_id: negocioId,
        ...(sucursalId && { sucursal_id: sucursalId }),
        tipo: 'suma',
        puntos: pts,
        descripcion
      }])

    return NextResponse.json({ ok: true, pts, nuevosPuntos, nuevosHistoricos })

  } catch (error) {
    console.error('acreditar-puntos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
