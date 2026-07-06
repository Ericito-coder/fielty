import { NextResponse } from 'next/server'
import { getSupabaseAdmin, NEGOCIO_CAMPOS_PUBLICOS } from '@/lib/server'
import { generarLinkWallet, walletDisponible } from '@/lib/googleWallet'
import { puedeUsarWallet } from '@/lib/planes'
import { rateLimit } from '@/lib/rateLimit'

// Devuelve el link "Agregar a Google Wallet" del cliente.
export async function GET(request) {
  try {
    if (!walletDisponible()) {
      return NextResponse.json({ error: 'Google Wallet no está configurado' }, { status: 501 })
    }

    const clienteId = new URL(request.url).searchParams.get('cliente')
    if (!clienteId) return NextResponse.json({ error: 'Falta cliente' }, { status: 400 })

    const { ok } = await rateLimit({ key: `wallet:${clienteId}`, maxAttempts: 10, windowMs: 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select(`id, nombre, puntos, puntos_historicos, negocio_id, negocio:negocios(${NEGOCIO_CAMPOS_PUBLICOS})`)
      .eq('id', clienteId)
      .single()

    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const { data: planNegocio } = await supabaseAdmin
      .from('negocios')
      .select('plan')
      .eq('id', cliente.negocio_id)
      .single()
    if (!puedeUsarWallet(planNegocio?.plan)) {
      return NextResponse.json({ error: 'Google Wallet está disponible en el plan Business' }, { status: 403 })
    }

    const { data: recompensas } = await supabaseAdmin
      .from('recompensas')
      .select('nombre, puntos_necesarios')
      .eq('negocio_id', cliente.negocio_id)
      .eq('activa', true)

    const url = await generarLinkWallet(cliente, cliente.negocio, recompensas || [])
    return NextResponse.json({ ok: true, url })
  } catch (error) {
    console.error('wallet save-link error:', error?.message)
    return NextResponse.json({ error: 'No se pudo generar el pase. Intentá más tarde.' }, { status: 500 })
  }
}
