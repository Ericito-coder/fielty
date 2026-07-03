import { NextResponse } from 'next/server'
import { getSupabaseAdmin, validarPinCaja } from '@/lib/server'

// Busca un canje pendiente por código. Si ya venció, lo expira y
// devuelve los puntos al cliente (atómico, vía fn_expirar_canje).
export async function POST(request) {
  try {
    const { negocioId, sucursalId, pin, codigo } = await request.json()
    if (!negocioId || !codigo) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const auth = await validarPinCaja(supabaseAdmin, { negocioId, sucursalId, pin })
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data: canje } = await supabaseAdmin
      .from('canjes')
      .select('id, codigo, expira_at, puntos_descontados, clientes(id, nombre), recompensas(nombre, puntos_necesarios)')
      .eq('codigo', String(codigo).toUpperCase())
      .eq('negocio_id', negocioId)
      .eq('estado', 'pendiente')
      .maybeSingle()

    if (!canje) {
      return NextResponse.json({ error: 'Código inválido o ya usado' }, { status: 404 })
    }

    if (new Date() > new Date(canje.expira_at)) {
      await supabaseAdmin.rpc('fn_expirar_canje', { p_canje_id: canje.id })
      return NextResponse.json(
        { error: `Código expirado — se devolvieron ${canje.puntos_descontados} pts`, expirado: true },
        { status: 410 }
      )
    }

    return NextResponse.json({ ok: true, canje })
  } catch (error) {
    console.error('validar-canje error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
