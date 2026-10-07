'use client'
import { theme } from '@/lib/theme'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { linkWhatsApp } from '@/lib/wa'
import { restaPuntos } from '@/lib/puntos'

const PLAN_COLORES = { gratis: theme.gray, pro_early: theme.red, pro: theme.red, business: theme.gold }
const PLAN_LABELS = { gratis: 'Gratis', pro_early: 'Pro Early', pro: 'Pro', business: 'Business' }
const PLANES_OPCIONES = ['gratis', 'pro_early', 'pro', 'business']

// Columnas de la tabla. Las que tienen `campo` se pueden ordenar; Contacto no,
// porque ordenar por email o teléfono no sirve para nada.
const COLUMNAS = [
  { label: 'Negocio', campo: 'nombre', tipo: 'texto' },
  { label: 'Contacto', campo: null },
  { label: 'Plan', campo: 'plan', tipo: 'plan' },
  { label: 'Origen', campo: 'origenFuente', tipo: 'texto' },
  { label: 'Clientes', campo: 'totalClientes', tipo: 'numero' },
  { label: 'Canjes', campo: 'totalCanjesNegocio', tipo: 'numero' },
  { label: 'Pts circ.', campo: 'totalPuntosNegocio', tipo: 'numero' },
  { label: 'Última act.', campo: 'ultimaActividad', tipo: 'fecha' },
  { label: 'Registrado', campo: 'created_at', tipo: 'fecha' },
]

// Una promesa que falla en vez de esperar para siempre. Sin esto, cualquier
// llamada que no vuelve deja la pantalla de carga fija.
function conTimeout(promesa, ms) {
  return Promise.race([
    promesa,
    new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('timeout')), ms)),
  ])
}

// El plan se ordena por jerarquía, no alfabéticamente
const RANGO_PLAN = { gratis: 0, pro_early: 1, pro: 2, business: 3 }

// lib/origen.js guarda la fuente normalizada (un host o un utm_source).
// Acá solo se le pone nombre a las que conocemos; el resto sale tal cual.
const FUENTES = { 'chatgpt.com': 'ChatGPT', google: 'Google', bing: 'Bing', perplexity: 'Perplexity', instagram: 'Instagram', facebook: 'Facebook', direct: 'Directo' }
const nombreFuente = f => FUENTES[f] || f

const pesos = n => '$' + Math.round(n).toLocaleString('es-AR')
const fecha = t => new Date(t).toLocaleDateString('es-AR')
const decimal = n => n.toLocaleString('es-AR', { maximumFractionDigits: 1 })

// "hace 2 meses": la antigüedad de un pago se lee mejor así que como fecha.
function haceCuanto(t) {
  const dias = Math.floor((Date.now() - new Date(t).getTime()) / 86400000)
  if (dias < 1) return 'hoy'
  if (dias < 31) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  const meses = Math.floor(dias / 30.44)
  if (meses < 12) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  return `hace ${anios} ${anios === 1 ? 'año' : 'años'}${resto ? ` y ${resto} ${resto === 1 ? 'mes' : 'meses'}` : ''}`
}

// Días entre que el negocio se registró y su primer pago.
function delAltaAlPago(dias) {
  if (dias === null || dias === undefined) return '—'
  if (dias < 1) return 'El mismo día'
  return `${decimal(dias)} ${dias === 1 ? 'día' : 'días'}`
}

// Arriba los que pagan hoy, del más antiguo al más nuevo; al final las bajas.
function ordenPagos(a, b) {
  if (a.paga !== b.paga) return a.paga ? -1 : 1
  const ta = a.suscripcion ? new Date(a.suscripcion.pagaDesde).getTime() : Infinity
  const tb = b.suscripcion ? new Date(b.suscripcion.pagaDesde).getTime() : Infinity
  return ta - tb
}

