import { NextResponse, after } from 'next/server'
import { getSupabaseAdmin, NEGOCIO_CAMPOS_PUBLICOS, negocioPublico } from '@/lib/server'
import { walletDisponible, actualizarPuntosWallet } from '@/lib/googleWallet'
import { puedeUsarWallet } from '@/lib/planes'
import { rateLimit } from '@/lib/rateLimit'

// Datos completos de la tarjeta del cliente: datos propios (sin
// password_hash ni otros campos sensibles), recompensas activas,
// canje pendiente e historial. Antes de responder, expira los
// canjes vencidos y devuelve esos puntos al saldo, y vence los puntos
// si el cliente pasó el plazo de inactividad de su negocio.
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const { ok } = await rateLimit({ key: `tarjeta:${id}`, maxAttempts: 20, windowMs: 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento.' }, { status: 429 })

    const supabaseAdmin = getSupabaseAdmin()

    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select(`id, nombre, dni, telefono, email, fecha_nacimiento, puntos, puntos_historicos, visitas, ultima_visita, negocio_id, negocio:negocios(${NEGOCIO_CAMPOS_PUBLICOS})`)
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

    let saldoCambio = false
    for (const c of vencidos || []) {
      const { data: ok } = await supabaseAdmin.rpc('fn_expirar_canje', { p_canje_id: c.id })
      saldoCambio = saldoCambio || !!ok
    }

    // Puntos vencidos por inactividad. El cron lo hace una vez por día;
    // acá se repite para que la tarjeta nunca muestre un saldo que ya venció.
    const conVencimiento = !!cliente.negocio?.vencimiento_meses
    if (conVencimiento) {
      const { data: puntosVencidos } = await supabaseAdmin.rpc('fn_vencer_puntos', { p_cliente_id: id })
      saldoCambio = saldoCambio || !!puntosVencidos?.length
    }

    if (saldoCambio) {
      const { data: actualizado } = await supabaseAdmin
        .from('clientes').select('puntos').eq('id', id).single()
      if (actualizado) cliente.puntos = actualizado.puntos
      after(() => actualizarPuntosWallet(id))
    }

    const [{ data: recompensas }, { data: canjeActivo }, { data: transacciones }, { data: puntosVencenAt }] = await Promise.all([
      supabaseAdmin
        .from('recompensas')
        .select('id, nombre, puntos_necesarios')
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
      conVencimiento
        ? supabaseAdmin.rpc('fn_puntos_vencen_at', { p_cliente_id: id })
        : Promise.resolve({ data: null }),
    ])

    // El plan viene en el negocio anidado, así que se lee antes de que
    // `negocioPublico` lo saque — antes esto costaba una consulta aparte.
    const plan = cliente.negocio?.plan

    return NextResponse.json({
      cliente: { ...cliente, puntos_vencen_at: puntosVencenAt || null, negocio: negocioPublico(cliente.negocio) },
      recompensas: recompensas || [],
      canjeActivo: canjeActivo || null,
      transacciones: transacciones || [],
      wallet: walletDisponible() && puedeUsarWallet(plan),
    })
  } catch (error) {
    console.error('tarjeta error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
