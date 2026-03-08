'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [negocio, setNegocio] = useState(null)
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [seccion, setSeccion] = useState('inicio')

  useEffect(() => {
    verificarAuth()
  }, [])

  async function verificarAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: negocioData } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!negocioData) { window.location.href = '/onboarding/registro'; return }

    setNegocio(negocioData)
    cargarMetricas(negocioData.id)
  }

  async function cargarMetricas(negocioId) {
    const { data: clientes } = await supabase
      .from('clientes')
      .select('*')
      .eq('negocio_id', negocioId)

    const { data: canjes } = await supabase
      .from('canjes')
      .select('*')
      .eq('negocio_id', negocioId)
      .eq('estado', 'usado')

    const { data: transacciones } = await supabase
      .from('transacciones')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .limit(10)

    const totalClientes = clientes?.length || 0
    const totalPuntos = clientes?.reduce((a, c) => a + (c.puntos || 0), 0) || 0
    const totalCanjes = canjes?.length || 0

    const hace30dias = new Date()
    hace30dias.setDate(hace30dias.getDate() - 30)
    const clientesActivos = clientes?.filter(c =>
      c.ultima_visita && new Date(c.ultima_visita) > hace30dias
    ).length || 0

    const referidos = clientes?.filter(c => c.referido_por).length || 0

    setMetricas({ totalClientes, totalPuntos, totalCanjes, clientesActivos, referidos, transacciones: transacciones || [] })
    setCargando(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (cargando) return (
    <div style={s.wrap}>
      <div style={{textAlign:'center', padding:60, color:'#888'}}>Cargando panel...</div>
    </div>
  )

  return (
    <div style={s.wrap}>
      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={{...s.bizLogo, background: negocio.color}}>
            {negocio.nombre.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={s.bizName}>{negocio.nombre}</div>
            <div style={s.bizRole}>Panel del dueño</div>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={cerrarSesion}>Salir</button>
      </div>

      {/* NAV */}
      <div style={s.nav}>
        {[
          { id:'inicio', label:'📊 Inicio' },
          { id:'clientes', label:'👥 Clientes' },
          { id:'recompensas', label:'🎁 Recompensas' },
          { id:'config', label:'⚙️ Config' },
        ].map(item => (
          <button key={item.id} style={{
            ...s.navBtn,
            background: seccion === item.id ? 'white' : 'transparent',
            color: seccion === item.id ? '#0e0e0e' : '#888',
            fontWeight: seccion === item.id ? 700 : 500,
          }} onClick={() => setSeccion(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div style={s.content}>

        {/* INICIO */}
        {seccion === 'inicio' && (
          <>
            <div style={s.sectionTitle}>Resumen del negocio</div>
            <div style={s.metricsGrid}>
              <div style={s.metricCard}>
                <div style={s.metricIcon}>👥</div>
                <div style={s.metricValue}>{metricas.totalClientes}</div>
                <div style={s.metricLabel}>Clientes totales</div>
              </div>
              <div style={s.metricCard}>
                <div style={s.metricIcon}>🔥</div>
                <div style={s.metricValue}>{metricas.clientesActivos}</div>
                <div style={s.metricLabel}>Activos (30 días)</div>
              </div>
              <div style={s.metricCard}>
                <div style={s.metricIcon}>⭐</div>
                <div style={s.metricValue}>{metricas.totalPuntos}</div>
                <div style={s.metricLabel}>Puntos en circulación</div>
              </div>
              <div style={s.metricCard}>
                <div style={s.metricIcon}>🎁</div>
                <div style={s.metricValue}>{metricas.totalCanjes}</div>
                <div style={s.metricLabel}>Canjes realizados</div>
              </div>
              <div style={s.metricCard}>
                <div style={s.metricIcon}>🤝</div>
                <div style={s.metricValue}>{metricas.referidos}</div>
                <div style={s.metricLabel}>Clientes referidos</div>
              </div>
              <div style={s.metricCard}>
                <div style={s.metricIcon}>📈</div>
                <div style={s.metricValue}>
                  {metricas.totalClientes > 0
                    ? Math.round((metricas.clientesActivos / metricas.totalClientes) * 100)
                    : 0}%
                </div>
                <div style={s.metricLabel}>Tasa de retorno</div>
              </div>
            </div>

            <div style={s.sectionTitle}>Últimas transacciones</div>
            <div style={s.card}>
              {metricas.transacciones.length === 0 && (
                <div style={{textAlign:'center', padding:24, color:'#888', fontSize:14}}>
                  Todavía no hay transacciones
                </div>
              )}
              {metricas.transacciones.map((t, i) => (
                <div key={i} style={s.transRow}>
                  <div style={{...s.transIcon, background: t.tipo === 'suma' ? '#e8faf2' : t.tipo === 'cumpleanos' ? '#fff8e0' : '#f0f0ff'}}>
                    {t.tipo === 'suma' ? '⭐' : t.tipo === 'cumpleanos' ? '🎂' : t.tipo === 'referido' ? '🤝' : '🎁'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={s.transDesc}>{t.descripcion}</div>
                    <div style={s.transDate}>{new Date(t.created_at).toLocaleDateString('es-AR')}</div>
                  </div>
                  <div style={{...s.transPts, color: t.tipo === 'suma' || t.tipo === 'cumpleanos' || t.tipo === 'referido' ? '#00b96b' : '#e0001b'}}>
                    {t.tipo === 'suma' || t.tipo === 'cumpleanos' || t.tipo === 'referido' ? '+' : '-'}{t.puntos} pts
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CLIENTES */}
        {seccion === 'clientes' && <ClientesSection negocioId={negocio.id} color={negocio.color} />}

        {/* RECOMPENSAS */}
        {seccion === 'recompensas' && <RecompensasSection negocioId={negocio.id} />}

        {/* CONFIG */}
        {seccion === 'config' && <ConfigSection negocio={negocio} setNegocio={setNegocio} />}

      </div>
    </div>
  )
}

// ===== CLIENTES =====
function ClientesSection({ negocioId, color }) {
  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    supabase.from('clientes').select('*').eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setClientes(data || []))
  }, [negocioId])

  const hace30dias = new Date()
  hace30dias.setDate(hace30dias.getDate() - 30)

  const filtrados = clientes.filter(c => {
    if (filtro === 'activos') return c.ultima_visita && new Date(c.ultima_visita) > hace30dias
    if (filtro === 'inactivos') return !c.ultima_visita || new Date(c.ultima_visita) <= hace30dias
    if (filtro === 'referidos') return c.referido_por
    return true
  })

  const getNivel = (pts) => {
    if (pts >= 5000) return '🥇 Oro'
    if (pts >= 1000) return '🥈 Plata'
    return '🥉 Bronce'
  }

  return (
    <>
      <div style={s.sectionTitle}>Clientes ({clientes.length})</div>
      <div style={s.filtros}>
        {['todos', 'activos', 'inactivos', 'referidos'].map(f => (
          <button key={f} style={{...s.filtroBtn, background: filtro === f ? '#0e0e0e' : '#f0f2f7', color: filtro === f ? 'white' : '#888'}}
            onClick={() => setFiltro(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={s.card}>
        {filtrados.map((c, i) => (
          <div key={i} style={s.clienteRow}>
            <div style={{...s.clienteAvatar, background: color}}>
              {c.nombre.slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={s.clienteNombre}>{c.nombre}</div>
              <div style={s.clienteMeta}>DNI {c.dni} · {getNivel(c.puntos_historicos || 0)}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:16, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{c.puntos}</div>
              <div style={{fontSize:10, color:'#888'}}>pts</div>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div style={{textAlign:'center', padding:24, color:'#888', fontSize:14}}>No hay clientes en este filtro</div>
        )}
      </div>
    </>
  )
}

// ===== RECOMPENSAS =====
function RecompensasSection({ negocioId }) {
  const [recompensas, setRecompensas] = useState([])
  const [nueva, setNueva] = useState({ nombre: '', puntos_necesarios: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [negocioId])

  async function cargar() {
    const { data } = await supabase.from('recompensas').select('*')
      .eq('negocio_id', negocioId).order('puntos_necesarios')
    setRecompensas(data || [])
  }

  async function agregar() {
    if (!nueva.nombre || !nueva.puntos_necesarios) return
    setGuardando(true)
    await supabase.from('recompensas').insert([{
      negocio_id: negocioId,
      nombre: nueva.nombre,
      puntos_necesarios: parseInt(nueva.puntos_necesarios),
      activa: true
    }])
    setNueva({ nombre: '', puntos_necesarios: '' })
    await cargar()
    setGuardando(false)
  }

  async function toggleActiva(r) {
    await supabase.from('recompensas').update({ activa: !r.activa }).eq('id', r.id)
    await cargar()
  }

  async function eliminar(id) {
    await supabase.from('recompensas').delete().eq('id', id)
    await cargar()
  }

  return (
    <>
      <div style={s.sectionTitle}>Recompensas</div>
      <div style={s.card}>
        {recompensas.map((r, i) => (
          <div key={i} style={s.recompensaRow}>
            <div style={{flex:1}}>
              <div style={{fontSize:15, fontWeight:700, color: r.activa ? '#0e0e0e' : '#bbb'}}>{r.nombre}</div>
              <div style={{fontSize:12, color:'#888'}}>{r.puntos_necesarios} pts</div>
            </div>
            <button style={{...s.toggleBtn, background: r.activa ? '#e8faf2' : '#f0f2f7', color: r.activa ? '#00b96b' : '#bbb'}}
              onClick={() => toggleActiva(r)}>
              {r.activa ? 'Activa' : 'Inactiva'}
            </button>
            <button style={s.deleteBtn} onClick={() => eliminar(r.id)}>✕</button>
          </div>
        ))}
        {recompensas.length === 0 && (
          <div style={{textAlign:'center', padding:24, color:'#888', fontSize:14}}>No hay recompensas todavía</div>
        )}
      </div>

      <div style={s.sectionTitle}>Agregar recompensa</div>
      <div style={s.card}>
        <div style={{display:'flex', gap:10, marginBottom:12}}>
          <input style={{...s.inputField, flex:2}} placeholder="Nombre (ej: Baño gratis)"
            value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} />
          <input style={{...s.inputField, flex:1}} type="number" placeholder="Pts"
            value={nueva.puntos_necesarios} onChange={e => setNueva({...nueva, puntos_necesarios: e.target.value})} />
        </div>
        <button style={s.btnRed} onClick={agregar} disabled={guardando}>
          {guardando ? 'Guardando...' : '+ Agregar'}
        </button>
      </div>
    </>
  )
}

// ===== CONFIG =====
function ConfigSection({ negocio, setNegocio }) {
  const [form, setForm] = useState({
    nombre: negocio.nombre,
    color: negocio.color,
    pesos_por_punto: negocio.pesos_por_punto || 100,
    puntos_por_tramo: negocio.puntos_por_tramo || 1,
    puntos_cumpleanos: negocio.puntos_cumpleanos || 50,
    puntos_referido_emisor: negocio.puntos_referido_emisor || 100,
    puntos_referido_receptor: negocio.puntos_referido_receptor || 50,
  })
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)

  async function guardar() {
    setGuardando(true)
    const { data } = await supabase.from('negocios').update(form).eq('id', negocio.id).select().single()
    setNegocio(data)
    setGuardando(false)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }

  return (
    <>
      <div style={s.sectionTitle}>Configuración</div>
      <div style={s.card}>

        <div style={s.configField}>
          <label style={s.configLabel}>Nombre del negocio</label>
          <input style={s.inputField} value={form.nombre}
            onChange={e => setForm({...form, nombre: e.target.value})} />
        </div>

        <div style={s.configField}>
          <label style={s.configLabel}>Color de marca</label>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:36, height:36, borderRadius:10, background:form.color, border:'1px solid #e8eaf0'}}/>
            <input type="color" value={form.color}
              onChange={e => setForm({...form, color: e.target.value})}
              style={{width:48, height:36, borderRadius:10, border:'1px solid #e8eaf0', cursor:'pointer', padding:2}} />
            <input style={{...s.inputField, flex:1, fontFamily:'monospace'}}
              placeholder="e0001b" maxLength={7}
              value={form.color}
              onChange={e => setForm({...form, color: e.target.value})} />
          </div>
        </div>

        <div style={s.configField}>
          <label style={s.configLabel}>Regla de puntos</label>
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            <span style={{fontSize:13, color:'#888'}}>Cada $</span>
            <input style={{...s.inputField, width:80}} type="number"
              value={form.pesos_por_punto}
              onChange={e => setForm({...form, pesos_por_punto: parseInt(e.target.value)})} />
            <span style={{fontSize:13, color:'#888'}}>→</span>
            <input style={{...s.inputField, width:60}} type="number"
              value={form.puntos_por_tramo}
              onChange={e => setForm({...form, puntos_por_tramo: parseInt(e.target.value)})} />
            <span style={{fontSize:13, color:'#888'}}>pts</span>
          </div>
        </div>

        <div style={s.configField}>
          <label style={s.configLabel}>Puntos por cumpleaños 🎂</label>
          <input style={{...s.inputField, width:100}} type="number"
            value={form.puntos_cumpleanos}
            onChange={e => setForm({...form, puntos_cumpleanos: parseInt(e.target.value)})} />
        </div>

        <div style={s.configField}>
          <label style={s.configLabel}>Puntos por referido 🤝</label>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize:11, color:'#888', marginBottom:4}}>Para el que invita</div>
              <input style={{...s.inputField, width:80}} type="number"
                value={form.puntos_referido_emisor}
                onChange={e => setForm({...form, puntos_referido_emisor: parseInt(e.target.value)})} />
            </div>
            <div>
              <div style={{fontSize:11, color:'#888', marginBottom:4}}>Para el nuevo cliente</div>
              <input style={{...s.inputField, width:80}} type="number"
                value={form.puntos_referido_receptor}
                onChange={e => setForm({...form, puntos_referido_receptor: parseInt(e.target.value)})} />
            </div>
          </div>
        </div>

        {ok && <div style={{background:'#e8faf2', color:'#00b96b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12}}>✅ Cambios guardados</div>}

        <button style={s.btnRed} onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#f0f2f7', maxWidth:480, margin:'0 auto' },
  topbar: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 16px', background:'white', borderBottom:'1px solid #e8eaf0' },
  topbarLeft: { display:'flex', alignItems:'center', gap:12 },
  bizLogo: { width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'white' },
  bizName: { fontSize:16, fontWeight:700, color:'#0e0e0e' },
  bizRole: { fontSize:11, color:'#888' },
  logoutBtn: { padding:'8px 16px', background:'#f0f2f7', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', color:'#888', fontFamily:'inherit' },
  nav: { display:'flex', background:'white', borderBottom:'1px solid #e8eaf0', padding:'0 12px', gap:4, overflowX:'auto' },
  navBtn: { padding:'14px 12px', border:'none', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' },
  content: { padding:16 },
  sectionTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:12, marginTop:8 },
  metricsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 },
  metricCard: { background:'white', borderRadius:16, padding:'16px 12px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  metricIcon: { fontSize:20, marginBottom:6 },
  metricValue: { fontSize:22, fontWeight:800, color:'#0e0e0e', fontFamily:'monospace' },
  metricLabel: { fontSize:10, color:'#888', marginTop:4, lineHeight:1.3 },
  card: { background:'white', borderRadius:20, padding:20, marginBottom:16, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  transRow: { display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f0f2f7' },
  transIcon: { width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 },
  transDesc: { fontSize:13, fontWeight:600, color:'#0e0e0e' },
  transDate: { fontSize:11, color:'#888', marginTop:2 },
  transPts: { fontSize:14, fontWeight:800, fontFamily:'monospace' },
  filtros: { display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' },
  filtroBtn: { padding:'8px 14px', border:'none', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  clienteRow: { display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f0f2f7' },
  clienteAvatar: { width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'white', flexShrink:0 },
  clienteNombre: { fontSize:14, fontWeight:700, color:'#0e0e0e' },
  clienteMeta: { fontSize:11, color:'#888', marginTop:2 },
  recompensaRow: { display:'flex', alignItems:'center', gap:10, padding:'12px 0', borderBottom:'1px solid #f0f2f7' },
  toggleBtn: { padding:'6px 12px', border:'none', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  deleteBtn: { padding:'6px 10px', background:'#fff0f0', border:'none', borderRadius:8, color:'#e0001b', cursor:'pointer', fontSize:12, fontWeight:700 },
  configField: { marginBottom:20 },
  configLabel: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  inputField: { width:'100%', padding:'12px 14px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  btnRed: { width:'100%', padding:16, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
}