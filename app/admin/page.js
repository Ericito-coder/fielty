'use client'
import { theme } from '@/lib/theme'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { linkWhatsApp } from '@/lib/wa'

const PLAN_COLORES = { gratis: theme.gray, pro_early: theme.red, pro: theme.red, business: theme.gold }
const PLAN_LABELS = { gratis: 'Gratis', pro_early: 'Pro Early', pro: 'Pro', business: 'Business' }
const PLANES_OPCIONES = ['gratis', 'pro_early', 'pro', 'business']

// Columnas de la tabla. Las que tienen `campo` se pueden ordenar; Contacto no,
// porque ordenar por email o teléfono no sirve para nada.
const COLUMNAS = [
  { label: 'Negocio', campo: 'nombre', tipo: 'texto' },
  { label: 'Contacto', campo: null },
  { label: 'Plan', campo: 'plan', tipo: 'plan' },
  { label: 'Clientes', campo: 'totalClientes', tipo: 'numero' },
  { label: 'Canjes', campo: 'totalCanjesNegocio', tipo: 'numero' },
  { label: 'Pts circ.', campo: 'totalPuntosNegocio', tipo: 'numero' },
  { label: 'Última act.', campo: 'ultimaActividad', tipo: 'fecha' },
  { label: 'Registrado', campo: 'created_at', tipo: 'fecha' },
]

// El plan se ordena por jerarquía, no alfabéticamente
const RANGO_PLAN = { gratis: 0, pro_early: 1, pro: 2, business: 3 }

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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }
      setToken(session.access_token)
      fetchData(session.access_token)
    })
  }, [])

  // Quién es el admin lo decide /api/admin/data contra el token: si no es
  // él, contesta 401 y lo mandamos al dashboard. El navegador nunca supo
  // cuál es el email de admin.
  async function fetchData(t) {
    setCargando(true)
    const res = await fetch('/api/admin/data', { headers: { Authorization: `Bearer ${t}` } })
    if (res.status === 401) { window.location.href = '/dashboard'; return }
    if (!res.ok) { setError('Error cargando datos'); setCargando(false); return }
    const json = await res.json()
    setData(json)
    setCargando(false)
  }

  async function abrirDetalle(negocio) {
    setNegocioDetalle(negocio)
    setDetalleData(null)
    setCargandoDetalle(true)
    const res = await fetch(`/api/admin/negocio/${negocio.id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setDetalleData(await res.json())
    setCargandoDetalle(false)
  }

  async function cambiarPlan(negocioId, plan) {
    setCambiandoPlan(negocioId)
    await fetch('/api/admin/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ negocioId, plan }),
    })
    await fetchData(token)
    setCambiandoPlan(null)
  }

  if (cargando) return <div style={s.wrap}><div style={{color:theme.gray}}>Cargando panel de admin...</div></div>
  if (error) return <div style={s.wrap}><div style={{color:theme.red}}>{error}</div></div>
  if (!data) return null

  const { metricas, facturacion, alertas, crecimiento, negocios } = data

  const negociosFiltrados = negocios.filter(n =>
    n.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.nombreDueno?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.telefono?.includes(busqueda)
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
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:12, fontWeight:700, color: PLAN_COLORES[negocioDetalle.plan || 'gratis'], background:'#1a1a1a', padding:'4px 10px', borderRadius:100}}>{PLAN_LABELS[negocioDetalle.plan || 'gratis']}</span>
                <button onClick={() => { setNegocioDetalle(null); setDetalleData(null) }} style={{background:'#1a1a1a', border:'none', borderRadius:8, color:theme.gray, cursor:'pointer', fontSize:18, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
              </div>
            </div>

            <div style={{padding:24, flex:1}}>
              {cargandoDetalle && <div style={{color:theme.grayMid, textAlign:'center', padding:40}}>Cargando...</div>}

              {detalleData && (
                <>
                  {/* Stats rápidos */}
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24}}>
                    {[
                      { label:'Clientes', value: detalleData.totalClientes },
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
                        <div style={{fontSize:13, fontWeight:800, fontFamily:'monospace', color: t.tipo === 'suma' || t.tipo === 'referido' || t.tipo === 'cumpleanos' ? theme.green : theme.red}}>
                          +{t.puntos} pts
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
            <div style={{fontSize:12, color:theme.grayMid, marginTop:4}}>por mes</div>
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

        {/* Alertas */}
        {(alertas.cercaDelLimite.length > 0 || alertas.inactivos.length > 0) && (
          <>
            <div style={s.sectionTitle}>Alertas</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32}}>
              {alertas.cercaDelLimite.length > 0 && (
                <div style={s.alertCard}>
                  <div style={{fontSize:13, fontWeight:700, color:theme.gold, marginBottom:12}}>⚠️ Cerca del límite (40+ clientes en gratis)</div>
                  {alertas.cercaDelLimite.map(n => (
                    <div key={n.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e1e1e'}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'white'}}>{n.nombre}</div>
                        <div style={{fontSize:11, color:theme.grayMid}}>{n.email}</div>
                      </div>
                      <div style={{fontSize:13, fontWeight:700, color:theme.gold}}>{n.totalClientes}/50</div>
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
}
