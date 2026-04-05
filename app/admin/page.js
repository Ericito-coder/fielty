'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'eric.bohl10@gmail.com'
const PLAN_COLORES = { gratis: '#888', pro_early: '#e0001b', pro: '#e0001b', business: '#f0a500' }
const PLAN_LABELS = { gratis: 'Gratis', pro_early: 'Pro Early', pro: 'Pro', business: 'Business' }
const PLANES_OPCIONES = ['gratis', 'pro_early', 'pro', 'business']

export default function Admin() {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [token, setToken] = useState(null)
  const [cambiandoPlan, setCambiandoPlan] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }
      if (session.user.email !== ADMIN_EMAIL) { window.location.href = '/dashboard'; return }
      setToken(session.access_token)
      fetchData(session.access_token)
    })
  }, [])

  async function fetchData(t) {
    setCargando(true)
    const res = await fetch('/api/admin/data', { headers: { Authorization: `Bearer ${t}` } })
    if (!res.ok) { setError('Error cargando datos'); setCargando(false); return }
    const json = await res.json()
    setData(json)
    setCargando(false)
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

  if (cargando) return <div style={s.wrap}><div style={{color:'#888'}}>Cargando panel de admin...</div></div>
  if (error) return <div style={s.wrap}><div style={{color:'#e0001b'}}>{error}</div></div>
  if (!data) return null

  const { metricas, facturacion, alertas, crecimiento, negocios } = data

  const negociosFiltrados = negocios.filter(n =>
    n.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.telefono?.includes(busqueda)
  )

  const maxCrecimiento = Math.max(...crecimiento.map(m => Math.max(m.negocios, m.clientes)), 1)

  return (
    <div style={s.wrap}>
      <div style={s.inner}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b'}} />
            <span style={{fontSize:20, fontWeight:800, color:'white', letterSpacing:-0.5}}>fielty</span>
            <span style={{fontSize:13, color:'#555', marginLeft:4}}>/ admin</span>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            style={{padding:'8px 16px', background:'#1a1a1a', border:'none', borderRadius:10, color:'#888', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
            Salir
          </button>
        </div>

        {/* Métricas generales */}
        <div style={s.sectionTitle}>Métricas generales</div>
        <div style={s.cardsRow}>
          {[
            { label: 'Negocios totales', value: metricas.totalNegocios, color: '#e0001b' },
            { label: 'Negocios activos (30d)', value: metricas.negociosActivos, color: '#00c853' },
            { label: 'Clientes totales', value: metricas.totalClientes.toLocaleString('es-AR'), color: '#0e76fd' },
            { label: 'Puntos en circulación', value: metricas.totalPuntos.toLocaleString('es-AR'), color: '#f0a500' },
            { label: 'Canjes realizados', value: metricas.totalCanjes.toLocaleString('es-AR'), color: '#7c3aed' },
          ].map((m, i) => (
            <div key={i} style={s.metricCard}>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:8}}>{m.label}</div>
              <div style={{fontSize:32, fontWeight:900, color: m.color, fontFamily:'monospace'}}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Facturación */}
        <div style={s.sectionTitle}>Facturación</div>
        <div style={s.cardsRow}>
          <div style={{...s.metricCard, flex:2}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:12}}>MRR</div>
            <div style={{fontSize:38, fontWeight:900, color:'#00c853', fontFamily:'monospace'}}>${facturacion.mrr.toLocaleString('es-AR')}</div>
            <div style={{fontSize:12, color:'#555', marginTop:4}}>por mes</div>
          </div>
          <div style={{...s.metricCard, flex:2}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:12}}>Negocios por plan</div>
            {PLANES_OPCIONES.map(p => (
              <div key={p} style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:8, height:8, borderRadius:'50%', background: PLAN_COLORES[p]}} />
                  <span style={{fontSize:13, color:'#888'}}>{PLAN_LABELS[p]}</span>
                </div>
                <span style={{fontSize:15, fontWeight:800, color:'white', fontFamily:'monospace'}}>{facturacion.porPlan[p] || 0}</span>
              </div>
            ))}
          </div>
          <div style={s.metricCard}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:8}}>Nuevos este mes</div>
            <div style={{fontSize:32, fontWeight:900, color:'#0e76fd', fontFamily:'monospace'}}>{facturacion.nuevosEsteMes}</div>
          </div>
        </div>

        {/* Alertas */}
        {(alertas.cercaDelLimite.length > 0 || alertas.inactivos.length > 0) && (
          <>
            <div style={s.sectionTitle}>Alertas</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32}}>
              {alertas.cercaDelLimite.length > 0 && (
                <div style={s.alertCard}>
                  <div style={{fontSize:13, fontWeight:700, color:'#f0a500', marginBottom:12}}>⚠️ Cerca del límite (40+ clientes en gratis)</div>
                  {alertas.cercaDelLimite.map(n => (
                    <div key={n.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e1e1e'}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'white'}}>{n.nombre}</div>
                        <div style={{fontSize:11, color:'#555'}}>{n.email}</div>
                      </div>
                      <div style={{fontSize:13, fontWeight:700, color:'#f0a500'}}>{n.totalClientes}/50</div>
                    </div>
                  ))}
                </div>
              )}
              {alertas.inactivos.length > 0 && (
                <div style={s.alertCard}>
                  <div style={{fontSize:13, fontWeight:700, color:'#555', marginBottom:12}}>💤 Inactivos hace más de 30 días</div>
                  {alertas.inactivos.slice(0, 5).map(n => (
                    <div key={n.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e1e1e'}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'white'}}>{n.nombre}</div>
                        <div style={{fontSize:11, color:'#555'}}>{n.email}</div>
                      </div>
                      <div style={{fontSize:11, color:'#555', fontFamily:'monospace', textAlign:'right'}}>
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
                  <div style={{flex:1, background:'#e0001b', borderRadius:'4px 4px 0 0', height:`${(m.negocios / maxCrecimiento) * 100}%`, minHeight: m.negocios > 0 ? 4 : 0}} title={`${m.negocios} negocios`} />
                  <div style={{flex:1, background:'#0e76fd', borderRadius:'4px 4px 0 0', height:`${(m.clientes / maxCrecimiento) * 100}%`, minHeight: m.clientes > 0 ? 4 : 0}} title={`${m.clientes} clientes`} />
                </div>
                <div style={{fontSize:10, color:'#555', textAlign:'center'}}>{m.mes.slice(5)}/{m.mes.slice(2,4)}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:16, marginTop:12}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10, height:10, borderRadius:2, background:'#e0001b'}} /><span style={{fontSize:11, color:'#555'}}>Negocios</span></div>
            <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10, height:10, borderRadius:2, background:'#0e76fd'}} /><span style={{fontSize:11, color:'#555'}}>Clientes</span></div>
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
                {['Negocio', 'Contacto', 'Plan', 'Clientes', 'Última actividad', 'Registrado'].map(h => (
                  <th key={h} style={{padding:'14px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#555'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {negociosFiltrados.map(n => (
                <tr key={n.id} style={{borderBottom:'1px solid #151515'}}>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:32, height:32, borderRadius:8, background: n.color || '#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'white', flexShrink:0}}>
                        {n.nombre?.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{fontSize:13, fontWeight:700, color:'white'}}>{n.nombre}</div>
                    </div>
                  </td>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{fontSize:12, color:'#888'}}>{n.email}</div>
                    <div style={{fontSize:12, color:'#555'}}>{n.telefono || '—'}</div>
                  </td>
                  <td style={{padding:'14px 16px'}}>
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
                  </td>
                  <td style={{padding:'14px 16px', fontSize:13, fontWeight:700, color:'white', fontFamily:'monospace'}}>{n.totalClientes}</td>
                  <td style={{padding:'14px 16px', fontSize:12, color:'#555'}}>
                    {n.ultimaActividad ? new Date(n.ultimaActividad).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td style={{padding:'14px 16px', fontSize:12, color:'#555'}}>
                    {new Date(n.created_at).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
              {negociosFiltrados.length === 0 && (
                <tr><td colSpan={6} style={{padding:32, textAlign:'center', color:'#555', fontSize:13}}>Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0a0a0a', display:'flex', justifyContent:'center', padding:'32px 20px' },
  inner: { width:'100%', maxWidth:1200 },
  sectionTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#555', marginBottom:12 },
  cardsRow: { display:'flex', gap:12, marginBottom:32, flexWrap:'wrap' },
  metricCard: { flex:1, minWidth:160, background:'#111', borderRadius:16, padding:'20px 24px' },
  alertCard: { background:'#111', borderRadius:16, padding:20 },
}
