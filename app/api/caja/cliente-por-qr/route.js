import { NextResponse } from 'next/server'
import { getSupabaseAdmin, validarPinCaja, getRequestIp } from '@/lib/server'

// Identifica a un cliente por su ID (escaneado del QR de su tarjeta
// o pase de Wallet) desde la caja. Valida el PIN y que el cliente
// pertenezca a ESTE negocio — un QR de otro negocio se rechaza.
export async function POST(request) {
  try {
    const { negocioId, sucursalId, pin, clienteId } = await request.json()
    if (!negocioId || !clienteId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const auth = await validarPinCaja(supabaseAdmin, { negocioId, sucursalId, pin, ip: getRequestIp(request) })
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, dni, telefono, email, puntos, puntos_historicos')
      .eq('id', clienteId)
      .eq('negocio_id', negocioId)
      .maybeSingle()

    if (!cliente) {
      return NextResponse.json({ error: 'Esa tarjeta no es de este negocio' }, { status: 404 })
    }

    return NextResponse.json({ cliente })
  } catch (error) {
    console.error('cliente-por-qr error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
