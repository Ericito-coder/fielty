'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { id:'inicio', label:'Inicio', icon:'📊' },
  { id:'clientes', label:'Clientes', icon:'👥' },
  { id:'recompensas', label:'Recompensas', icon:'🎁' },
  { id:'sucursales', label:'Sucursales', icon:'🏪' },
  { id:'config', label:'Config', icon:'⚙️' },
]

export default function Dashboard() {
  const [negocio, setNegocio] = useState(null)
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [seccion, setSeccion] = useState('inicio')
  const [isMobile, setIsMobile] = useState(null)
  const [mostrarExito, setMostrarExito] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('suscripcion') === 'ok') {
      setMostrarExito(true)
      window.history.replaceState({}, '', '/dashboard')
      setTimeout(() => setMostrarExito(false), 8000)
    }
  }, [])

  useEffect(() => {
    verificarAuth()
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function verificarAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data: negocioData } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
    if (!negocioData) { window.location.href = '/onboarding/registro'; return }
    setNegocio(negocioData)
    cargarMetricas(negocioData.id)
  }

  async function cargarMetricas(negocioId) {
    const { data: clientes } = await supabase.from('clientes').select('*').eq('negocio_id', negocioId)
    const { data: canjes } = await supabase.from('canjes').select('*').eq('negocio_id', negocioId).eq('estado', 'usado')
    const { data: transacciones } = await supabase.from('transacciones').select('*').eq('negocio_id', negocioId).order('created_at', { ascending: false }).limit(10)

    const totalClientes = clientes?.length || 0
    const totalPuntos = clientes?.reduce((a, c) => a + (c.puntos || 0), 0) || 0
    const totalCanjes = canjes?.length || 0
    const hace30dias = new Date(); hace30dias.setDate(hace30dias.getDate() - 30)
    const clientesActivos = clientes?.filter(c => c.ultima_visita && new Date(c.ultima_visita) > hace30dias).length || 0
    const referidos = clientes?.filter(c => c.referido_por).length || 0

    setMetricas({ totalClientes, totalPuntos, totalCanjes, clientesActivos, referidos, transacciones: transacciones || [] })
    setCargando(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (isMobile === null) return (
    <div style={{minHeight:'100vh', background:'#f0f2f7'}} />
  )
  if (cargando) return (
    <div style={{minHeight:'100vh', background:'#f0f2f7', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#888'}}>Cargando panel...</div>
    </div>
  )

  if (isMobile) return (
    <div style={{minHeight:'100vh', background:'#f0f2f7', maxWidth:480, margin:'0 auto'}}>
      {/* MOBILE TOPBAR */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 16px', background:'white', borderBottom:'1px solid #e8eaf0'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:40, height:40, borderRadius:12, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'white'}}>
            {negocio.nombre.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:16, fontWeight:700, color:'#0e0e0e'}}>{negocio.nombre}</div>
            <div style={{fontSize:11, color:'#888'}}>Panel del dueño</div>
          </div>
        </div>
        <button style={{padding:'8px 16px', background:'#f0f2f7', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', color:'#888', fontFamily:'inherit'}} onClick={cerrarSesion}>Salir</button>
      </div>
      {/* MOBILE NAV */}
      <div style={{display:'flex', background:'white', borderBottom:'1px solid #e8eaf0', padding:'0 12px', gap:4, overflowX:'auto'}}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} style={{padding:'14px 12px', border:'none', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', background: seccion === item.id ? 'white' : 'transparent', color: seccion === item.id ? '#0e0e0e' : '#888', fontWeight: seccion === item.id ? 700 : 500}} onClick={() => setSeccion(item.id)}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <div style={{padding:16}}>
        {mostrarExito && <BannerExito onClose={() => setMostrarExito(false)} />}
        <SeccionContenido seccion={seccion} negocio={negocio} metricas={metricas} setNegocio={setNegocio} />
      </div>
    </div>
  )

  // DESKTOP LAYOUT
  return (
    <div style={{minHeight:'100vh', background:'#f0f2f7', display:'flex'}}>
      {/* SIDEBAR */}
      <div style={{width:260, background:'#0e0e0e', minHeight:'100vh', display:'flex', flexDirection:'column', position:'fixed', left:0, top:0, bottom:0}}>
        {/* Logo */}
        <div style={{padding:'28px 24px 24px', borderBottom:'1px solid #1e1e1e'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:20}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 8px #e0001b'}}/>
            <span style={{fontSize:18, fontWeight:800, color:'white', letterSpacing:-0.5}}>fielty</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:36, height:36, borderRadius:10, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'white', flexShrink:0}}>
              {negocio.nombre.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:14, fontWeight:700, color:'white'}}>{negocio.nombre}</div>
              <div style={{fontSize:11, color:'#555'}}>Panel del dueño</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{padding:'16px 12px', flex:1}}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setSeccion(item.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:12,
              padding:'12px 16px', borderRadius:12, border:'none', cursor:'pointer',
              fontFamily:'inherit', fontSize:14, fontWeight: seccion === item.id ? 700 : 500,
              background: seccion === item.id ? '#1e1e1e' : 'transparent',
              color: seccion === item.id ? 'white' : '#666',
              marginBottom:4, textAlign:'left', transition:'all 0.15s'
            }}>
              <span style={{fontSize:18}}>{item.icon}</span>
              {item.label}
              {seccion === item.id && <div style={{marginLeft:'auto', width:4, height:4, borderRadius:'50%', background: negocio.color}} />}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div style={{padding:'16px 12px', borderTop:'1px solid #1e1e1e'}}>
          <button onClick={cerrarSesion} style={{width:'100%', padding:'12px 16px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, background:'transparent', color:'#555', textAlign:'left', display:'flex', alignItems:'center', gap:12}}>
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{marginLeft:260, flex:1, padding:32, minHeight:'100vh'}}>
        {mostrarExito && <BannerExito onClose={() => setMostrarExito(false)} />}
        {/* Header */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:22, fontWeight:800, color:'#0e0e0e'}}>
            {NAV_ITEMS.find(n => n.id === seccion)?.icon} {NAV_ITEMS.find(n => n.id === seccion)?.label}
          </div>
          <div style={{fontSize:13, color:'#888', marginTop:4}}>
            {seccion === 'inicio' && 'Resumen general de tu negocio'}
            {seccion === 'clientes' && 'Todos los clientes registrados'}
            {seccion === 'recompensas' && 'Gestión de recompensas y canjes'}
            {seccion === 'sucursales' && 'Tus locales y URLs de caja'}
            {seccion === 'config' && 'Configuración de tu programa'}
          </div>
        </div>
        <SeccionContenido seccion={seccion} negocio={negocio} metricas={metricas} setNegocio={setNegocio} isDesktop={true} />
      </div>
    </div>
  )
}

function SeccionContenido({ seccion, negocio, metricas, setNegocio, isDesktop }) {
  if (seccion === 'inicio') return <InicioSection negocio={negocio} metricas={metricas} isDesktop={isDesktop} />
  if (seccion === 'clientes') return <ClientesSection negocioId={negocio.id} color={negocio.color} isDesktop={isDesktop} />
  if (seccion === 'recompensas') return <RecompensasSection negocioId={negocio.id} isDesktop={isDesktop} />
  if (seccion === 'sucursales') return <SucursalesSection negocio={negocio} />
  if (seccion === 'config') return <ConfigSection negocio={negocio} setNegocio={setNegocio} />
  return null
}

// ===== INICIO =====
function InicioSection({ negocio, metricas, isDesktop }) {
  const gridCols = isDesktop ? 'repeat(3,1fr)' : 'repeat(3,1fr)'
  return (
    <>
      <div style={{display:'grid', gridTemplateColumns: isDesktop ? 'repeat(6,1fr)' : 'repeat(3,1fr)', gap:12, marginBottom:24}}>
        {[
          { icon:'👥', value: metricas.totalClientes, label:'Clientes totales' },
          { icon:'🔥', value: metricas.clientesActivos, label:'Activos (30 días)' },
          { icon:'⭐', value: metricas.totalPuntos, label:'Puntos circulación' },
          { icon:'🎁', value: metricas.totalCanjes, label:'Canjes realizados' },
          { icon:'🤝', value: metricas.referidos, label:'Referidos' },
          { icon:'📈', value: metricas.totalClientes > 0 ? Math.round((metricas.clientesActivos / metricas.totalClientes) * 100) + '%' : '0%', label:'Tasa de retorno' },
        ].map((m, i) => (
          <div key={i} style={{background:'white', borderRadius:16, padding:'20px 16px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize:24, marginBottom:8}}>{m.icon}</div>
            <div style={{fontSize: isDesktop ? 28 : 22, fontWeight:800, color:'#0e0e0e', fontFamily:'monospace'}}>{m.value}</div>
            <div style={{fontSize:11, color:'#888', marginTop:4, lineHeight:1.3}}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{display: isDesktop ? 'grid' : 'block', gridTemplateColumns:'1fr 1fr', gap:20}}>
        <div>
          <div style={s.sectionTitle}>Links del negocio</div>
          <div style={s.card}>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:6}}>Registro de clientes</div>
              <div style={{background:'#f0f2f7', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'monospace', color:'#0e0e0e', wordBreak:'break-all', marginBottom:8}}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/registro/{negocio.slug}
              </div>
              <div style={{display:'flex', gap:8}}>
                <button style={{...s.btnRed, padding:10, fontSize:13, flex:1}} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/registro/${negocio.slug}`)}>📋 Copiar link</button>
                <button style={{...s.btnRed, padding:10, fontSize:13, flex:1, background:'#0e0e0e'}} onClick={() => window.open(`/qr/${negocio.slug}`, '_blank')}>🖨️ Ver QR</button>
              </div>
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:6}}>Caja (sin sucursal)</div>
              <div style={{background:'#f0f2f7', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'monospace', color:'#0e0e0e', wordBreak:'break-all', marginBottom:8}}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/c/{negocio.slug}
              </div>
              <button style={{...s.btnRed, padding:10, fontSize:13}} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/c/${negocio.slug}`)}>📋 Copiar link de caja</button>
            </div>
          </div>
        </div>

        <div>
          <div style={s.sectionTitle}>Últimas transacciones</div>
          <div style={s.card}>
            {metricas.transacciones.length === 0 && <div style={{textAlign:'center', padding:24, color:'#888', fontSize:14}}>Todavía no hay transacciones</div>}
            {metricas.transacciones.map((t, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f0f2f7'}}>
                <div style={{width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, background: t.tipo === 'suma' ? '#e8faf2' : t.tipo === 'cumpleanos' ? '#fff8e0' : '#f0f0ff'}}>
                  {t.tipo === 'suma' ? '⭐' : t.tipo === 'cumpleanos' ? '🎂' : t.tipo === 'referido' ? '🤝' : '🎁'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:600, color:'#0e0e0e'}}>{t.descripcion}</div>
                  <div style={{fontSize:11, color:'#888', marginTop:2}}>{new Date(t.created_at).toLocaleDateString('es-AR')}</div>
                </div>
                <div style={{fontSize:14, fontWeight:800, fontFamily:'monospace', color: t.tipo === 'suma' || t.tipo === 'cumpleanos' || t.tipo === 'referido' ? '#00b96b' : '#e0001b'}}>
                  {t.tipo === 'suma' || t.tipo === 'cumpleanos' || t.tipo === 'referido' ? '+' : '-'}{t.puntos} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <MetricasSucursales negocioId={negocio.id} isDesktop={isDesktop} />
    </>
  )
}

// ===== CLIENTES =====
function ClientesSection({ negocioId, color, isDesktop }) {
  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    supabase.from('clientes').select('*').eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setClientes(data || []))
  }, [negocioId])

  const hace30dias = new Date(); hace30dias.setDate(hace30dias.getDate() - 30)

  const filtrados = clientes.filter(c => {
    const matchFiltro = filtro === 'activos' ? c.ultima_visita && new Date(c.ultima_visita) > hace30dias
      : filtro === 'inactivos' ? !c.ultima_visita || new Date(c.ultima_visita) <= hace30dias
      : filtro === 'referidos' ? c.referido_por : true
    const matchBusqueda = !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.dni.includes(busqueda)
    return matchFiltro && matchBusqueda
  })

  const getNivel = (pts) => pts >= 5000 ? '🥇 Oro' : pts >= 1000 ? '🥈 Plata' : '🥉 Bronce'

  return (
    <>
      <div style={{display: isDesktop ? 'flex' : 'block', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:16}}>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom: isDesktop ? 0 : 12}}>
          {['todos', 'activos', 'inactivos', 'referidos'].map(f => (
            <button key={f} style={{...s.filtroBtn, background: filtro === f ? '#0e0e0e' : '#f0f2f7', color: filtro === f ? 'white' : '#888'}} onClick={() => setFiltro(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {isDesktop && (
          <input placeholder="🔍 Buscar por nombre o DNI..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{padding:'10px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:14, fontFamily:'inherit', outline:'none', width:280}} />
        )}
      </div>
      <div style={s.card}>
        <div style={{fontSize:11, color:'#888', marginBottom:12}}>{filtrados.length} clientes</div>
        {isDesktop ? (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #f0f2f7'}}>
                {['Cliente', 'DNI', 'Nivel', 'Puntos', 'Visitas', 'Última visita'].map(h => (
                  <th key={h} style={{textAlign:'left', padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, i) => (
                <tr key={i} style={{borderBottom:'1px solid #f0f2f7'}}>
                  <td style={{padding:'14px 12px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:36, height:36, borderRadius:10, background: color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'white', flexShrink:0}}>
                        {c.nombre.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e'}}>{c.nombre}</div>
                    </div>
                  </td>
                  <td style={{padding:'14px 12px', fontSize:13, color:'#888'}}>{c.dni}</td>
                  <td style={{padding:'14px 12px', fontSize:13}}>{getNivel(c.puntos_historicos || 0)}</td>
                  <td style={{padding:'14px 12px', fontSize:16, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{c.puntos}</td>
                  <td style={{padding:'14px 12px', fontSize:13, color:'#888'}}>{c.visitas || 0}</td>
                  <td style={{padding:'14px 12px', fontSize:13, color:'#888'}}>{c.ultima_visita ? new Date(c.ultima_visita).toLocaleDateString('es-AR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          filtrados.map((c, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f0f2f7'}}>
              <div style={{width:40, height:40, borderRadius:12, background: color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'white', flexShrink:0}}>
                {c.nombre.slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e'}}>{c.nombre}</div>
                <div style={{fontSize:11, color:'#888', marginTop:2}}>DNI {c.dni} · {getNivel(c.puntos_historicos || 0)}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:16, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{c.puntos}</div>
                <div style={{fontSize:10, color:'#888'}}>pts</div>
              </div>
            </div>
          ))
        )}
        {filtrados.length === 0 && <div style={{textAlign:'center', padding:24, color:'#888', fontSize:14}}>No hay clientes en este filtro</div>}
      </div>
    </>
  )
}

// ===== RECOMPENSAS =====
function RecompensasSection({ negocioId, isDesktop }) {
  const [recompensas, setRecompensas] = useState([])
  const [nueva, setNueva] = useState({ nombre: '', puntos_necesarios: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [negocioId])

  async function cargar() {
    const { data } = await supabase.from('recompensas').select('*').eq('negocio_id', negocioId).order('puntos_necesarios')
    setRecompensas(data || [])
  }

  async function agregar() {
    if (!nueva.nombre || !nueva.puntos_necesarios) return
    setGuardando(true)
    await supabase.from('recompensas').insert([{ negocio_id: negocioId, nombre: nueva.nombre, puntos_necesarios: parseInt(nueva.puntos_necesarios), activa: true }])
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
    <div style={{display: isDesktop ? 'grid' : 'block', gridTemplateColumns:'1fr 360px', gap:20, alignItems:'start'}}>
      <div>
        <div style={s.sectionTitle}>Recompensas activas</div>
        <div style={s.card}>
          {recompensas.map((r, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'14px 0', borderBottom:'1px solid #f0f2f7'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15, fontWeight:700, color: r.activa ? '#0e0e0e' : '#bbb'}}>{r.nombre}</div>
                <div style={{fontSize:12, color:'#888'}}>{r.puntos_necesarios} pts</div>
              </div>
              <button style={{...s.toggleBtn, background: r.activa ? '#e8faf2' : '#f0f2f7', color: r.activa ? '#00b96b' : '#bbb'}} onClick={() => toggleActiva(r)}>
                {r.activa ? 'Activa' : 'Inactiva'}
              </button>
              <button style={s.deleteBtn} onClick={() => eliminar(r.id)}>✕</button>
            </div>
          ))}
          {recompensas.length === 0 && <div style={{textAlign:'center', padding:24, color:'#888', fontSize:14}}>No hay recompensas todavía</div>}
        </div>
      </div>
      <div>
        <div style={s.sectionTitle}>Agregar recompensa</div>
        <div style={s.card}>
          <div style={s.configField}>
            <label style={s.configLabel}>Nombre</label>
            <input style={s.inputField} placeholder="Ej: Baño gratis" value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} />
          </div>
          <div style={s.configField}>
            <label style={s.configLabel}>Puntos necesarios</label>
            <input style={s.inputField} type="number" placeholder="Ej: 100" value={nueva.puntos_necesarios} onChange={e => setNueva({...nueva, puntos_necesarios: e.target.value})} />
          </div>
          <button style={s.btnRed} onClick={agregar} disabled={guardando}>{guardando ? 'Guardando...' : '+ Agregar'}</button>
        </div>
      </div>
    </div>
  )
}

// ===== CONFIG =====
function ConfigSection({ negocio, setNegocio }) {
  const [form, setForm] = useState({
    nombre: negocio.nombre, color: negocio.color,
    pesos_por_punto: negocio.pesos_por_punto || 100,
    puntos_por_tramo: negocio.puntos_por_tramo || 1,
    puntos_cumpleanos: negocio.puntos_cumpleanos || 50,
    puntos_referido_emisor: negocio.puntos_referido_emisor || 100,
    puntos_referido_receptor: negocio.puntos_referido_receptor || 50,
    pin_caja: negocio.pin_caja || '1234',
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
    <div style={{maxWidth:600}}>
      <div style={s.card}>
        <div style={s.configField}>
          <label style={s.configLabel}>Nombre del negocio</label>
          <input style={s.inputField} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel}>Color de marca</label>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:36, height:36, borderRadius:10, background:form.color, border:'1px solid #e8eaf0'}}/>
            <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{width:48, height:36, borderRadius:10, border:'1px solid #e8eaf0', cursor:'pointer', padding:2}} />
            <input style={{...s.inputField, flex:1, fontFamily:'monospace'}} placeholder="e0001b" maxLength={7} value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
          </div>
        </div>
        <div style={s.configField}>
          <label style={s.configLabel}>Regla de puntos</label>
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            <span style={{fontSize:13, color:'#888'}}>Cada $</span>
            <input style={{...s.inputField, width:80}} type="number" value={form.pesos_por_punto} onChange={e => setForm({...form, pesos_por_punto: parseInt(e.target.value)})} />
            <span style={{fontSize:13, color:'#888'}}>→</span>
            <input style={{...s.inputField, width:60}} type="number" value={form.puntos_por_tramo} onChange={e => setForm({...form, puntos_por_tramo: parseInt(e.target.value)})} />
            <span style={{fontSize:13, color:'#888'}}>pts</span>
          </div>
        </div>
        <div style={s.configField}>
          <label style={s.configLabel}>Puntos por cumpleaños 🎂</label>
          <input style={{...s.inputField, width:100}} type="number" value={form.puntos_cumpleanos} onChange={e => setForm({...form, puntos_cumpleanos: parseInt(e.target.value)})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel}>PIN de caja 🔐</label>
          <input style={{...s.inputField, width:120, fontFamily:'monospace', letterSpacing:4}} type="password" maxLength={6} placeholder="••••" value={form.pin_caja || ''} onChange={e => setForm({...form, pin_caja: e.target.value})} />
          <div style={{fontSize:11, color:'#aaa', marginTop:6}}>El PIN que usan tus empleados para entrar a la caja</div>
        </div>
        <div style={s.configField}>
          <label style={s.configLabel}>Puntos por referido 🤝</label>
          <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
            <div>
              <div style={{fontSize:11, color:'#888', marginBottom:4}}>Para el que invita</div>
              <input style={{...s.inputField, width:100}} type="number" value={form.puntos_referido_emisor} onChange={e => setForm({...form, puntos_referido_emisor: parseInt(e.target.value)})} />
            </div>
            <div>
              <div style={{fontSize:11, color:'#888', marginBottom:4}}>Para el nuevo cliente</div>
              <input style={{...s.inputField, width:100}} type="number" value={form.puntos_referido_receptor} onChange={e => setForm({...form, puntos_referido_receptor: parseInt(e.target.value)})} />
            </div>
          </div>
        </div>
        {ok && <div style={{background:'#e8faf2', color:'#00b96b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12}}>✅ Cambios guardados</div>}
        <button style={s.btnRed} onClick={guardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
      </div>
    </div>
  )
}

// ===== SUCURSALES =====
function SucursalesSection({ negocio }) {
  const [sucursales, setSucursales] = useState([])
  const [nueva, setNueva] = useState({ nombre: '', direccion: '', pin_caja: '1234' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [negocio.id])

  async function cargar() {
    const { data } = await supabase.from('sucursales').select('*').eq('negocio_id', negocio.id).order('created_at')
    setSucursales(data || [])
  }

  async function agregar() {
    if (!nueva.nombre) return
    setGuardando(true)
    const slugSuc = nueva.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await supabase.from('sucursales').insert([{ negocio_id: negocio.id, nombre: nueva.nombre, slug: slugSuc, direccion: nueva.direccion, pin_caja: nueva.pin_caja || '1234' }])
    setNueva({ nombre: '', direccion: '', pin_caja: '1234' })
    await cargar()
    setGuardando(false)
  }

  async function eliminar(id) {
    await supabase.from('sucursales').delete().eq('id', id)
    await cargar()
  }

  const urlBase = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <>
      {sucursales.length === 0 && (
        <div style={{...s.card, textAlign:'center', color:'#888', fontSize:14, padding:28}}>
          Sin sucursales — tu caja usa la URL principal.<br/>
          <span style={{fontSize:12, marginTop:8, display:'block'}}>Agregá sucursales si tenés más de un local.</span>
        </div>
      )}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16, marginBottom:20}}>
        {sucursales.map((suc, i) => (
        <div key={i} style={s.card}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12}}>
            <div>
              <div style={{fontSize:16, fontWeight:800, color:'#0e0e0e'}}>{suc.nombre}</div>
              {suc.direccion && <div style={{fontSize:12, color:'#888', marginTop:2}}>{suc.direccion}</div>}
            </div>
            <button style={s.deleteBtn} onClick={() => eliminar(suc.id)}>✕</button>
          </div>
          <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:6}}>URL de caja</div>
          <div style={{background:'#f0f2f7', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'monospace', color:'#0e0e0e', wordBreak:'break-all', marginBottom:8}}>
            {urlBase}/c/{negocio.slug}/{suc.slug}
          </div>
          <button style={{...s.btnRed, padding:12, fontSize:13, marginBottom:12}} onClick={() => navigator.clipboard.writeText(`${urlBase}/c/${negocio.slug}/${suc.slug}`)}>📋 Copiar URL de caja</button>
          <PinSucursal suc={suc} recargar={cargar} />
        </div>
      ))}
      </div>
      <div style={s.sectionTitle}>Agregar sucursal</div>
      <div style={{...s.card, maxWidth:480}}>
        <div style={s.configField}>
          <label style={s.configLabel}>Nombre</label>
          <input style={s.inputField} placeholder="Ej: Sucursal Centro" value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel}>Dirección (opcional)</label>
          <input style={s.inputField} placeholder="Ej: Av. Corrientes 1234" value={nueva.direccion} onChange={e => setNueva({...nueva, direccion: e.target.value})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel}>PIN de caja 🔐</label>
          <input style={{...s.inputField, width:120, fontFamily:'monospace', letterSpacing:4}} type="password" maxLength={6} placeholder="1234" value={nueva.pin_caja} onChange={e => setNueva({...nueva, pin_caja: e.target.value})} />
        </div>
        <button style={s.btnRed} onClick={agregar} disabled={guardando}>{guardando ? 'Guardando...' : '+ Agregar sucursal'}</button>
      </div>
    </>
  )
}

function PinSucursal({ suc, recargar }) {
  const [pin, setPin] = useState(suc.pin_caja || '1234')
  const [mostrar, setMostrar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)

  async function guardar() {
    setGuardando(true)
    await supabase.from('sucursales').update({ pin_caja: pin }).eq('id', suc.id)
    setGuardando(false)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
    recargar()
  }

  return (
    <div style={{borderTop:'1px solid #f0f2f7', paddingTop:12}}>
      <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8}}>PIN de caja 🔐</div>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', border:'2px solid #e8eaf0', borderRadius:12, overflow:'hidden', flex:1, maxWidth:180}}>
          <input style={{padding:'10px 14px', border:'none', fontSize:15, fontFamily:'monospace', letterSpacing: mostrar ? 2 : 4, outline:'none', width:'100%'}}
            type={mostrar ? 'text' : 'password'} maxLength={6} value={pin}
            onChange={e => setPin(e.target.value)} />
          <button style={{padding:'10px 12px', background:'#f0f2f7', border:'none', cursor:'pointer', fontSize:14}}
            onClick={() => setMostrar(!mostrar)}>
            {mostrar ? '🙈' : '👁️'}
          </button>
        </div>
        <button style={{padding:'10px 16px', background: ok ? '#00b96b' : '#0e0e0e', border:'none', borderRadius:12, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}
          onClick={guardar} disabled={guardando}>
          {ok ? '✓ Guardado' : guardando ? '...' : 'Cambiar'}
        </button>
      </div>
    </div>
  )
}

function MetricasSucursales({ negocioId, isDesktop }) {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: sucursales } = await supabase
        .from('sucursales').select('*').eq('negocio_id', negocioId)

      if (!sucursales || sucursales.length === 0) { setCargando(false); return }

      const resultados = await Promise.all(sucursales.map(async (suc) => {
        const { data: transacciones } = await supabase
          .from('transacciones').select('puntos, tipo')
          .eq('negocio_id', negocioId).eq('sucursal_id', suc.id)

        const { data: canjes } = await supabase
          .from('canjes').select('id')
          .eq('negocio_id', negocioId).eq('sucursal_id', suc.id).eq('estado', 'usado')

        const puntosAcreditados = transacciones?.filter(t => t.tipo === 'suma')
          .reduce((a, t) => a + (t.puntos || 0), 0) || 0
        const totalTransacciones = transacciones?.filter(t => t.tipo === 'suma').length || 0
        const totalCanjes = canjes?.length || 0

        return {
          nombre: suc.nombre,
          puntosAcreditados,
          totalTransacciones,
          totalCanjes,
        }
      }))

      setDatos(resultados.sort((a, b) => b.puntosAcreditados - a.puntosAcreditados))
      setCargando(false)
    }
    cargar()
  }, [negocioId])

  if (cargando || datos.length === 0) return null

  const maxPuntos = Math.max(...datos.map(d => d.puntosAcreditados), 1)

  return (
    <>
      <div style={s.sectionTitle}>Rendimiento por sucursal</div>
      <div style={{display: isDesktop ? 'grid' : 'block', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16, marginBottom:20}}>
        {datos.map((suc, i) => (
          <div key={i} style={{background:'white', borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom: isDesktop ? 0 : 12}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
              <div style={{fontSize:15, fontWeight:800, color:'#0e0e0e'}}>📍 {suc.nombre}</div>
              {i === 0 && datos.length > 1 && (
                <div style={{background:'#fff8e0', color:'#f0a500', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100}}>🏆 Top</div>
              )}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16}}>
              <div style={{textAlign:'center', background:'#f0f2f7', borderRadius:12, padding:'12px 8px'}}>
                <div style={{fontSize:20, fontWeight:800, color:'#0e0e0e', fontFamily:'monospace'}}>{suc.totalTransacciones}</div>
                <div style={{fontSize:10, color:'#888', marginTop:2}}>Ventas</div>
              </div>
              <div style={{textAlign:'center', background:'#f0f2f7', borderRadius:12, padding:'12px 8px'}}>
                <div style={{fontSize:20, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{suc.puntosAcreditados}</div>
                <div style={{fontSize:10, color:'#888', marginTop:2}}>Puntos</div>
              </div>
              <div style={{textAlign:'center', background:'#f0f2f7', borderRadius:12, padding:'12px 8px'}}>
                <div style={{fontSize:20, fontWeight:800, color:'#00b96b', fontFamily:'monospace'}}>{suc.totalCanjes}</div>
                <div style={{fontSize:10, color:'#888', marginTop:2}}>Canjes</div>
              </div>
            </div>
            <div style={{fontSize:11, color:'#888', marginBottom:6}}>Puntos acreditados</div>
            <div style={{background:'#f0f2f7', borderRadius:100, height:8, overflow:'hidden'}}>
              <div style={{height:'100%', borderRadius:100, background:'linear-gradient(90deg, #e0001b, #f0a500)', width: `${Math.round((suc.puntosAcreditados / maxPuntos) * 100)}%`, transition:'width 0.8s ease'}} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

const s = {
  sectionTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:12, marginTop:8 },
  card: { background:'white', borderRadius:20, padding:20, marginBottom:16, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  filtroBtn: { padding:'8px 14px', border:'none', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  toggleBtn: { padding:'6px 12px', border:'none', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  deleteBtn: { padding:'6px 10px', background:'#fff0f0', border:'none', borderRadius:8, color:'#e0001b', cursor:'pointer', fontSize:12, fontWeight:700 },
  configField: { marginBottom:20 },
  configLabel: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  inputField: { width:'100%', padding:'12px 14px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  btnRed: { width:'100%', padding:16, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
}

function BannerExito({ onClose }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #00c853, #1de9b6)',
      borderRadius: 16,
      padding: '16px 20px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 4px 16px rgba(0,200,83,0.25)',
    }}>
      <span style={{ fontSize: 24 }}>🎉</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>¡Suscripción activada!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
          Tu plan fue activado correctamente. Los beneficios ya están disponibles.
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        ✕
      </button>
    </div>
  )
}