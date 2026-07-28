import { NextResponse } from 'next/server'
import { getSupabaseAdmin, validarPinCaja, getRequestIp } from '@/lib/server'

// Marca un canje como usado. fn_confirmar_canje solo lo hace si
// sigue pendiente y no venció, así dos cajas no pueden confirmar
// el mismo código dos veces.
export async function POST(request) {
  try {
    const { negocioId, sucursalId, pin, canjeId } = await request.json()
    if (!negocioId || !canjeId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const auth = await validarPinCaja(supabaseAdmin, { negocioId, sucursalId, pin, ip: getRequestIp(request) })
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    // El canje debe ser de este negocio
    const { data: canje } = await supabaseAdmin
      .from('canjes')
      .select('id, negocio_id')
      .eq('id', canjeId)
      .eq('negocio_id', negocioId)
      .maybeSingle()
    if (!canje) return NextResponse.json({ error: 'Canje no encontrado' }, { status: 404 })

    const { data: confirmado, error } = await supabaseAdmin.rpc('fn_confirmar_canje', {
      p_canje_id: canjeId,
      p_sucursal_id: sucursalId || null,
    })

    if (error) {
      console.error('fn_confirmar_canje error:', error)
      return NextResponse.json({ error: 'Error al confirmar' }, { status: 500 })
    }
    if (!confirmado) {
      return NextResponse.json({ error: 'Este canje ya fue usado o venció' }, { status: 409 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('confirmar-canje error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
