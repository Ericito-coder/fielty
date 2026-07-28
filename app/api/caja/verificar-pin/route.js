import { NextResponse } from 'next/server'
import { getSupabaseAdmin, validarPinCaja, getRequestIp } from '@/lib/server'

// Verifica el PIN de caja en el servidor. El navegador nunca
// conoce el PIN real: solo recibe ok/error.
export async function POST(request) {
  try {
    const ip = getRequestIp(request)
    const { slug, sucursalSlug, pin } = await request.json()
    if (!slug || !pin) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const resultado = await validarPinCaja(supabaseAdmin, { slug, sucursalSlug, pin, ip })
    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('verificar-pin error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
