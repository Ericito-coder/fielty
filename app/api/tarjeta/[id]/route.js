import { NextResponse } from 'next/server'
import { getSupabaseAdmin, NEGOCIO_CAMPOS_PUBLICOS } from '@/lib/server'
import { walletDisponible } from '@/lib/googleWallet'
import { puedeUsarWallet } from '@/lib/planes'

// Datos completos de la tarjeta del cliente: datos propios (sin
// password_hash ni otros campos sensibles), recompensas activas,
// canje pendiente e historial. Antes de responder, expira los
// canjes vencidos y devuelve esos puntos al saldo.
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const supabaseAdmin = getSupabaseAdmin()

    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select(`id, nombre, puntos, puntos_historicos, visitas, ultima_visita, negocio_id, negocio:negocios(${NEGOCIO_CAMPOS_PUBLICOS})`)
      .eq('id', id)
      .single()

    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    // Canjes pendientes ya vencidos: expirar y devolver puntos
    const { data: vencidos } = await supabaseAdmin
      .from('canjes')
      .select('id')
      .eq('cliente_id', id)
      .eq('estado', 'pendiente')
      .lte('expira_at', new Date().toISOString())

    if (vencidos?.length) {
      let devueltos = false
      for (const c of vencidos) {
        const { data: ok } = await supabaseAdmin.rpc('fn_expirar_canje', { p_canje_id: c.id })
        devueltos = devueltos || !!ok
      }
      if (devueltos) {
        const { data: actualizado } = await supabaseAdmin
          .from('clientes').select('puntos').eq('id', id).single()
        if (actualizado) cliente.puntos = actualizado.puntos
      }
    }

    const [{ data: recompensas }, { data: canjeActivo }, { data: transacciones }] = await Promise.all([
      supabaseAdmin
        .from('recompensas')
        .select('id, nombre, descripcion, puntos_necesarios')
        .eq('negocio_id', cliente.negocio_id)
        .eq('activa', true)
        .order('puntos_necesarios', { ascending: true }),
      supabaseAdmin
        .from('canjes')
        .select('codigo, expira_at, recompensas(nombre)')
        .eq('cliente_id', id)
        .eq('estado', 'pendiente')
        .gt('expira_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from('transacciones')
        .select('tipo, puntos, descripcion, created_at, sucursal:sucursales(nombre)')
        .eq('cliente_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    const { data: planNegocio } = await supabaseAdmin
      .from('negocios')
      .select('plan')
      .eq('id', cliente.negocio_id)
      .single()

    return NextResponse.json({
      cliente,
      recompensas: recompensas || [],
      canjeActivo: canjeActivo || null,
      transacciones: transacciones || [],
      wallet: walletDisponible() && puedeUsarWallet(planNegocio?.plan),
    })
  } catch (error) {
    console.error('tarjeta error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
