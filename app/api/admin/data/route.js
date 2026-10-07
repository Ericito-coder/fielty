import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRequestIp } from '@/lib/server'
import { rateLimit } from '@/lib/rateLimit'
import { limiteClientes } from '@/lib/planes'
import { listarPreapprovals } from '@/lib/mp'
import { suscripcionesPorNegocio, resumenPagos } from '@/lib/facturacion'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    const { ok } = await rateLimit({ key: `admin-auth:${getRequestIp(request)}`, maxAttempts: 30, windowMs: 15 * 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento.' }, { status: 429 })

    // Verificar que sea el admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Traer todo en paralelo. Mercado Pago va con tope de espera y sin
    // romper nada si falla: el panel se muestra igual, sin fechas ni cobros.
    const [
      { data: negocios },
      { data: clientes },
      { data: canjes },
      { data: usersData },
      { data: intentos },
      preapprovals,
    ] = await Promise.all([
      supabaseAdmin.from('negocios').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('clientes').select('negocio_id, puntos, ultima_visita, created_at'),
      supabaseAdmin.from('canjes').select('negocio_id, estado, created_at').eq('estado', 'usado'),
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabaseAdmin.from('suscripciones').select('negocio_id, mp_plan_id, plan_tipo, created_at'),
      listarPreapprovals({ signal: AbortSignal.timeout(8000) }).catch(() => null),
    ])

    const usuarios = usersData?.users || []
    const emailPorUserId = {}
    const nombrePorUserId = {}
    usuarios.forEach(u => {
      emailPorUserId[u.id] = u.email
      nombrePorUserId[u.id] = u.user_metadata?.nombre || null
    })

    // Agregar datos por negocio
    const hace30dias = new Date()
    hace30dias.setDate(hace30dias.getDate() - 30)

    const clientesPorNegocio = {}
    const ultimaActividadPorNegocio = {}
    const puntosPorNegocio = {}
    const puntosTotal = clientes?.reduce((sum, c) => sum + (c.puntos || 0), 0) || 0

    clientes?.forEach(c => {
      clientesPorNegocio[c.negocio_id] = (clientesPorNegocio[c.negocio_id] || 0) + 1
      puntosPorNegocio[c.negocio_id] = (puntosPorNegocio[c.negocio_id] || 0) + (c.puntos || 0)
      if (c.ultima_visita) {
        const fecha = new Date(c.ultima_visita)
        if (!ultimaActividadPorNegocio[c.negocio_id] || fecha > ultimaActividadPorNegocio[c.negocio_id]) {
          ultimaActividadPorNegocio[c.negocio_id] = fecha
        }
      }
    })

    const canjesPorNegocio = {}
    canjes?.forEach(c => {
      canjesPorNegocio[c.negocio_id] = (canjesPorNegocio[c.negocio_id] || 0) + 1
    })

    // Métricas generales
    const negociosActivos = negocios?.filter(n => {
      const ultima = ultimaActividadPorNegocio[n.id]
      return ultima && ultima > hace30dias
    }).length || 0

    // Facturación. El MRR cuenta solo lo que cobra Mercado Pago: un plan
    // pago puesto a mano (plan_manual) es una cortesía o una prueba, y
    // sumarlo mostraba una facturación que no entra.
    const precioMap = { pro_early: 10000, pro: 20000, business: 35000, gratis: 0 }
    const precioDe = n => precioMap[n.plan] || 0
    const paga = n => !n.plan_manual && precioDe(n) > 0
    const porPlan = { gratis: 0, pro_early: 0, pro: 0, business: 0 }
    negocios?.forEach(n => { porPlan[n.plan || 'gratis'] = (porPlan[n.plan || 'gratis'] || 0) + 1 })
    const pagos = negocios?.filter(paga) || []
    const aMano = negocios?.filter(n => n.plan_manual && precioDe(n) > 0) || []
    const mrrAMano = aMano.reduce((sum, n) => sum + precioDe(n), 0)

    // Desde cuándo paga cada uno y cuánto se le cobró, según Mercado Pago.
    // El MRR usa lo que MP cobra de verdad por mes y cae al precio de lista
    // solo si no se pudo consultar: hay negocios con precio heredado.
    const suscripciones = suscripcionesPorNegocio({
      negocios: negocios || [],
      intentos: intentos || [],
      preapprovals: preapprovals || [],
    })
    const mrr = pagos.reduce((sum, n) => sum + (suscripciones.get(n.id)?.mensual ?? precioDe(n)), 0)
    const resumen = resumenPagos({ negocios: negocios || [], suscripciones, pagos, mrr })

    // Negocios gratis que abrieron el checkout y no terminaron: el último
    // intento de cada uno. Los que llegaron a pagar y se dieron de baja no
    // cuentan acá, esos tienen su suscripción.
    const intentoPorNegocio = {}
    intentos?.forEach(i => {
      const previo = intentoPorNegocio[i.negocio_id]
      if (!previo || i.created_at > previo.fecha) intentoPorNegocio[i.negocio_id] = { fecha: i.created_at, plan: i.plan_tipo }
    })
    const esGratis = n => !n.plan || n.plan === 'gratis'
    const intentoDe = n => (esGratis(n) && !suscripciones.has(n.id) && intentoPorNegocio[n.id]) || null

    const gratisLista = negocios?.filter(esGratis) || []
    // Para la conversión no cuentan los planes puestos a mano: son cortesías
    // o pruebas, ni pagaron ni se les ofreció pagar.
    const baseConversion = negocios?.filter(n => !(n.plan_manual && precioDe(n) > 0)) || []
    const gratis = {
      total: gratisLista.length,
      conClientes: gratisLista.filter(n => (clientesPorNegocio[n.id] || 0) > 0).length,
      activos30: gratisLista.filter(n => ultimaActividadPorNegocio[n.id] > hace30dias).length,
      enElLimite: gratisLista.filter(n => (clientesPorNegocio[n.id] || 0) >= limiteClientes(n)).length,
      intentaronPagar: gratisLista.filter(intentoDe).length,
      pagaron: baseConversion.filter(n => paga(n) || suscripciones.get(n.id)?.cuotas > 0).length,
      base: baseConversion.length,
    }

    // De dónde vino cada alta. El origen se guarda desde el 28/09/2026 (ver
    // lib/origen.js): los negocios anteriores no tienen dato y quedan afuera
    // del resumen en vez de inflar un "desconocido".
    const porFuente = {}
    negocios?.forEach(n => {
      const fuente = n.origen?.fuente
      if (!fuente) return
      const f = porFuente[fuente] || (porFuente[fuente] = { fuente, altas: 0, conClientes: 0, pagos: 0 })
      f.altas++
      if ((clientesPorNegocio[n.id] || 0) > 0) f.conClientes++
      if (paga(n)) f.pagos++
    })
    const origenes = Object.values(porFuente).sort((a, b) => b.altas - a.altas)

    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    const nuevosEsteMes = negocios?.filter(n => new Date(n.created_at) >= inicioMes).length || 0

    // Alertas. Cerca del límite es a 10 clientes o menos de llegar, y el
    // límite depende de cuándo se registró cada negocio (ver limiteClientes).
    const cercaDelLimite = negocios?.filter(n =>
      (!n.plan || n.plan === 'gratis') && (clientesPorNegocio[n.id] || 0) >= limiteClientes(n) - 10
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
      nombreDueno: nombrePorUserId[n.user_id] || null,
      origenFuente: n.origen?.fuente || null,
      paga: paga(n),
      suscripcion: suscripciones.get(n.id) || null,
      intentoPago: intentoDe(n),
      limite: esGratis(n) ? limiteClientes(n) : null,
      totalClientes: clientesPorNegocio[n.id] || 0,
      totalCanjesNegocio: canjesPorNegocio[n.id] || 0,
      totalPuntosNegocio: puntosPorNegocio[n.id] || 0,
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
      facturacion: { porPlan, mrr, pagando: pagos.length, mrrAMano, aMano: aMano.length, nuevosEsteMes },
      pagos: { mpDisponible: !!preapprovals, ...resumen },
      gratis,
      origenes,
      alertas: {
        cercaDelLimite: cercaDelLimite.map(n => ({ ...n, email: emailPorUserId[n.user_id] || '—', nombreDueno: nombrePorUserId[n.user_id] || null, totalClientes: clientesPorNegocio[n.id] || 0, limite: limiteClientes(n) })),
        inactivos: negociosInactivos30.slice(0, 10).map(n => ({ ...n, email: emailPorUserId[n.user_id] || '—', nombreDueno: nombrePorUserId[n.user_id] || null, totalClientes: clientesPorNegocio[n.id] || 0 })),
      },
      crecimiento,
      negocios: negociosConDatos,
    })

  } catch (error) {
    console.error('Admin data error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
