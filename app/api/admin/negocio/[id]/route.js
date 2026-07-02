import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request, { params }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    const hace30dias = new Date()
    hace30dias.setDate(hace30dias.getDate() - 30)
    const inicioMes = new Date()
    inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)

    const [
      { data: clientes },
      { data: canjesRecientes },
      { data: transacciones },
    ] = await Promise.all([
      supabaseAdmin.from('clientes').select('id, nombre, dni, puntos, puntos_historicos, ultima_visita, created_at')
        .eq('negocio_id', id).order('puntos_historicos', { ascending: false }),
      supabaseAdmin.from('canjes').select('*, recompensas(nombre), clientes(nombre)')
        .eq('negocio_id', id).eq('estado', 'usado')
        .order('usado_at', { ascending: false }).limit(10),
      supabaseAdmin.from('transacciones').select('puntos, tipo, created_at, descripcion')
        .eq('negocio_id', id).order('created_at', { ascending: false }).limit(10),
    ])

    const totalClientes = clientes?.length || 0
    const nuevosEsteMes = clientes?.filter(c => new Date(c.created_at) >= inicioMes).length || 0
    const activos = clientes?.filter(c => c.ultima_visita && new Date(c.ultima_visita) > hace30dias).length || 0
    const topClientes = clientes?.slice(0, 8) || []

    return NextResponse.json({
      totalClientes,
      nuevosEsteMes,
      activos,
      topClientes,
      canjesRecientes: canjesRecientes || [],
      transacciones: transacciones || [],
    })

  } catch (error) {
    console.error('Admin negocio detalle error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
