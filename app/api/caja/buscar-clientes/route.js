import { NextResponse } from 'next/server'
import { getSupabaseAdmin, validarPinCaja, getRequestIp } from '@/lib/server'

// Búsqueda de clientes desde la caja. Requiere el PIN en cada
// request y devuelve solo los campos que la caja necesita.
export async function POST(request) {
  try {
    const { negocioId, sucursalId, pin, q } = await request.json()
    if (!negocioId || !q) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const auth = await validarPinCaja(supabaseAdmin, { negocioId, sucursalId, pin, ip: getRequestIp(request) })
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    // Sin comas/paréntesis/porcentajes: son sintaxis de filtro PostgREST
    const termino = String(q).replace(/[,()%]/g, '').trim()
    if (termino.length < 2) return NextResponse.json({ clientes: [] })

    // También por teléfono y email: los clientes que se registran con
    // Google no tienen DNI cargado, así que el DNI solo no alcanza.
    const { data: clientes } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, dni, telefono, email, puntos, puntos_historicos')
      .eq('negocio_id', negocioId)
      .or(`nombre.ilike.%${termino}%,dni.ilike.%${termino}%,telefono.ilike.%${termino}%,email.ilike.%${termino}%`)
      .limit(8)

    return NextResponse.json({ clientes: clientes || [] })
  } catch (error) {
    console.error('buscar-clientes error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