export default function Admin() {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [token, setToken] = useState(null)
  const [cambiandoPlan, setCambiandoPlan] = useState(null)
  const [negocioDetalle, setNegocioDetalle] = useState(null)
  const [detalleData, setDetalleData] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [orden, setOrden] = useState({ campo: 'created_at', dir: 'desc' })

  useEffect(() => {
    iniciar()
  }, [])

  // getSession() puede romper o no contestar nunca: sesión guardada vieja,
  // o el lock que supabase-js comparte entre pestañas trabado por otra.
  // Sin este try/catch la página se queda en "Cargando" para siempre y no
  // hay forma de salir salvo borrar los datos del sitio a mano.
  async function iniciar() {
    try {
      const { data: { session } } = await conTimeout(supabase.auth.getSession(), 10000)
      if (!session) { window.location.href = '/login'; return }
      setToken(session.access_token)
      await fetchData(session.access_token)
    } catch {
      setError('No pudimos verificar tu sesión.')
      setCargando(false)
    }
  }

  // Quién es el admin lo decide /api/admin/data contra el token: si no es
  // él, contesta 401 y lo mandamos al dashboard. El navegador nunca supo
  // cuál es el email de admin.
  async function fetchData(t) {
    setCargando(true)
    setError('')
    try {
      const res = await conTimeout(fetch('/api/admin/data', { headers: { Authorization: `Bearer ${t}` } }), 20000)
      if (res.status === 401) { window.location.href = '/dashboard'; return }
      if (!res.ok) { setError('Error cargando datos'); setCargando(false); return }
      const json = await res.json()
      setData(json)
      setCargando(false)
    } catch {
      setError('No se pudieron cargar los datos.')
      setCargando(false)
    }
  }

  // Si getSession() está trabado, signOut() también lo va a estar: usa el
  // mismo lock. Borramos la sesión guardada a mano y arrancamos de cero.
  function volverAEntrar() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-') && k.includes('-auth-token'))
        .forEach(k => localStorage.removeItem(k))
    } catch { /* modo incógnito o storage bloqueado */ }
    window.location.href = '/login'
  }

  async function abrirDetalle(negocio) {
    setNegocioDetalle(negocio)
    setDetalleData(null)
    setCargandoDetalle(true)
    try {
      const res = await conTimeout(fetch(`/api/admin/negocio/${negocio.id}`, { headers: { Authorization: `Bearer ${token}` } }), 20000)
      if (res.ok) setDetalleData(await res.json())
    } catch { /* el panel queda sin datos, pero deja de cargar */ }
    setCargandoDetalle(false)
  }

  async function cambiarPlan(negocioId, plan) {
    setCambiandoPlan(negocioId)
    try {
      await conTimeout(fetch('/api/admin/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ negocioId, plan }),
      }), 20000)
      await fetchData(token)
    } catch {
      setError('No se pudo cambiar el plan.')
      setCargando(false)
    }
    setCambiandoPlan(null)
  }

  if (cargando) return <div style={s.wrap}><div style={{color:theme.gray}}>Cargando panel de admin...</div></div>
  if (error) return (
    <div style={s.wrap}>
      <div style={{textAlign:'center', padding:'60px 20px'}}>
        <div style={{fontSize:32, marginBottom:12}}>⚠️</div>
        <div style={{fontSize:15, fontWeight:700, color:'white', marginBottom:20}}>{error}</div>
        <div style={{display:'flex', gap:10, justifyContent:'center'}}>
          <button onClick={() => window.location.reload()} style={s.botonError}>Reintentar</button>
          <button onClick={volverAEntrar} style={{...s.botonError, background:'#1a1a1a', color:theme.gray}}>Volver a entrar</button>
        </div>
      </div>
    </div>
  )
  if (!data) return null

  const { metricas, facturacion, alertas, crecimiento, negocios, origenes = [], pagos = {}, gratis = {} } = data

  // Los que pagan hoy y los que pagaron alguna vez y se dieron de baja.
  const clientesPagos = negocios.filter(n => n.paga || n.suscripcion).sort(ordenPagos)
  const sinTerminarPago = negocios.filter(n => n.intentoPago)

  const negociosFiltrados = negocios.filter(n =>
    n.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.nombreDueno?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.telefono?.includes(busqueda) ||
    (n.origenFuente && nombreFuente(n.origenFuente).toLowerCase().includes(busqueda.toLowerCase()))
  )

  const columnaOrden = COLUMNAS.find(c => c.campo === orden.campo)

  const negociosOrdenados = [...negociosFiltrados].sort((a, b) => {
    if (!columnaOrden) return 0
    const { campo, tipo } = columnaOrden

    // Los negocios sin fecha van siempre al final, se ordene como se ordene:
    // un negocio sin actividad no es "el más reciente" ni "el más viejo".
    if (tipo === 'fecha') {
      const ta = a[campo] ? new Date(a[campo]).getTime() : null
      const tb = b[campo] ? new Date(b[campo]).getTime() : null
      if (ta === null || tb === null) return ta === tb ? 0 : (ta === null ? 1 : -1)
      return orden.dir === 'asc' ? ta - tb : tb - ta
    }

    // Lo mismo con un texto vacío: el origen solo existe en las altas
    // nuevas, y sin esto ordenar por esa columna mostraba primero cien
    // filas en blanco.
    if (tipo === 'texto' && (!a[campo] || !b[campo])) {
      return !a[campo] === !b[campo] ? 0 : (!a[campo] ? 1 : -1)
    }

    let base
    if (tipo === 'numero') base = (a[campo] || 0) - (b[campo] || 0)
    else if (tipo === 'plan') base = (RANGO_PLAN[a.plan] ?? 0) - (RANGO_PLAN[b.plan] ?? 0)
    else base = String(a[campo] || '').localeCompare(String(b[campo] || ''), 'es')

    return orden.dir === 'asc' ? base : -base
  })

  // Los textos arrancan de la A; los números y fechas, de mayor a menor,
  // que es lo que uno quiere ver primero al hacer clic.
  function ordenarPor(campo, tipo) {
    if (!campo) return
    setOrden(o => o.campo === campo
      ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' }
      : { campo, dir: tipo === 'texto' ? 'asc' : 'desc' })
  }

  const maxCrecimiento = Math.max(...crecimiento.map(m => Math.max(m.negocios, m.clientes)), 1)

  return (
    <div style={s.wrap}>

      {/* PANEL DE DETALLE */}
      {negocioDetalle && (
        <div style={{position:'fixed', inset:0, zIndex:200, display:'flex'}}>
          <div style={{flex:1, background:'rgba(0,0,0,0.6)'}} onClick={() => { setNegocioDetalle(null); setDetalleData(null) }} />
          <div style={{width:520, background:theme.black, borderLeft:'1px solid #1e1e1e', overflowY:'auto', display:'flex', flexDirection:'column'}}>
            {/* Header */}
            <div style={{padding:'24px 24px 20px', borderBottom:'1px solid #1e1e1e', display:'flex', alignItems:'center', gap:14}}>
              <div style={{width:44, height:44, borderRadius:12, background: negocioDetalle.color || '#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:900, color:'white', flexShrink:0}}>
                {negocioDetalle.nombre?.slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:17, fontWeight:800, color:'white'}}>{negocioDetalle.nombre}</div>
                <div style={{fontSize:12, color:theme.grayMid, marginTop:2}}>{negocioDetalle.email} · desde {new Date(negocioDetalle.created_at).toLocaleDateString('es-AR')}</div>
                {negocioDetalle.origenFuente && (
                  <div style={{fontSize:12, color:theme.grayMid, marginTop:2}}>
                    Llegó por {nombreFuente(negocioDetalle.origenFuente)}
                    {negocioDetalle.origen?.campana ? ` (${negocioDetalle.origen.campana})` : ''}
                    {negocioDetalle.origen?.landing ? ` · entró en ${negocioDetalle.origen.landing}` : ''}
                  </div>
                )}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:12, fontWeight:700, color: PLAN_COLORES[negocioDetalle.plan || 'gratis'], background:'#1a1a1a', padding:'4px 10px', borderRadius:100}}>{PLAN_LABELS[negocioDetalle.plan || 'gratis']}</span>
                <button onClick={() => { setNegocioDetalle(null); setDetalleData(null) }} style={{background:'#1a1a1a', border:'none', borderRadius:8, color:theme.gray, cursor:'pointer', fontSize:18, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
              </div>
            </div>

            <div style={{padding:24, flex:1}}>
              {/* Suscripción: ya viene con el negocio, no espera al detalle */}
              {negocioDetalle.suscripcion && (
                <>
                  <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:10}}>Suscripción</div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:24}}>
                    {[
                      { label: `Paga desde, ${haceCuanto(negocioDetalle.suscripcion.pagaDesde)}`, value: fecha(negocioDetalle.suscripcion.pagaDesde) },
                      { label: negocioDetalle.suscripcion.cuotas === 1 ? 'Cuota cobrada' : 'Cuotas cobradas', value: negocioDetalle.suscripcion.cuotas },
                      { label: 'Cobrado', value: pesos(negocioDetalle.suscripcion.cobrado) },
                      negocioDetalle.suscripcion.bajaEl
                        ? { label: 'Baja', value: fecha(negocioDetalle.suscripcion.bajaEl) }
                        : { label: 'Próximo cobro', value: negocioDetalle.suscripcion.proximoCobro ? fecha(negocioDetalle.suscripcion.proximoCobro) : '—' },
                    ].map((item, i) => (
                      <div key={i} style={{background:'#1a1a1a', borderRadius:12, padding:'12px 14px', textAlign:'center'}}>
                        <div style={{fontSize:18, fontWeight:800, color:'white', fontFamily:'monospace'}}>{item.value}</div>
                        <div style={{fontSize:10, color:theme.grayMid, marginTop:3}}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {negocioDetalle.intentoPago && (
                <div style={{background:'#1a1a1a', borderRadius:12, padding:'12px 14px', marginBottom:24, fontSize:13, color:theme.darkText}}>
                  Abrió el pago de {PLAN_LABELS[negocioDetalle.intentoPago.plan] || negocioDetalle.intentoPago.plan} el {fecha(negocioDetalle.intentoPago.fecha)} y no lo terminó.
                </div>
              )}

              {cargandoDetalle && <div style={{color:theme.grayMid, textAlign:'center', padding:40}}>Cargando...</div>}

              {detalleData && (
                <>
                  {/* Stats rápidos */}
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24}}>
                    {[
                      { label: negocioDetalle.limite ? 'Clientes, del límite gratis' : 'Clientes', value: negocioDetalle.limite ? `${detalleData.totalClientes}/${negocioDetalle.limite}` : detalleData.totalClientes },
                      { label:'Activos 30d', value: detalleData.activos },
                      { label:'Nuevos mes', value: detalleData.nuevosEsteMes },
                      { label:'Canjes', value: negocioDetalle.totalCanjesNegocio },
                      { label:'Pts circ.', value: (negocioDetalle.totalPuntosNegocio || 0).toLocaleString('es-AR') },
                      { label:'Última act.', value: negocioDetalle.ultimaActividad ? new Date(negocioDetalle.ultimaActividad).toLocaleDateString('es-AR') : '—' },
                    ].map((item, i) => (
                      <div key={i} style={{background:'#1a1a1a', borderRadius:12, padding:'12px 14px', textAlign:'center'}}>
                        <div style={{fontSize:18, fontWeight:800, color:'white', fontFamily:'monospace'}}>{item.value}</div>
                        <div style={{fontSize:10, color:theme.grayMid, marginTop:3}}>{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top clientes */}
                  <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:10}}>Top clientes</div>
                  <div style={{background:'#111', borderRadius:14, overflow:'hidden', marginBottom:24}}>
                    {detalleData.topClientes.length === 0 && <div style={{padding:20, textAlign:'center', color:theme.grayMid, fontSize:13}}>Sin clientes</div>}
                    {detalleData.topClientes.map((c, i) => {
                      const nivel = (c.puntos_historicos || 0) >= 5000 ? '🥇' : (c.puntos_historicos || 0) >= 1000 ? '🥈' : '🥉'
                      return (
                        <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #1a1a1a'}}>
                          <div style={{fontSize:12, fontWeight:800, color:'#333', width:20, textAlign:'center', flexShrink:0}}>#{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13, fontWeight:700, color:'white'}}>{c.nombre}</div>
                            <div style={{fontSize:11, color:theme.grayMid}}>DNI {c.dni} · {nivel} {(c.puntos_historicos||0).toLocaleString('es-AR')} hist.</div>
                          </div>
                          <div style={{fontSize:15, fontWeight:800, color:theme.gold, fontFamily:'monospace'}}>{(c.puntos||0).toLocaleString('es-AR')}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Canjes recientes */}
                  <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:10}}>Últimos canjes</div>
                  <div style={{background:'#111', borderRadius:14, overflow:'hidden', marginBottom:24}}>
                    {detalleData.canjesRecientes.length === 0 && <div style={{padding:20, textAlign:'center', color:theme.grayMid, fontSize:13}}>Sin canjes</div>}
                    {detalleData.canjesRecientes.map((c, i) => (
                      <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #1a1a1a'}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13, fontWeight:700, color:'white'}}>{c.recompensas?.nombre || '—'}</div>
                          <div style={{fontSize:11, color:theme.grayMid}}>{c.clientes?.nombre || '—'}</div>
                        </div>
                        <div style={{fontSize:11, color:theme.grayMid, fontFamily:'monospace'}}>{c.usado_at ? new Date(c.usado_at).toLocaleDateString('es-AR') : '—'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Últimas transacciones */}
                  <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:10}}>Últimas transacciones</div>
                  <div style={{background:'#111', borderRadius:14, overflow:'hidden'}}>
                    {detalleData.transacciones.length === 0 && <div style={{padding:20, textAlign:'center', color:theme.grayMid, fontSize:13}}>Sin transacciones</div>}
                    {detalleData.transacciones.map((t, i) => (
                      <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #1a1a1a'}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13, color:'white'}}>{t.descripcion}</div>
                          <div style={{fontSize:11, color:theme.grayMid}}>{new Date(t.created_at).toLocaleDateString('es-AR')}</div>
                        </div>
                        <div style={{fontSize:13, fontWeight:800, fontFamily:'monospace', color: restaPuntos(t.tipo) ? theme.red : theme.green}}>
                          {restaPuntos(t.tipo) ? '-' : '+'}{t.puntos} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main style={s.inner}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:10, height:10, borderRadius:'50%', background:theme.red, boxShadow:'0 0 10px #e0001b'}} />
            <span style={{fontSize:20, fontWeight:800, color:'white', letterSpacing:-0.5}}>fielty</span>
            <span style={{fontSize:13, color:theme.grayMid, marginLeft:4}}>/ admin</span>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            style={{padding:'8px 16px', background:'#1a1a1a', border:'none', borderRadius:10, color:theme.gray, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
            Salir
          </button>
        </div>

        {/* Métricas generales */}
        <div style={s.sectionTitle}>Métricas generales</div>
        <div style={s.cardsRow}>
          {[
            { label: 'Negocios totales', value: metricas.totalNegocios, color: theme.red },
            { label: 'Negocios activos (30d)', value: metricas.negociosActivos, color: '#00c853' },
            { label: 'Clientes totales', value: metricas.totalClientes.toLocaleString('es-AR'), color: theme.blue },
            { label: 'Puntos en circulación', value: metricas.totalPuntos.toLocaleString('es-AR'), color: theme.gold },
            { label: 'Canjes realizados', value: metricas.totalCanjes.toLocaleString('es-AR'), color: theme.purple },
          ].map((m, i) => (
            <div key={i} style={s.metricCard}>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:8}}>{m.label}</div>
              <div style={{fontSize:32, fontWeight:900, color: m.color, fontFamily:'monospace'}}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Facturación */}
        <div style={s.sectionTitle}>Facturación</div>
        <div style={s.cardsRow}>
          <div style={{...s.metricCard, flex:2}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:12}}>MRR</div>
            <div style={{fontSize:38, fontWeight:900, color:'#00c853', fontFamily:'monospace'}}>${facturacion.mrr.toLocaleString('es-AR')}</div>
            <div style={{fontSize:12, color:theme.grayMid, marginTop:4}}>
              por mes · {facturacion.pagando} {facturacion.pagando === 1 ? 'negocio pagando' : 'negocios pagando'}
            </div>
            {facturacion.aMano > 0 && (
              <div style={{fontSize:12, color:theme.grayMid, marginTop:10, paddingTop:10, borderTop:'1px solid #1e1e1e'}}>
                No incluye {facturacion.aMano} {facturacion.aMano === 1 ? 'plan puesto' : 'planes puestos'} a mano (${facturacion.mrrAMano.toLocaleString('es-AR')} que no se cobran)
              </div>
            )}
          </div>
          <div style={{...s.metricCard, flex:2}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:12}}>Negocios por plan</div>
            {PLANES_OPCIONES.map(p => (
              <div key={p} style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:8, height:8, borderRadius:'50%', background: PLAN_COLORES[p]}} />
                  <span style={{fontSize:13, color:theme.gray}}>{PLAN_LABELS[p]}</span>
                </div>
                <span style={{fontSize:15, fontWeight:800, color:'white', fontFamily:'monospace'}}>{facturacion.porPlan[p] || 0}</span>
              </div>
            ))}
          </div>
          <div style={s.metricCard}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:8}}>Nuevos este mes</div>
            <div style={{fontSize:32, fontWeight:900, color:theme.blue, fontFamily:'monospace'}}>{facturacion.nuevosEsteMes}</div>
          </div>
        </div>

        {/* Clientes pagos: desde cuándo paga cada uno y cuánto dejó */}
        <div style={s.sectionTitle}>Clientes pagos ({clientesPagos.length})</div>
        {!pagos.mpDisponible && (
          <div style={{...s.alertCard, marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16}}>
            <div style={{fontSize:13, color:theme.darkMuted}}>No se pudo consultar Mercado Pago: faltan desde cuándo paga cada negocio y cuánto se le cobró.</div>
            <button onClick={() => fetchData(token)} style={{padding:'8px 16px', background:'#1a1a1a', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0}}>Reintentar</button>
          </div>
        )}
        <div style={{...s.cardsRow, marginBottom:12}}>
          {[
            {
              label: 'Cobrado hasta hoy',
              value: pagos.mpDisponible ? pesos(pagos.cobradoTotal) : '—',
              color: '#00c853',
              sub: pagos.mpDisponible && `${pagos.cuotasTotal} ${pagos.cuotasTotal === 1 ? 'cuota' : 'cuotas'}, antes de la comisión de Mercado Pago`,
            },
            {
              label: 'Cobrado por negocio',
              value: pagos.cobradoPorNegocio ? pesos(pagos.cobradoPorNegocio) : '—',
              sub: pagos.cobradoPorNegocio && `${decimal(pagos.cuotasPorNegocio)} cuotas en promedio, a ${pesos(pagos.ticketPromedio || 0)} por mes`,
            },
            {
              label: 'LTV estimado',
              value: pagos.ltvEstimado ? pesos(pagos.ltvEstimado) : '—',
              sub: pagos.ltvEstimado
                ? `Un cliente dura ${decimal(1 / pagos.churnMensual)} meses: ${pagos.bajas} ${pagos.bajas === 1 ? 'baja' : 'bajas'} en ${pagos.cuotasTotal} cuotas`
                : pagos.pagaronAlgunaVez > 0 && 'Todavía no hubo bajas, y sin bajas no se sabe cuánto dura un cliente',
            },
            {
              label: 'Del alta al pago',
              value: delAltaAlPago(pagos.medianaDiasHastaPagar),
              sub: pagos.pagaronAlgunaVez > 0 && `Mediana de los ${pagos.pagaronAlgunaVez} que pagaron`,
            },
          ].map(m => (
            <div key={m.label} style={s.metricCard}>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:8}}>{m.label}</div>
              <div style={{fontSize:26, fontWeight:900, color: m.color || 'white', fontFamily:'monospace'}}>{m.value}</div>
              {m.sub && <div style={{fontSize:12, color:theme.darkMuted, marginTop:6, lineHeight:1.4}}>{m.sub}</div>}
            </div>
          ))}
        </div>
        <div style={{background:'#111', borderRadius:16, overflow:'hidden', marginBottom:32}}>
          {clientesPagos.length === 0 ? (
            <div style={{padding:24, color:theme.darkMuted, fontSize:13}}>Todavía no hay negocios pagando.</div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #1e1e1e'}}>
                  {['Negocio', 'Plan', 'Paga desde', 'Del alta al pago', 'Cuotas', 'Cobrado', 'Por mes', 'Próximo cobro'].map((t, i) => (
                    <th key={t} style={{padding:'12px 16px', textAlign: i >= 4 && i <= 6 ? 'right' : 'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:theme.grayMid, whiteSpace:'nowrap'}}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesPagos.map(n => {
                  const sus = n.suscripcion
                  return (
                    <tr key={n.id} style={{borderBottom:'1px solid #151515', cursor:'pointer'}} onClick={() => abrirDetalle(n)}>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <div style={{width:32, height:32, borderRadius:8, background: n.color || '#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'white', flexShrink:0}}>
                            {n.nombre?.slice(0,2).toUpperCase()}
                          </div>
                          <div style={{fontSize:13, fontWeight:700, color:'white', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={n.nombre}>{n.nombre}</div>
                        </div>
                      </td>
                      <td style={{padding:'12px 16px', fontSize:12, fontWeight:700, color: PLAN_COLORES[n.plan || 'gratis'], whiteSpace:'nowrap'}}>{PLAN_LABELS[n.plan || 'gratis']}</td>
                      <td style={{padding:'12px 16px'}}>
                        {sus ? (
                          <>
                            <div style={{fontSize:13, color:'white'}}>{fecha(sus.pagaDesde)}</div>
                            <div style={{fontSize:11, color:theme.darkMuted}}>{haceCuanto(sus.pagaDesde)}</div>
                          </>
                        ) : <div style={{fontSize:13, color:theme.grayMid}}>—</div>}
                      </td>
                      <td style={{padding:'12px 16px', fontSize:13, color:theme.darkText}}>{delAltaAlPago(sus?.diasHastaPagar)}</td>
                      <td style={{padding:'12px 16px', textAlign:'right', fontSize:13, color:theme.darkText, fontFamily:'monospace'}}>{sus ? sus.cuotas : '—'}</td>
                      <td style={{padding:'12px 16px', textAlign:'right', fontSize:13, fontWeight:700, color:'white', fontFamily:'monospace'}}>{sus ? pesos(sus.cobrado) : '—'}</td>
                      <td style={{padding:'12px 16px', textAlign:'right', fontSize:13, color:theme.darkText, fontFamily:'monospace'}}>{sus?.mensual ? pesos(sus.mensual) : '—'}</td>
                      <td style={{padding:'12px 16px', fontSize:13, color: sus?.bajaEl ? theme.redOnDark : theme.darkText, whiteSpace:'nowrap'}}>
                        {sus?.bajaEl ? `Baja el ${fecha(sus.bajaEl)}` : sus?.proximoCobro ? fecha(sus.proximoCobro) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Plan gratis: cuántos lo usan de verdad y cuántos estuvieron por pagar */}
        <div style={s.sectionTitle}>Plan gratis ({gratis.total || 0})</div>
        <div style={{...s.cardsRow, marginBottom: sinTerminarPago.length > 0 ? 12 : 32}}>
          {[
            { label: 'Con clientes cargados', value: gratis.conClientes, sub: gratis.total > 0 && `${decimal(gratis.conClientes / gratis.total * 100)}% de los gratis` },
            { label: 'Activos (30 días)', value: gratis.activos30, sub: 'Con visitas en el último mes' },
            { label: 'En el límite', value: gratis.enElLimite, sub: 'No pueden sumar clientes sin pagar' },
            { label: 'Abrieron el pago', value: gratis.intentaronPagar, sub: 'Y no lo terminaron' },
            { label: 'Conversión a pago', value: gratis.base > 0 ? `${decimal(gratis.pagaron / gratis.base * 100)}%` : '—', sub: gratis.base > 0 && `${gratis.pagaron} de ${gratis.base} negocios` },
          ].map(m => (
            <div key={m.label} style={s.metricCard}>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:theme.grayMid, marginBottom:8}}>{m.label}</div>
              <div style={{fontSize:26, fontWeight:900, color:'white', fontFamily:'monospace'}}>{m.value ?? 0}</div>
              {m.sub && <div style={{fontSize:12, color:theme.darkMuted, marginTop:6, lineHeight:1.4}}>{m.sub}</div>}
            </div>
          ))}
        </div>
        {sinTerminarPago.length > 0 && (
          <div style={{...s.alertCard, marginBottom:32}}>
            <div style={{fontSize:13, fontWeight:700, color:'white', marginBottom:12}}>Abrieron el pago y no lo terminaron</div>
            {sinTerminarPago.map(n => (
              <div key={n.id} onClick={() => abrirDetalle(n)} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, padding:'8px 0', borderBottom:'1px solid #1e1e1e', cursor:'pointer'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{n.nombre}</div>
                  <div style={{fontSize:11, color:theme.darkMuted}}>{n.email}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:20, flexShrink:0}}>
                  {n.telefono && (
                    <a
                      href={linkWhatsApp(n.telefono, `Hola ${n.nombreDueno || n.nombre}! Te escribo de Fielty.`)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{fontSize:12, color:theme.green, textDecoration:'none'}}
                    >
                      {n.telefono}
                    </a>
                  )}
                  <div style={{fontSize:12, color:theme.darkText, textAlign:'right'}}>
                    {PLAN_LABELS[n.intentoPago.plan] || n.intentoPago.plan} · {fecha(n.intentoPago.fecha)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alertas */}
        {(alertas.cercaDelLimite.length > 0 || alertas.inactivos.length > 0) && (
          <>
            <div style={s.sectionTitle}>Alertas</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32}}>
              {alertas.cercaDelLimite.length > 0 && (
                <div style={s.alertCard}>
                  <div style={{fontSize:13, fontWeight:700, color:theme.gold, marginBottom:12}}>⚠️ Cerca del límite del plan gratis</div>
                  {alertas.cercaDelLimite.map(n => (
                    <div key={n.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e1e1e'}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'white'}}>{n.nombre}</div>
                        <div style={{fontSize:11, color:theme.grayMid}}>{n.email}</div>
                      </div>
                      <div style={{fontSize:13, fontWeight:700, color:theme.gold}}>{n.totalClientes}/{n.limite}</div>
                    </div>
                  ))}
                </div>
              )}
              {alertas.inactivos.length > 0 && (
                <div style={s.alertCard}>
                  <div style={{fontSize:13, fontWeight:700, color:theme.grayMid, marginBottom:12}}>💤 Inactivos hace más de 30 días</div>
                  {alertas.inactivos.slice(0, 5).map(n => (
                    <div key={n.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e1e1e'}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'white'}}>{n.nombre}</div>
                        <div style={{fontSize:11, color:theme.grayMid}}>{n.email}</div>
                      </div>
                      <div style={{fontSize:11, color:theme.grayMid, fontFamily:'monospace', textAlign:'right'}}>
                        {PLAN_LABELS[n.plan || 'gratis']}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Crecimiento */}
        <div style={s.sectionTitle}>Crecimiento (últimos 6 meses)</div>
        <div style={{...s.metricCard, marginBottom:32}}>
          <div style={{display:'flex', alignItems:'flex-end', gap:12, height:100}}>
            {crecimiento.map((m, i) => (
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                <div style={{width:'100%', display:'flex', gap:3, alignItems:'flex-end', height:80}}>
                  <div style={{flex:1, background:theme.red, borderRadius:'4px 4px 0 0', height:`${(m.negocios / maxCrecimiento) * 100}%`, minHeight: m.negocios > 0 ? 4 : 0}} title={`${m.negocios} negocios`} />
                  <div style={{flex:1, background:theme.blue, borderRadius:'4px 4px 0 0', height:`${(m.clientes / maxCrecimiento) * 100}%`, minHeight: m.clientes > 0 ? 4 : 0}} title={`${m.clientes} clientes`} />
                </div>
                <div style={{fontSize:10, color:theme.grayMid, textAlign:'center'}}>{m.mes.slice(5)}/{m.mes.slice(2,4)}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:16, marginTop:12}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10, height:10, borderRadius:2, background:theme.red}} /><span style={{fontSize:11, color:theme.grayMid}}>Negocios</span></div>
            <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10, height:10, borderRadius:2, background:theme.blue}} /><span style={{fontSize:11, color:theme.grayMid}}>Clientes</span></div>
          </div>
        </div>

        {/* Origen de las altas */}
        <div style={s.sectionTitle}>De dónde vienen las altas (desde el 28/09)</div>
        <div style={{background:'#111', borderRadius:16, overflow:'hidden', marginBottom:32}}>
          {origenes.length === 0 ? (
            <div style={{padding:24, color:theme.grayMid, fontSize:13}}>Todavía no hay altas con origen registrado.</div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #1e1e1e'}}>
                  {['Fuente', 'Altas', 'Con clientes', 'Pagan'].map((t, i) => (
                    <th key={t} style={{padding:'12px 16px', textAlign: i === 0 ? 'left' : 'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:theme.grayMid}}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {origenes.map(o => (
                  <tr key={o.fuente} style={{borderBottom:'1px solid #151515'}}>
                    <td style={{padding:'12px 16px', fontSize:13, fontWeight:700, color:'white'}}>{nombreFuente(o.fuente)}</td>
                    <td style={{padding:'12px 16px', textAlign:'right', fontSize:13, fontWeight:700, color:'white', fontFamily:'monospace'}}>{o.altas}</td>
                    <td style={{padding:'12px 16px', textAlign:'right', fontSize:13, color:theme.gray, fontFamily:'monospace'}}>{o.conClientes}</td>
                    <td style={{padding:'12px 16px', textAlign:'right', fontSize:13, fontWeight:700, color: o.pagos > 0 ? '#00c853' : theme.grayMid, fontFamily:'monospace'}}>{o.pagos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Tabla de negocios */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
          <div style={s.sectionTitle} >Negocios ({negocios.length})</div>
          <input
            style={{padding:'10px 16px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, color:'white', fontSize:13, fontFamily:'inherit', outline:'none', width:240}}
            placeholder="Buscar por nombre, email o tel..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div style={{background:'#111', borderRadius:20, overflow:'hidden', marginBottom:40}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid #1e1e1e'}}>
                {COLUMNAS.map(col => {
                  const activa = col.campo && orden.campo === col.campo
                  return (
                    <th key={col.label}
                      onClick={() => ordenarPor(col.campo, col.tipo)}
                      title={col.campo ? 'Ordenar por ' + col.label.toLowerCase() : undefined}
                      style={{
                        padding:'14px 16px', textAlign:'left', fontSize:11, fontWeight:700,
                        textTransform:'uppercase', letterSpacing:'0.06em',
                        color: activa ? theme.red : theme.grayMid,
                        cursor: col.campo ? 'pointer' : 'default',
                        userSelect:'none', whiteSpace:'nowrap',
                      }}>
                      {col.label}
                      {activa && <span style={{marginLeft:6}}>{orden.dir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {negociosOrdenados.map(n => (
                <tr key={n.id} style={{borderBottom:'1px solid #151515', cursor:'pointer'}}
                  onClick={() => abrirDetalle(n)}>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:32, height:32, borderRadius:8, background: n.color || '#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'white', flexShrink:0}}>
                        {n.nombre?.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{fontSize:13, fontWeight:700, color:'white'}}>{n.nombre}</div>
                    </div>
                  </td>
                  <td style={{padding:'14px 16px'}}>
                    {n.nombreDueno && <div style={{fontSize:12, color:'white', fontWeight:600}}>{n.nombreDueno}</div>}
                    <div style={{fontSize:12, color:theme.gray}}>{n.email}</div>
                    {n.telefono ? (
                      <a
                        href={linkWhatsApp(n.telefono, `Hola ${n.nombreDueno || n.nombre}! Te escribo de Fielty.`)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{fontSize:12, color:theme.green, textDecoration:'none'}}
                      >
                        📱 {n.telefono}
                      </a>
                    ) : (
                      <div style={{fontSize:12, color:theme.grayMid}}>—</div>
                    )}
                  </td>
                  <td style={{padding:'14px 16px'}} onClick={e => e.stopPropagation()}>
                    <select
                      value={n.plan || 'gratis'}
                      disabled={cambiandoPlan === n.id}
                      onChange={e => cambiarPlan(n.id, e.target.value)}
                      style={{background:'#1a1a1a', border:`1px solid ${PLAN_COLORES[n.plan || 'gratis']}`, borderRadius:8, color: PLAN_COLORES[n.plan || 'gratis'], fontSize:12, fontWeight:700, padding:'6px 10px', cursor:'pointer', fontFamily:'inherit', outline:'none'}}
                    >
                      {PLANES_OPCIONES.map(p => (
                        <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                      ))}
                    </select>
                    {n.plan_manual && (
                      <div title="Plan puesto a mano: el cron de Mercado Pago no lo va a bajar a gratis"
                        style={{fontSize:10, color:theme.gray, marginTop:4, whiteSpace:'nowrap'}}>
                        ✋ a mano
                      </div>
                    )}
                  </td>
                  <td style={{padding:'14px 16px'}}>
                    {n.origenFuente ? (
                      <>
                        <div style={{fontSize:12, color:'white', fontWeight:600}}>{nombreFuente(n.origenFuente)}</div>
                        {n.origen?.landing && n.origen.landing !== '/' && (
                          <div style={{fontSize:11, color:theme.grayMid, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={n.origen.landing}>{n.origen.landing}</div>
                        )}
                      </>
                    ) : (
                      <div style={{fontSize:12, color:theme.grayMid}}>—</div>
                    )}
                  </td>
                  <td style={{padding:'14px 16px', fontSize:13, fontWeight:700, color:'white', fontFamily:'monospace'}}>{n.totalClientes}</td>
                  <td style={{padding:'14px 16px', fontSize:13, fontWeight:700, color:theme.purple, fontFamily:'monospace'}}>{n.totalCanjesNegocio}</td>
                  <td style={{padding:'14px 16px', fontSize:13, color:theme.gold, fontFamily:'monospace'}}>{(n.totalPuntosNegocio || 0).toLocaleString('es-AR')}</td>
                  <td style={{padding:'14px 16px', fontSize:12, color:theme.grayMid}}>
                    {n.ultimaActividad ? new Date(n.ultimaActividad).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td style={{padding:'14px 16px', fontSize:12, color:theme.grayMid}}>
                    {new Date(n.created_at).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
              {negociosOrdenados.length === 0 && (
                <tr><td colSpan={COLUMNAS.length} style={{padding:32, textAlign:'center', color:theme.grayMid, fontSize:13}}>Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0a0a0a', display:'flex', justifyContent:'center', padding:'32px 20px' },
  inner: { width:'100%', maxWidth:1200 },
  sectionTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:theme.grayMid, marginBottom:12 },
  cardsRow: { display:'flex', gap:12, marginBottom:32, flexWrap:'wrap' },
  metricCard: { flex:1, minWidth:160, background:'#111', borderRadius:16, padding:'20px 24px' },
  alertCard: { background:'#111', borderRadius:16, padding:20 },
  botonError: { padding:'10px 24px', background:theme.red, border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
}
