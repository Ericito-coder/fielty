import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'eric.bohl10@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    // Verificar que sea el admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Traer todo en paralelo
    const [
      { data: negocios },
      { data: clientes },
      { data: canjes },
      { data: usersData }
    ] = await Promise.all([
      supabaseAdmin.from('negocios').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('clientes').select('negocio_id, puntos, ultima_visita, created_at'),
      supabaseAdmin.from('canjes').select('negocio_id, estado, created_at').eq('estado', 'usado'),
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    ])

    const usuarios = usersData?.users || []
    const emailPorUserId = {}
    usuarios.forEach(u => { emailPorUserId[u.id] = u.email })

    // Agregar datos por negocio
    const hace30dias = new Date()
    hace30dias.setDate(hace30dias.getDate() - 30)

    const clientesPorNegocio = {}
    const ultimaActividadPorNegocio = {}
    const puntosTotal = clientes?.reduce((sum, c) => sum + (c.puntos || 0), 0) || 0

    clientes?.forEach(c => {
      clientesPorNegocio[c.negocio_id] = (clientesPorNegocio[c.negocio_id] || 0) + 1
      if (c.ultima_visita) {
        const fecha = new Date(c.ultima_visita)
        if (!ultimaActividadPorNegocio[c.negocio_id] || fecha > ultimaActividadPorNegocio[c.negocio_id]) {
          ultimaActividadPorNegocio[c.negocio_id] = fecha
        }
      }
    })

    // Métricas generales
    const negociosActivos = negocios?.filter(n => {
      const ultima = ultimaActividadPorNegocio[n.id]
      return ultima && ultima > hace30dias
    }).length || 0

    // Facturación
    const precioMap = { pro_early: 10000, pro: 20000, business: 35000, gratis: 0 }
    const porPlan = { gratis: 0, pro_early: 0, pro: 0, business: 0 }
    negocios?.forEach(n => { porPlan[n.plan || 'gratis'] = (porPlan[n.plan || 'gratis'] || 0) + 1 })
    const mrr = negocios?.reduce((sum, n) => sum + (precioMap[n.plan] || 0), 0) || 0

    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    const nuevosEsteMes = negocios?.filter(n => new Date(n.created_at) >= inicioMes).length || 0

    // Alertas
    const cercaDelLimite = negocios?.filter(n =>
      (!n.plan || n.plan === 'gratis') && (clientesPorNegocio[n.id] || 0) >= 40
    ) || []

    const negociosInactivos30 = negocios?.filter(n => {
      const ultima = ultimaActividadPorNegocio[n.id]
      return !ultima || ultima < hace30dias
    }) || []

    // Crecimiento: últimos 6 meses
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      meses.push(d.toISOString().slice(0, 7))
    }
    const crecimiento = meses.map(mes => ({
      mes,
      negocios: negocios?.filter(n => n.created_at?.startsWith(mes)).length || 0,
      clientes: clientes?.filter(c => c.created_at?.startsWith(mes)).length || 0,
    }))

    // Lista de negocios enriquecida
    const negociosConDatos = negocios?.map(n => ({
      ...n,
      email: emailPorUserId[n.user_id] || '—',
      totalClientes: clientesPorNegocio[n.id] || 0,
      ultimaActividad: ultimaActividadPorNegocio[n.id] || null,
    })) || []

    return NextResponse.json({
      metricas: {
        totalNegocios: negocios?.length || 0,
        negociosActivos,
        totalClientes: clientes?.length || 0,
        totalPuntos: puntosTotal,
        totalCanjes: canjes?.length || 0,
      },
      facturacion: { porPlan, mrr, nuevosEsteMes },
      alertas: {
        cercaDelLimite: cercaDelLimite.map(n => ({ ...n, email: emailPorUserId[n.user_id] || '—', totalClientes: clientesPorNegocio[n.id] || 0 })),
        inactivos: negociosInactivos30.slice(0, 10).map(n => ({ ...n, email: emailPorUserId[n.user_id] || '—', totalClientes: clientesPorNegocio[n.id] || 0 })),
      },
      crecimiento,
      negocios: negociosConDatos,
    })

  } catch (error) {
    console.error('Admin data error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
