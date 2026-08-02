'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import { linkWhatsApp } from '@/lib/wa'
import { esPago } from '@/lib/planes'
import { PINES_COMUNES, validarPin } from '@/lib/pin'

const NAV_ITEMS = [
  { id:'inicio', label:'Inicio', icon:'📊' },
  { id:'clientes', label:'Clientes', icon:'👥' },
  { id:'campanas', label:'Campañas', icon:'📣' },
  { id:'recompensas', label:'Recompensas', icon:'🎁' },
  { id:'sucursales', label:'Sucursales', icon:'🏪' },
  { id:'config', label:'Config', icon:'⚙️' },
]

export default function Dashboard() {
  const [negocio, setNegocio] = useState(null)
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [seccion, setSeccion] = useState('inicio')
  const [isMobile, setIsMobile] = useState(null)
  const [mostrarExito, setMostrarExito] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    verificarAuth()
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function verificarAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      let { data: negocioData } = await supabase.from('negocios').select('*').eq('user_id', user.id).single()
      if (!negocioData) { window.location.href = '/onboarding/registro'; return }

      // Al volver del checkout de Mercado Pago, verificamos el pago
      // contra la API de MP en vez de esperar el webhook: así el plan
      // queda activo aunque la notificación no llegue.
      const params = new URLSearchParams(window.location.search)
      if (params.get('suscripcion') === 'ok') {
        window.history.replaceState({}, '', '/dashboard')
        const actualizado = await verificarPago(negocioData.id)
        if (actualizado) negocioData = { ...negocioData, plan: actualizado }
        setMostrarExito(true)
        setTimeout(() => setMostrarExito(false), 8000)
      }

      setNegocio(negocioData)
      await cargarMetricas(negocioData.id)
    } catch {
      setErrorCarga('No se pudo cargar el panel. Revisá tu conexión y recargá la página.')
      setCargando(false)
    }
  }

  async function cargarMetricas(negocioId) {
    try {
      const hace30dias = new Date(); hace30dias.setDate(hace30dias.getDate() - 30)

      const [
        { data: clientes },
        { data: todosCanjes },
        { data: transacciones },
      ] = await Promise.all([
        supabase.from('clientes').select('*').eq('negocio_id', negocioId).order('puntos_historicos', { ascending: false }),
        supabase.from('canjes').select('*, recompensas(nombre)').eq('negocio_id', negocioId),
        supabase.from('transacciones').select('*').eq('negocio_id', negocioId).order('created_at', { ascending: false }).limit(10),
      ])

      const totalClientes = clientes?.length || 0
      const nuevosEsteMes = clientes?.filter(c => new Date(c.created_at) > hace30dias).length || 0
      const totalPuntos = clientes?.reduce((a, c) => a + (c.puntos || 0), 0) || 0
      const clientesActivos = clientes?.filter(c => c.ultima_visita && new Date(c.ultima_visita) > hace30dias).length || 0
      const referidos = clientes?.filter(c => c.referido_por).length || 0
      const topClientes = clientes?.slice(0, 5) || []

      const canjesUsados = todosCanjes?.filter(c => c.estado === 'usado') || []
      const totalCanjes = canjesUsados.length
      const canjesEsteMes = canjesUsados.filter(c => new Date(c.usado_at || c.created_at) > hace30dias).length
      const canjesPendientes = todosCanjes?.filter(c => c.estado === 'pendiente').length || 0

      const conteos = {}
      canjesUsados.forEach(c => {
        const nombre = c.recompensas?.nombre
        if (nombre) conteos[nombre] = (conteos[nombre] || 0) + 1
      })
      const recompensaMasCanjeada = Object.entries(conteos).sort((a, b) => b[1] - a[1])[0] || null

      setMetricas({
        totalClientes, nuevosEsteMes, totalPuntos, totalCanjes, canjesEsteMes,
        canjesPendientes, clientesActivos, referidos, topClientes, recompensaMasCanjeada,
        transacciones: transacciones || [],
      })
      setCargando(false)
    } catch {
      setErrorCarga('No se pudieron cargar las métricas. Recargá la página.')
      setCargando(false)
    }
  }

  // Consulta Mercado Pago y activa el plan si hay un pago autorizado.
  // Devuelve el plan resultante, o null si no pudo verificar.
  async function verificarPago(negocioId) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/suscripcion/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ negocioId }),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.plan || null
    } catch {
      return null
    }
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
      {errorCarga
        ? <div style={{textAlign:'center', padding:40}}>
            <div style={{fontSize:32, marginBottom:12}}>⚠️</div>
            <div style={{fontSize:15, fontWeight:700, color:'#0e0e0e', marginBottom:6}}>{errorCarga}</div>
            <button onClick={() => window.location.reload()} style={{marginTop:12, padding:'10px 24px', background:'#e0001b', border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
              Recargar
            </button>
          </div>
        : <div style={{color:'#666'}}>Cargando panel...</div>
      }
    </div>
  )

  if (isMobile) return (
    <div style={{minHeight:'100vh', background:'#f0f2f7', maxWidth:480, margin:'0 auto'}}>
      {/* DRAWER OVERLAY */}
      {menuAbierto && (
        <div style={{position:'fixed', inset:0, zIndex:100, display:'flex'}}>
          <div style={{flex:1, background:'rgba(0,0,0,0.45)'}} onClick={() => setMenuAbierto(false)} />
          <div style={{width:260, background:'#0e0e0e', height:'100%', display:'flex', flexDirection:'column', padding:'28px 16px', gap:4, overflowY:'auto'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:24, paddingLeft:8}}>
              <div style={{width:36, height:36, borderRadius:10, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'white', flexShrink:0}}>
                {negocio.nombre.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:14, fontWeight:700, color:'white'}}>{negocio.nombre}</div>
                <div style={{fontSize:11, color:'#666'}}>Panel del dueño</div>
              </div>
            </div>
            {NAV_ITEMS.map(item => (
              <button key={item.id} style={{padding:'15px 16px', border:'none', borderRadius:12, fontSize:14, cursor:'pointer', fontFamily:'inherit', textAlign:'left', background: seccion === item.id ? '#1e1e1e' : 'transparent', color: seccion === item.id ? 'white' : '#666', fontWeight: seccion === item.id ? 700 : 500}}
                onClick={() => { setSeccion(item.id); setMenuAbierto(false) }}>
                {item.icon} {item.label}
              </button>
            ))}
            <div style={{marginTop:'auto', paddingTop:24}}>
              <button style={{width:'100%', padding:'12px 16px', background:'transparent', border:'1px solid #2a2a2a', borderRadius:12, color:'#666', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textAlign:'left'}} onClick={cerrarSesion}>
                ↩ Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MOBILE TOPBAR */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 16px', background:'white', borderBottom:'1px solid #e8eaf0', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:40, height:40, borderRadius:12, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'white'}}>
            {negocio.nombre.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:16, fontWeight:700, color:'#0e0e0e'}}>{negocio.nombre}</div>
            <div style={{fontSize:11, color:'#666'}}>{NAV_ITEMS.find(n => n.id === seccion)?.icon} {NAV_ITEMS.find(n => n.id === seccion)?.label}</div>
          </div>
        </div>
        <button style={{width:44, height:44, background:'#f0f2f7', border:'none', borderRadius:10, fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setMenuAbierto(true)}>
          ☰
        </button>
      </div>
      <div style={{padding:16}}>
        {mostrarExito && <BannerExito onClose={() => setMostrarExito(false)} />}
        {negocio.plan === 'gratis' && metricas && <BannerLimite totalClientes={metricas.totalClientes} />}
        <BannerPinDebil negocio={negocio} onConfigurar={() => { setSeccion('config'); setMenuAbierto(false) }} />
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
        {/* Plan badge */}
        <div style={{padding:'12px 12px 0'}}>
          {negocio.plan && negocio.plan !== 'gratis' ? (
            <div style={{padding:'10px 16px', borderRadius:12, background:'#1e1e1e', display:'flex', alignItems:'center', gap:8}}>
              <div style={{width:8, height:8, borderRadius:'50%', background: negocio.plan === 'business' ? '#f0a500' : '#e0001b', flexShrink:0}} />
              <span style={{fontSize:13, fontWeight:700, color:'white', textTransform:'capitalize'}}>
                Plan {negocio.plan === 'pro_early' ? 'Pro' : negocio.plan}
              </span>
            </div>
          ) : (
            <button onClick={() => window.location.href = '/dashboard/upgrade'} style={{width:'100%', padding:'10px 16px', borderRadius:12, border:'1px dashed #333', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700, color:'#e0001b', textAlign:'left', display:'flex', alignItems:'center', gap:8}}>
              <span>⬆</span> Mejorar plan
            </button>
          )}
        </div>
        <div style={{padding:'12px 12px', borderTop:'1px solid #1e1e1e', marginTop:12}}>
          <button onClick={cerrarSesion} style={{width:'100%', padding:'12px 16px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, background:'transparent', color:'#555', textAlign:'left', display:'flex', alignItems:'center', gap:12}}>
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{marginLeft:260, flex:1, padding:32, minHeight:'100vh'}}>
        {mostrarExito && <BannerExito onClose={() => setMostrarExito(false)} />}
        {negocio.plan === 'gratis' && metricas && <BannerLimite totalClientes={metricas.totalClientes} />}
        <BannerPinDebil negocio={negocio} onConfigurar={() => setSeccion('config')} />
        {/* Header */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:22, fontWeight:800, color:'#0e0e0e'}}>
            {NAV_ITEMS.find(n => n.id === seccion)?.icon} {NAV_ITEMS.find(n => n.id === seccion)?.label}
          </div>
          <div style={{fontSize:13, color:'#666', marginTop:4}}>
            {seccion === 'inicio' && 'Resumen general de tu negocio'}
            {seccion === 'clientes' && 'Todos los clientes registrados'}
            {seccion === 'recompensas' && 'Gestión de recompensas y canjes'}
            {seccion === 'sucursales' && 'Tus locales y URLs de caja'}
            {seccion === 'campanas' && 'Traé de vuelta a tus clientes'}
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
  if (seccion === 'clientes') return <ClientesSection negocioId={negocio.id} color={negocio.color} plan={negocio.plan} nombreNegocio={negocio.nombre} isDesktop={isDesktop} />
  if (seccion === 'campanas') return <CampanasSection negocio={negocio} isDesktop={isDesktop} />
  if (seccion === 'recompensas') return <RecompensasSection negocioId={negocio.id} isDesktop={isDesktop} />
  if (seccion === 'sucursales') return <SucursalesSection negocio={negocio} />
  if (seccion === 'config') return <ConfigSection negocio={negocio} setNegocio={setNegocio} />
  return null
}

// ===== TUTORIAL =====
function TutorialChecklist({ negocio, metricas }) {
  const [visible, setVisible] = useState(false)
  const [recompensasOk, setRecompensasOk] = useState(false)
  const [tieneSuma, setTieneSuma] = useState(false)
  const [confirmarCierre, setConfirmarCierre] = useState(false)

  useEffect(() => {
    if (storage.get('fielty_tutorial_cerrado')) return
    setVisible(true)
    supabase.from('recompensas').select('id', { count: 'exact', head: true })
      .eq('negocio_id', negocio.id)
      .then(({ count }) => setRecompensasOk((count || 0) > 0))
    supabase.from('transacciones').select('id').eq('negocio_id', negocio.id).eq('tipo', 'suma').limit(1)
      .then(({ data }) => setTieneSuma(data && data.length > 0))
  }, [negocio.id])

  const cerrar = () => {
    storage.set('fielty_tutorial_cerrado', '1')
    setVisible(false)
  }

  if (!visible) return null

  const pasos = [
    { label: 'Creaste tu programa de fidelización', done: true },
    { label: 'Copiaste el link de registro para tus clientes', done: metricas.totalClientes > 0 || !!storage.get('fielty_tutorial_link_copiado') },
    { label: 'Tu primer cliente se registró', done: metricas.totalClientes > 0 },
    { label: 'Acreditaste puntos desde la caja', done: tieneSuma },
    { label: 'Configuraste una recompensa para tus clientes', done: recompensasOk },
  ]
  const completados = pasos.filter(p => p.done).length

  if (completados === pasos.length) {
    storage.set('fielty_tutorial_cerrado', '1')
    return null
  }

  const progreso = Math.round((completados / pasos.length) * 100)

  return (
    <div style={{background:'white', borderRadius:20, padding:'24px 24px 20px', marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
      {confirmarCierre && (
        <div style={{background:'#fff8e6', border:'1px solid #f0a500', borderRadius:14, padding:'16px 18px', marginBottom:16}}>
          <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e', marginBottom:4}}>¿Cerrar la guía de primeros pasos?</div>
          <div style={{fontSize:13, color:'#666', marginBottom:14}}>Todavía no completaste todos los pasos. Podés volver a abrirla desde Configuración si querés.</div>
          <div style={{display:'flex', gap:10}}>
            <button onClick={cerrar} style={{padding:'8px 18px', background:'#0e0e0e', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Sí, cerrar</button>
            <button onClick={() => setConfirmarCierre(false)} style={{padding:'8px 18px', background:'#f0f2f7', border:'none', borderRadius:10, color:'#555', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14}}>
        <div>
          <div style={{fontSize:16, fontWeight:800, color:'#0e0e0e'}}>🚀 Primeros pasos</div>
          <div style={{fontSize:13, color:'#666', marginTop:3}}>{completados} de {pasos.length} completados</div>
        </div>
        <button onClick={() => setConfirmarCierre(true)} style={{background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#ccc', width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>×</button>
      </div>
      <div style={{background:'#f0f2f7', borderRadius:99, height:6, marginBottom:20}}>
        <div style={{background:'#e0001b', borderRadius:99, height:6, width:`${progreso}%`, transition:'width 0.5s'}} />
      </div>
      {pasos.map((paso, i) => (
        <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < pasos.length - 1 ? '1px solid #f0f2f7' : 'none'}}>
          <div style={{width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800,
            background: paso.done ? '#00b96b' : '#f0f2f7', color: paso.done ? 'white' : '#aaa'}}>
            {paso.done ? '✓' : i + 1}
          </div>
          <span style={{fontSize:14, fontWeight: paso.done ? 400 : 600, color: paso.done ? '#aaa' : '#0e0e0e', textDecoration: paso.done ? 'line-through' : 'none'}}>
            {paso.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ===== INICIO =====
function InicioSection({ negocio, metricas, isDesktop }) {
  const gridCols = isDesktop ? 'repeat(3,1fr)' : 'repeat(3,1fr)'
  return (
    <>
      <TutorialChecklist negocio={negocio} metricas={metricas} />
      <div style={{display:'grid', gridTemplateColumns: isDesktop ? 'repeat(6,1fr)' : 'repeat(3,1fr)', gap:12, marginBottom:24}}>
        {[
          { icon:'👥', value: metricas.totalClientes, label:'Clientes totales' },
          { icon:'🆕', value: metricas.nuevosEsteMes, label:'Nuevos este mes' },
          { icon:'🔥', value: metricas.clientesActivos, label:'Activos (30 días)' },
          { icon:'⭐', value: metricas.totalPuntos.toLocaleString('es-AR'), label:'Puntos circulación' },
          { icon:'🎁', value: metricas.totalCanjes, label:'Canjes realizados' },
          { icon:'📈', value: metricas.totalClientes > 0 ? Math.round((metricas.clientesActivos / metricas.totalClientes) * 100) + '%' : '0%', label:'Tasa de retorno' },
        ].map((m, i) => (
          <div key={i} style={{background:'white', borderRadius:16, padding:'20px 16px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize:24, marginBottom:8}}>{m.icon}</div>
            <div style={{fontSize: isDesktop ? 28 : 22, fontWeight:800, color:'#0e0e0e', fontFamily:'monospace'}}>{m.value}</div>
            <div style={{fontSize:11, color:'#666', marginTop:4, lineHeight:1.3}}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{display: isDesktop ? 'grid' : 'block', gridTemplateColumns:'1fr 1fr', gap:20}}>
        <div>
          <div style={s.sectionTitle}>Links del negocio</div>
          <div style={s.card}>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:6}}>Registro de clientes</div>
              <div style={{background:'#f0f2f7', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'monospace', color:'#0e0e0e', wordBreak:'break-all', marginBottom:8}}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/registro/{negocio.slug}
              </div>
              <div style={{display:'flex', gap:8}}>
                <button style={{...s.btnRed, padding:10, fontSize:13, flex:1}} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/registro/${negocio.slug}`); storage.set('fielty_tutorial_link_copiado', '1') }}>📋 Copiar link</button>
                <button style={{...s.btnRed, padding:10, fontSize:13, flex:1, background:'#0e0e0e'}} onClick={() => window.open(`/qr/${negocio.slug}`, '_blank')}>🖨️ Ver QR</button>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:6}}>Ver tarjeta (clientes registrados)</div>
              <div style={{background:'#f0f2f7', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'monospace', color:'#0e0e0e', wordBreak:'break-all', marginBottom:8}}>
                {typeof window !== 'undefined' ? window.location.origin : ''}/mi-tarjeta
              </div>
              <div style={{display:'flex', gap:8}}>
                <button style={{...s.btnRed, padding:10, fontSize:13, flex:1}} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/mi-tarjeta`)}>📋 Copiar link</button>
                <button style={{...s.btnRed, padding:10, fontSize:13, flex:1, background:'#0e0e0e'}} onClick={() => window.open('/qr/mi-tarjeta', '_blank')}>🖨️ Imprimir cartel</button>
              </div>
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:6}}>Caja (sin sucursal)</div>
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
            {metricas.transacciones.length === 0 && <div style={{textAlign:'center', padding:24, color:'#666', fontSize:14}}>Todavía no hay transacciones</div>}
            {metricas.transacciones.map((t, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f0f2f7'}}>
                <div style={{width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, background: t.tipo === 'suma' ? '#e8faf2' : t.tipo === 'cumpleanos' ? '#fff8e0' : '#f0f0ff'}}>
                  {t.tipo === 'suma' ? '⭐' : t.tipo === 'cumpleanos' ? '🎂' : t.tipo === 'referido' ? '🤝' : '🎁'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:600, color:'#0e0e0e'}}>{t.descripcion}</div>
                  <div style={{fontSize:11, color:'#666', marginTop:2}}>{new Date(t.created_at).toLocaleDateString('es-AR')}</div>
                </div>
                <div style={{fontSize:14, fontWeight:800, fontFamily:'monospace', color: t.tipo === 'suma' || t.tipo === 'cumpleanos' || t.tipo === 'referido' ? '#00b96b' : '#e0001b'}}>
                  {t.tipo === 'suma' || t.tipo === 'cumpleanos' || t.tipo === 'referido' ? '+' : '-'}{t.puntos} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{display: isDesktop ? 'grid' : 'block', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:8}}>
        {/* CANJES */}
        <div>
          <div style={s.sectionTitle}>Resumen de canjes</div>
          <div style={s.card}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom: metricas.recompensaMasCanjeada ? 16 : 0}}>
              {[
                { label:'Este mes', value: metricas.canjesEsteMes, color:'#00b96b' },
                { label:'Total', value: metricas.totalCanjes, color:'#0e0e0e' },
                { label:'Pendientes', value: metricas.canjesPendientes, color:'#f0a500' },
              ].map((item, i) => (
                <div key={i} style={{textAlign:'center', background:'#f8f9fc', borderRadius:14, padding:'14px 8px'}}>
                  <div style={{fontSize:24, fontWeight:800, color:item.color, fontFamily:'monospace'}}>{item.value}</div>
                  <div style={{fontSize:11, color:'#666', marginTop:4}}>{item.label}</div>
                </div>
              ))}
            </div>
            {metricas.recompensaMasCanjeada && (
              <div style={{background:'#f0f2f7', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:2}}>Más popular</div>
                  <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e'}}>{metricas.recompensaMasCanjeada[0]}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:22, fontWeight:800, color:'#e0001b', fontFamily:'monospace'}}>{metricas.recompensaMasCanjeada[1]}</div>
                  <div style={{fontSize:10, color:'#666'}}>canjes</div>
                </div>
              </div>
            )}
            {metricas.totalCanjes === 0 && (
              <div style={{textAlign:'center', color:'#bbb', fontSize:13, padding:'8px 0'}}>Todavía no hay canjes realizados</div>
            )}
          </div>
        </div>

        {/* TOP CLIENTES */}
        <div>
          <div style={s.sectionTitle}>Top clientes</div>
          <div style={s.card}>
            {metricas.topClientes.length === 0 && (
              <div style={{textAlign:'center', color:'#bbb', fontSize:13, padding:'8px 0'}}>Todavía no hay clientes</div>
            )}
            {metricas.topClientes.map((c, i) => {
              const nivel = (c.puntos_historicos || 0) >= 5000 ? '🥇' : (c.puntos_historicos || 0) >= 1000 ? '🥈' : '🥉'
              return (
                <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < metricas.topClientes.length - 1 ? '1px solid #f0f2f7' : 'none'}}>
                  <div style={{fontSize:13, fontWeight:800, color:'#bbb', width:18, textAlign:'center', flexShrink:0}}>#{i+1}</div>
                  <div style={{width:36, height:36, borderRadius:10, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'white', flexShrink:0}}>
                    {c.nombre.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.nombre}</div>
                    <div style={{fontSize:11, color:'#666', marginTop:1}}>{nivel} {(c.puntos_historicos || 0).toLocaleString('es-AR')} pts históricos</div>
                  </div>
                  <div style={{fontSize:16, fontWeight:800, color:'#f0a500', fontFamily:'monospace', flexShrink:0}}>{(c.puntos || 0).toLocaleString('es-AR')}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <MetricasSucursales negocioId={negocio.id} isDesktop={isDesktop} />
    </>
  )
}

// ===== CLIENTES =====
function ClientesSection({ negocioId, color, plan, nombreNegocio, isDesktop }) {
  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  function waCliente(c, esInactivo) {
    // Sin emojis: WhatsApp Desktop los rompe cuando van por link wa.me y
    // llegan como "?". Pasa incluso con los del plano básico como ✨, no
    // solo con los de 4 bytes. Los acentos sí viajan bien.
    const texto = esInactivo
      ? `¡Hola ${c.nombre.split(' ')[0]}! Hace tiempo no te vemos por ${nombreNegocio}. Tenés ${c.puntos} puntos esperándote. Mirá tu tarjeta: https://www.fielty.app/tarjeta/${c.id}`
      : `¡Hola ${c.nombre.split(' ')[0]}! Tenés ${c.puntos} puntos en ${nombreNegocio}. Mirá tu tarjeta: https://www.fielty.app/tarjeta/${c.id}`
    return linkWhatsApp(c.telefono, texto)
  }

  useEffect(() => {
    supabase.from('clientes').select('*').eq('negocio_id', negocioId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setClientes(data || []))
  }, [negocioId])

  function exportarCSV() {
    const headers = ['Nombre', 'DNI', 'Teléfono', 'Email', 'Puntos', 'Puntos históricos', 'Visitas', 'Última visita', 'Registrado']
    const rows = filtrados.map(c => [
      c.nombre, c.dni, c.telefono || '', c.email || '',
      c.puntos, c.puntos_historicos, c.visitas,
      c.ultima_visita ? new Date(c.ultima_visita).toLocaleDateString('es-AR') : '',
      new Date(c.created_at).toLocaleDateString('es-AR'),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'clientes.csv'; a.click()
    URL.revokeObjectURL(url)
  }

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
            <button key={f} style={{...s.filtroBtn, background: filtro === f ? '#0e0e0e' : '#f0f2f7', color: filtro === f ? 'white' : '#666'}} onClick={() => setFiltro(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {isDesktop && (
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input data-clarity-mask="True" placeholder="🔍 Buscar por nombre o DNI..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{padding:'10px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:14, fontFamily:'inherit', outline:'none', width:280}} />
            {esPago(plan) ? (
              <button onClick={exportarCSV} style={{padding:'10px 16px', background:'#0e0e0e', border:'none', borderRadius:12, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap'}}>
                ↓ Exportar CSV
              </button>
            ) : (
              <button onClick={() => window.location.href = '/dashboard/upgrade'} title="Disponible en los planes Pro y Business" style={{padding:'10px 16px', background:'#f5f6fa', border:'1px dashed #ccc', borderRadius:12, color:'#aaa', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap'}}>
                🔒 Exportar CSV
              </button>
            )}
          </div>
        )}
      </div>
      <div style={s.card}>
        <div style={{fontSize:11, color:'#666', marginBottom:12}}>{filtrados.length} clientes</div>
        {isDesktop ? (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #f0f2f7'}}>
                {['Cliente', 'DNI', 'Nivel', 'Puntos', 'Visitas', 'Última visita', ''].map((h, i) => (
                  <th key={i} style={{textAlign:'left', padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody data-clarity-mask="True">
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
                  <td style={{padding:'14px 12px', fontSize:13, color:'#666'}}>{c.dni}</td>
                  <td style={{padding:'14px 12px', fontSize:13}}>{getNivel(c.puntos_historicos || 0)}</td>
                  <td style={{padding:'14px 12px', fontSize:16, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{c.puntos}</td>
                  <td style={{padding:'14px 12px', fontSize:13, color:'#666'}}>{c.visitas || 0}</td>
                  <td style={{padding:'14px 12px', fontSize:13, color:'#666'}}>{c.ultima_visita ? new Date(c.ultima_visita).toLocaleDateString('es-AR') : '—'}</td>
                  <td style={{padding:'14px 12px'}}>
                    {c.telefono && (
                      <a href={waCliente(c, !c.ultima_visita || new Date(c.ultima_visita) <= hace30dias)} target="_blank" rel="noreferrer" title="Enviar WhatsApp"
                        style={{display:'inline-flex', alignItems:'center', gap:6, padding:'7px 12px', background:'#e7f9ef', borderRadius:10, color:'#00a884', fontSize:12, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap'}}>
                        📲 WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div data-clarity-mask="True">
            {filtrados.map((c, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f0f2f7'}}>
                <div style={{width:40, height:40, borderRadius:12, background: color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'white', flexShrink:0}}>
                  {c.nombre.slice(0,2).toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e'}}>{c.nombre}</div>
                  <div style={{fontSize:11, color:'#666', marginTop:2}}>DNI {c.dni} · {getNivel(c.puntos_historicos || 0)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{c.puntos}</div>
                  <div style={{fontSize:10, color:'#666'}}>pts</div>
                </div>
                {c.telefono && (
                  <a href={waCliente(c, !c.ultima_visita || new Date(c.ultima_visita) <= hace30dias)} target="_blank" rel="noreferrer" title="Enviar WhatsApp"
                    style={{display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, background:'#e7f9ef', borderRadius:10, textDecoration:'none', fontSize:16, flexShrink:0}}>
                    📲
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {filtrados.length === 0 && <div style={{textAlign:'center', padding:24, color:'#666', fontSize:14}}>No hay clientes en este filtro</div>}
      </div>
    </>
  )
}

// ===== CAMPAÑAS =====
const PLANTILLA_REACTIVACION = {
  asunto: '¡Te extrañamos en {negocio}! 🎁',
  mensaje: '¡Hola {nombre}!\nHace tiempo que no te vemos por {negocio} y tenés {puntos} puntos esperándote.\nVení a visitarnos y seguí sumando para canjear tus premios.',
}

function CampanasSection({ negocio, isDesktop }) {
  const [segmento, setSegmento] = useState('inactivos30')
  const [asunto, setAsunto] = useState(PLANTILLA_REACTIVACION.asunto)
  const [mensaje, setMensaje] = useState(PLANTILLA_REACTIVACION.mensaje)
  const [enviando, setEnviando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [clientes, setClientes] = useState([])
  const [campanas, setCampanas] = useState([])

  useEffect(() => { cargar() }, [negocio.id])

  async function cargar() {
    const [{ data: cls }, { data: cams }, { data: envios }] = await Promise.all([
      supabase.from('clientes').select('id, email, acepta_marketing, ultima_visita, ultima_campana_at').eq('negocio_id', negocio.id),
      supabase.from('campanas').select('*').eq('negocio_id', negocio.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('campana_envios').select('campana_id, cliente_id').eq('negocio_id', negocio.id),
    ])
    setClientes(cls || [])
    const visitaPorCliente = {}
    ;(cls || []).forEach(c => { visitaPorCliente[c.id] = c.ultima_visita })
    setCampanas((cams || []).map(cam => ({
      ...cam,
      volvieron: (envios || []).filter(e =>
        e.campana_id === cam.id &&
        visitaPorCliente[e.cliente_id] &&
        new Date(visitaPorCliente[e.cliente_id]) > new Date(cam.created_at)
      ).length,
    })))
  }

  const hace30 = Date.now() - 30 * 86400000
  const hace60 = Date.now() - 60 * 86400000
  const destinatarios = clientes.filter(c => {
    if (!c.email || c.acepta_marketing === false) return false
    if (c.ultima_campana_at && new Date(c.ultima_campana_at).getTime() > hace30) return false
    if (segmento === 'todos') return true
    const limite = segmento === 'inactivos60' ? hace60 : hace30
    return !c.ultima_visita || new Date(c.ultima_visita).getTime() <= limite
  }).length

  async function enviar() {
    setEnviando(true)
    setResultado(null)
    setConfirmar(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/campanas/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ negocioId: negocio.id, segmento, asunto, mensaje }),
      })
      const data = await res.json()
      setResultado(res.ok ? { ok: true, enviados: data.enviados } : { error: data.error || 'Error al enviar' })
      if (res.ok) cargar()
    } catch {
      setResultado({ error: 'Error de conexión' })
    }
    setEnviando(false)
  }

  const SEGMENTOS = [
    { id: 'inactivos30', label: 'Inactivos +30 días' },
    { id: 'inactivos60', label: 'Inactivos +60 días' },
    { id: 'todos', label: 'Todos' },
  ]

  if (!esPago(negocio.plan)) {
    const inactivos = clientes.filter(c => !c.ultima_visita || new Date(c.ultima_visita).getTime() <= hace30).length
    return (
      <div style={{...s.card, textAlign:'center', padding:'48px 32px', maxWidth:520}}>
        <div style={{fontSize:44, marginBottom:16}}>📣</div>
        <div style={{fontSize:19, fontWeight:800, color:'#0e0e0e', marginBottom:8}}>Traé de vuelta a tus clientes inactivos</div>
        <div style={{fontSize:14, color:'#666', lineHeight:1.6, marginBottom:8}}>
          Mandá campañas de email a los clientes que dejaron de venir y mirá cuántos vuelven a comprar.
        </div>
        {inactivos > 0 && (
          <div style={{fontSize:14, color:'#0e0e0e', fontWeight:700, marginBottom:20}}>
            Tenés {inactivos} cliente{inactivos === 1 ? '' : 's'} inactivo{inactivos === 1 ? '' : 's'} esperando volver.
          </div>
        )}
        <button onClick={() => window.location.href = '/dashboard/upgrade'}
          style={{padding:'14px 28px', background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
          Desbloquear con el plan Pro →
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={s.card}>
        <div style={{fontSize:15, fontWeight:800, color:'#0e0e0e', marginBottom:4}}>📣 Nueva campaña</div>
        <div style={{fontSize:13, color:'#666', marginBottom:20}}>
          Enviá un email a un grupo de clientes. Cada cliente se contacta como máximo una vez cada 30 días.
        </div>

        <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:8}}>¿A quiénes?</div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:16}}>
          {SEGMENTOS.map(seg => (
            <button key={seg.id} onClick={() => setSegmento(seg.id)}
              style={{...s.filtroBtn, background: segmento === seg.id ? '#0e0e0e' : '#f0f2f7', color: segmento === seg.id ? 'white' : '#666'}}>
              {seg.label}
            </button>
          ))}
        </div>

        <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:8}}>Asunto</div>
        <input value={asunto} onChange={e => setAsunto(e.target.value)}
          style={{width:'100%', padding:'12px 14px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:16}} />

        <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:8}}>Mensaje</div>
        <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={5}
          style={{width:'100%', padding:'12px 14px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:1.5}} />
        <div style={{fontSize:12, color:'#aaa', marginTop:6, marginBottom:20}}>
          Variables: <code style={{background:'#f0f2f7', padding:'2px 6px', borderRadius:6}}>{'{nombre}'}</code>{' '}
          <code style={{background:'#f0f2f7', padding:'2px 6px', borderRadius:6}}>{'{puntos}'}</code>{' '}
          <code style={{background:'#f0f2f7', padding:'2px 6px', borderRadius:6}}>{'{negocio}'}</code>
          {' '}· El email incluye el botón "Ver mi tarjeta" y el link de baja automáticamente.
        </div>

        {resultado?.ok && (
          <div style={{background:'#e7f9ef', color:'#00a884', padding:'12px 16px', borderRadius:12, fontSize:14, fontWeight:700, marginBottom:12}}>
            ✅ Campaña enviada a {resultado.enviados} cliente{resultado.enviados === 1 ? '' : 's'}
          </div>
        )}
        {resultado?.error && (
          <div style={{background:'#fff0f0', color:'#e0001b', padding:'12px 16px', borderRadius:12, fontSize:13, marginBottom:12}}>
            {resultado.error}
          </div>
        )}

        {!confirmar ? (
          <button onClick={() => destinatarios > 0 && setConfirmar(true)} disabled={enviando || destinatarios === 0}
            style={{padding:'14px 24px', background: destinatarios > 0 ? '#0e0e0e' : '#f0f2f7', border:'none', borderRadius:12, color: destinatarios > 0 ? 'white' : '#aaa', fontSize:14, fontWeight:800, cursor: destinatarios > 0 ? 'pointer' : 'default', fontFamily:'inherit'}}>
            {destinatarios === 0 ? 'No hay clientes para contactar en este segmento' : `Enviar a ${destinatarios} cliente${destinatarios === 1 ? '' : 's'} →`}
          </button>
        ) : (
          <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
            <button onClick={enviar} disabled={enviando}
              style={{padding:'14px 24px', background:'#00a884', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
              {enviando ? 'Enviando...' : `✓ Confirmar envío a ${destinatarios}`}
            </button>
            <button onClick={() => setConfirmar(false)} disabled={enviando}
              style={{padding:'14px 20px', background:'#f0f2f7', border:'none', borderRadius:12, color:'#666', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div style={s.card}>
        <div style={{fontSize:15, fontWeight:800, color:'#0e0e0e', marginBottom:16}}>Historial</div>
        {campanas.length === 0 && (
          <div style={{textAlign:'center', padding:24, color:'#666', fontSize:14}}>Todavía no enviaste ninguna campaña</div>
        )}
        {campanas.map(cam => (
          <div key={cam.id} style={{display:'flex', alignItems:'center', gap:12, padding:'14px 0', borderBottom:'1px solid #f0f2f7', flexWrap:'wrap'}}>
            <div style={{flex:1, minWidth:180}}>
              <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e'}}>{cam.asunto}</div>
              <div style={{fontSize:12, color:'#666', marginTop:2}}>
                {new Date(cam.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short' })}
                {' · '}{SEGMENTOS.find(x => x.id === cam.segmento)?.label || cam.segmento}
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:16, fontWeight:800, color:'#0e0e0e', fontFamily:'monospace'}}>{cam.enviados}</div>
              <div style={{fontSize:10, color:'#666'}}>enviados</div>
            </div>
            <div style={{textAlign:'center', background: cam.volvieron > 0 ? '#e7f9ef' : '#f8f9fc', borderRadius:10, padding:'6px 14px'}}>
              <div style={{fontSize:16, fontWeight:800, color: cam.volvieron > 0 ? '#00a884' : '#aaa', fontFamily:'monospace'}}>{cam.volvieron}</div>
              <div style={{fontSize:10, color: cam.volvieron > 0 ? '#00a884' : '#aaa'}}>volvieron</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ===== RECOMPENSAS =====
function RecompensasSection({ negocioId, isDesktop }) {
  const [recompensas, setRecompensas] = useState([])
  const [nueva, setNueva] = useState({ nombre: '', puntos_necesarios: '' })
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(null) // { id, nombre, puntos_necesarios }

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

  async function guardarEdicion() {
    if (!editando.nombre || !editando.puntos_necesarios) return
    await supabase.from('recompensas').update({ nombre: editando.nombre, puntos_necesarios: parseInt(editando.puntos_necesarios) }).eq('id', editando.id)
    setEditando(null)
    await cargar()
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
            <div key={i} style={{padding:'14px 0', borderBottom:'1px solid #f0f2f7'}}>
              {editando?.id === r.id ? (
                <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                  <input style={{...s.inputField, flex:2, minWidth:120}} value={editando.nombre} onChange={e => setEditando({...editando, nombre: e.target.value})} autoFocus />
                  <input style={{...s.inputField, width:80}} type="number" value={editando.puntos_necesarios} onChange={e => setEditando({...editando, puntos_necesarios: e.target.value})} />
                  <span style={{fontSize:12, color:'#666'}}>pts</span>
                  <button style={{...s.btnRed, padding:'8px 14px', fontSize:13}} onClick={guardarEdicion}>Guardar</button>
                  <button style={{padding:'8px 14px', background:'#f0f2f7', border:'none', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'inherit', color:'#666'}} onClick={() => setEditando(null)}>Cancelar</button>
                </div>
              ) : (
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15, fontWeight:700, color: r.activa ? '#0e0e0e' : '#bbb'}}>{r.nombre}</div>
                    <div style={{fontSize:12, color:'#666'}}>{r.puntos_necesarios} pts</div>
                  </div>
                  <button style={{padding:'6px 12px', background:'#f0f2f7', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', color:'#555', fontFamily:'inherit'}} onClick={() => setEditando({ id: r.id, nombre: r.nombre, puntos_necesarios: r.puntos_necesarios })}>✏️ Editar</button>
                  <button style={{...s.toggleBtn, background: r.activa ? '#e8faf2' : '#f0f2f7', color: r.activa ? '#00b96b' : '#bbb'}} onClick={() => toggleActiva(r)}>
                    {r.activa ? 'Activa' : 'Inactiva'}
                  </button>
                  <button style={s.deleteBtn} onClick={() => eliminar(r.id)}>✕</button>
                </div>
              )}
            </div>
          ))}
          {recompensas.length === 0 && <div style={{textAlign:'center', padding:24, color:'#666', fontSize:14}}>No hay recompensas todavía</div>}
        </div>
      </div>
      <div>
        <div style={s.sectionTitle}>Agregar recompensa</div>
        <div style={s.card}>
          <div style={s.configField}>
            <label style={s.configLabel} htmlFor="recompensa-nueva-nombre">Nombre</label>
            <input id="recompensa-nueva-nombre" style={s.inputField} placeholder="Ej: Café gratis" value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} />
          </div>
          <div style={s.configField}>
            <label style={s.configLabel} htmlFor="recompensa-nueva-puntos">Puntos necesarios</label>
            <input id="recompensa-nueva-puntos" style={s.inputField} type="number" placeholder="Ej: 100" value={nueva.puntos_necesarios} onChange={e => setNueva({...nueva, puntos_necesarios: e.target.value})} />
          </div>
          <button style={s.btnRed} onClick={agregar} disabled={guardando}>{guardando ? 'Guardando...' : '+ Agregar'}</button>
        </div>
      </div>
    </div>
  )
}

// ===== PIN DISPLAY =====
function PinActualDisplay({ pinActual, esDebil }) {
  const [visible, setVisible] = useState(false)
  const pin = pinActual || '1234'
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, background: esDebil ? '#fff8e6' : '#f5f6fa', border: esDebil ? '1px solid #f0a500' : '1px solid #e8eaf0', borderRadius:10, padding:'10px 14px', maxWidth:260}}>
      <span style={{fontSize:12, color:'#666', flexShrink:0}}>PIN actual:</span>
      <span style={{fontFamily:'monospace', fontSize:18, fontWeight:800, letterSpacing:6, color: esDebil ? '#b37a00' : '#0e0e0e', flex:1, minWidth:60}}>
        {visible ? pin : pin.split('').map(() => '●').join('')}
      </span>
      <button onClick={() => setVisible(v => !v)}
        style={{background:'#e8eaf0', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, color:'#555', padding:'4px 8px', flexShrink:0, fontFamily:'inherit', fontWeight:600}}>
        {visible ? 'Ocultar' : 'Ver'}
      </button>
      {esDebil && <span style={{fontSize:10, color:'#b37a00', fontWeight:700, flexShrink:0}}>⚠️ Débil</span>}
    </div>
  )
}

// ===== CONFIG =====
function ConfigSection({ negocio, setNegocio }) {
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [errorLogo, setErrorLogo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [avisoPago, setAvisoPago] = useState('')

  // Para el dueño que pagó y no vio el plano activarse: consulta
  // Mercado Pago en el momento y activa el plan si el pago existe.
  async function verificarPago() {
    setVerificando(true)
    setAvisoPago('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/suscripcion/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ negocioId: negocio.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAvisoPago('No se pudo verificar. Intentá de nuevo en un rato.')
      } else if (data.cambio) {
        setNegocio({ ...negocio, plan: data.plan })
        setAvisoPago('¡Listo! Tu plan quedó activo.')
      } else if (data.encontradas === 0) {
        setAvisoPago('Todavía no encontramos un pago para este negocio. Si acabás de pagar, esperá unos minutos.')
      } else {
        setAvisoPago('Tu plan ya está al día.')
      }
    } catch {
      setAvisoPago('Error de conexión. Intentá de nuevo.')
    }
    setVerificando(false)
  }

  async function subirLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
    if (!FORMATOS.includes(file.type)) {
      setErrorLogo('Formato no soportado. Usá JPG, PNG, WEBP o SVG.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorLogo('La imagen no puede superar 2MB.')
      return
    }
    setErrorLogo('')
    setSubiendoLogo(true)
    const ext = file.name.split('.').pop()
    const path = `${negocio.id}/logo.${ext}`
    const { error: uploadError } = await supabase.storage.from('negocios-media').upload(path, file, { upsert: true })
    if (uploadError) {
      setErrorLogo('Error al subir la imagen. Verificá que el bucket "negocios-media" exista y sea público en Supabase.')
      setSubiendoLogo(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('negocios-media').getPublicUrl(path)
    await supabase.from('negocios').update({ logo_url: publicUrl }).eq('id', negocio.id)
    setNegocio(n => ({ ...n, logo_url: publicUrl }))
    setSubiendoLogo(false)
  }

  const [form, setForm] = useState({
    nombre: negocio.nombre, color: negocio.color,
    telefono: negocio.telefono || '',
    pesos_por_punto: negocio.pesos_por_punto || 100,
    puntos_por_tramo: negocio.puntos_por_tramo || 1,
    puntos_bienvenida: negocio.puntos_bienvenida || 10,
    puntos_cumpleanos: negocio.puntos_cumpleanos || 50,
    puntos_referido_emisor: negocio.puntos_referido_emisor || 100,
    puntos_referido_receptor: negocio.puntos_referido_receptor || 50,
    pin_caja: '',
    pin_confirmar: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)
  const [errorPin, setErrorPin] = useState('')

  const pinActualEsDebil = PINES_COMUNES.includes(negocio.pin_caja || '1234')

  async function guardar() {
    // Si el usuario completó alguno de los campos de PIN, validar ambos
    if (form.pin_caja || form.pin_confirmar) {
      const errorValidacion = validarPin(form.pin_caja, form.pin_confirmar)
      if (errorValidacion) { setErrorPin(errorValidacion); return }
    }
    setErrorPin('')
    setGuardando(true)
    const payload = { ...form }
    // Sin trim, un espacio al final se cuela en los emails y en la tarjeta
    // del cliente (queda "Pizza city  — tu tarjeta...", con doble espacio).
    payload.nombre = payload.nombre.trim()
    delete payload.pin_confirmar
    if (!payload.pin_caja) delete payload.pin_caja // No sobreescribir si no cambió
    const { data } = await supabase.from('negocios').update(payload).eq('id', negocio.id).select().single()
    setNegocio(data)
    setForm(f => ({ ...f, pin_caja: '', pin_confirmar: '' }))
    setGuardando(false)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }

  const planInfo = {
    gratis:    { label: 'Gratis', color: '#666',    desc: 'Hasta 50 clientes' },
    pro_early: { label: 'Pro',    color: '#e0001b', desc: 'Early Adopter · $10.000/mes' },
    pro:       { label: 'Pro',    color: '#e0001b', desc: '$20.000/mes' },
    business:  { label: 'Business', color: '#f0a500', desc: '$35.000/mes' },
  }
  const pi = planInfo[negocio.plan] || planInfo.gratis

  return (
    <div style={{maxWidth:600}}>
      {/* Plan actual */}
      <div style={{...s.card, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:10, height:10, borderRadius:'50%', background:pi.color}} />
          <div>
            <div style={{fontSize:15, fontWeight:800, color:'#0e0e0e'}}>Plan {pi.label}</div>
            <div style={{fontSize:12, color:'#666', marginTop:2}}>{pi.desc}</div>
          </div>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          {negocio.mp_plan_id && (
            <button onClick={verificarPago} disabled={verificando}
              style={{padding:'10px 16px', background:'#f0f2f7', border:'none', borderRadius:12, color:'#555', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
              {verificando ? 'Verificando...' : '↻ Ya pagué, verificar'}
            </button>
          )}
          {(!negocio.plan || negocio.plan === 'gratis') && (
            <button onClick={() => window.location.href = '/dashboard/upgrade'} style={{padding:'10px 20px', background:'#e0001b', border:'none', borderRadius:12, color:'white', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
              Mejorar plan →
            </button>
          )}
        </div>
        {avisoPago && (
          <div style={{width:'100%', fontSize:13, color:'#555', background:'#f8f9fc', borderRadius:10, padding:'10px 14px'}}>{avisoPago}</div>
        )}
      </div>
      <div style={s.card}>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="dashboard-negocio-nombre">Nombre del negocio</label>
          <input id="dashboard-negocio-nombre" style={s.inputField} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="dashboard-negocio-telefono">Teléfono del negocio</label>
          <input id="dashboard-negocio-telefono" style={s.inputField} type="tel" placeholder="Ej: 1123456789" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value.replace(/[^0-9+\s()-]/g, '')})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel} id="dashboard-color-label">Color de marca</label>

          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:36, height:36, borderRadius:10, background:form.color, border:'1px solid #e8eaf0'}}/>
            <input type="color" aria-labelledby="dashboard-color-label" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{width:48, height:36, borderRadius:10, border:'1px solid #e8eaf0', cursor:'pointer', padding:2}} />
            <input style={{...s.inputField, flex:1, fontFamily:'monospace'}} aria-labelledby="dashboard-color-label" placeholder="e0001b" maxLength={7} value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
          </div>
        </div>
        {/* Logo */}
        <div style={s.configField}>
          <div style={s.configLabel}>Logo del negocio</div>
          {esPago(negocio.plan) ? (
            <div style={{display:'flex', alignItems:'center', gap:16}}>
              {negocio.logo_url
                ? <img src={negocio.logo_url} style={{width:56, height:56, borderRadius:12, objectFit:'cover', border:'2px solid #e8eaf0'}} />
                : <div style={{width:56, height:56, borderRadius:12, background:'#f0f2f7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#aaa'}}>Sin logo</div>
              }
              <div>
                <label style={{padding:'10px 18px', background:'#0e0e0e', borderRadius:12, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', display:'inline-block'}}>
                  {subiendoLogo ? 'Subiendo...' : negocio.logo_url ? 'Cambiar logo' : 'Subir logo'}
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.svg" style={{display:'none'}} onChange={subirLogo} disabled={subiendoLogo} />
                </label>
                <div style={{fontSize:11, color:'#aaa', marginTop:6}}>JPG, PNG, WEBP o SVG · Máx 2MB</div>
                {errorLogo && <div style={{fontSize:11, color:'#e0001b', marginTop:4}}>{errorLogo}</div>}
              </div>
            </div>
          ) : (
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:56, height:56, borderRadius:12, background:'#f0f2f7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18}}>🔒</div>
              <div>
                <div style={{fontSize:13, color:'#aaa'}}>Disponible en los planes Pro y Business</div>
                <button onClick={() => window.location.href = '/dashboard/upgrade'} style={{marginTop:4, padding:'5px 12px', background:'#e0001b', border:'none', borderRadius:8, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Mejorar →</button>
              </div>
            </div>
          )}
        </div>
        <div style={s.configField}>
          <div style={s.configLabel}>Regla de puntos</div>
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            <span style={{fontSize:13, color:'#666'}}>Cada $</span>
            <input style={{...s.inputField, width:'auto'}} type="text" inputMode="numeric" aria-label="Pesos gastados por tramo"
              value={form.pesos_por_punto ? Number(form.pesos_por_punto).toLocaleString('es-AR') : ''}
              size={Math.max(3, (form.pesos_por_punto ? Number(form.pesos_por_punto).toLocaleString('es-AR') : '').length + 1)}
              onChange={e => setForm({...form, pesos_por_punto: parseInt(e.target.value.replace(/\D/g, '')) || 0})} />
            <span style={{fontSize:13, color:'#666'}}>→</span>
            <input style={{...s.inputField, width:'auto'}} type="text" inputMode="numeric" aria-label="Puntos otorgados por tramo"
              value={form.puntos_por_tramo || ''}
              size={Math.max(3, String(form.puntos_por_tramo || '').length + 1)}
              onChange={e => setForm({...form, puntos_por_tramo: parseInt(e.target.value.replace(/\D/g, '')) || 0})} />
            <span style={{fontSize:13, color:'#666'}}>pts</span>
          </div>
        </div>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="dashboard-puntos-bienvenida">Puntos de bienvenida 🎁</label>
          <input id="dashboard-puntos-bienvenida" style={{...s.inputField, width:100}} type="number" value={form.puntos_bienvenida} onChange={e => setForm({...form, puntos_bienvenida: parseInt(e.target.value)})} />
          <div style={{fontSize:11, color:'#aaa', marginTop:6}}>Los que recibe cada cliente al registrarse por primera vez</div>
        </div>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="dashboard-puntos-cumple">Puntos por cumpleaños 🎂</label>
          <input id="dashboard-puntos-cumple" style={{...s.inputField, width:100}} type="number" value={form.puntos_cumpleanos} onChange={e => setForm({...form, puntos_cumpleanos: parseInt(e.target.value)})} />
        </div>
        <div style={s.configField}>
          <div style={s.configLabel}>PIN de caja 🔐</div>
          <PinActualDisplay pinActual={negocio.pin_caja} esDebil={pinActualEsDebil} />
          <div style={{display:'flex', flexDirection:'column', gap:8, maxWidth:220, marginTop:10}}>
            <input style={{...s.inputField, fontFamily:'monospace', letterSpacing:2}} type="password" aria-label="Nuevo PIN de caja" placeholder="Nuevo PIN" value={form.pin_caja} onChange={e => { setForm({...form, pin_caja: e.target.value}); setErrorPin('') }} />
            <input style={{...s.inputField, fontFamily:'monospace', letterSpacing:2}} type="password" aria-label="Confirmar nuevo PIN de caja" placeholder="Confirmar PIN" value={form.pin_confirmar} onChange={e => { setForm({...form, pin_confirmar: e.target.value}); setErrorPin('') }} />
          </div>
          {errorPin && <div style={{fontSize:12, color:'#e0001b', marginTop:6}}>⚠️ {errorPin}</div>}
          <div style={{fontSize:11, color:'#aaa', marginTop:6}}>Letras, números o mezcla. Mínimo 4 caracteres. Dejá vacío para no cambiar.</div>
        </div>
        <div style={s.configField}>
          <div style={s.configLabel}>Puntos por referido 🤝</div>
          <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
            <div>
              <label style={{fontSize:11, color:'#666', marginBottom:4, display:'block'}} htmlFor="dashboard-puntos-ref-emisor">Para el que invita</label>
              <input id="dashboard-puntos-ref-emisor" style={{...s.inputField, width:100}} type="number" value={form.puntos_referido_emisor} onChange={e => setForm({...form, puntos_referido_emisor: parseInt(e.target.value)})} />
            </div>
            <div>
              <label style={{fontSize:11, color:'#666', marginBottom:4, display:'block'}} htmlFor="dashboard-puntos-ref-receptor">Para el nuevo cliente</label>
              <input id="dashboard-puntos-ref-receptor" style={{...s.inputField, width:100}} type="number" value={form.puntos_referido_receptor} onChange={e => setForm({...form, puntos_referido_receptor: parseInt(e.target.value)})} />
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
const LIMITE_SUCURSALES = { gratis: 1, pro_early: 3, pro: 3, business: 999 }
function SucursalesSection({ negocio }) {
  const [sucursales, setSucursales] = useState([])
  const [nueva, setNueva] = useState({ nombre: '', direccion: '', pin_caja: '', pin_confirmar: '' })
  const [errorPin, setErrorPin] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [negocio.id])

  async function cargar() {
    const { data } = await supabase.from('sucursales').select('*').eq('negocio_id', negocio.id).order('created_at')
    setSucursales(data || [])
  }

  const limite = LIMITE_SUCURSALES[negocio.plan || 'gratis']
  const alcanzaLimite = sucursales.length >= limite

  async function agregar() {
    if (!nueva.nombre || alcanzaLimite) return
    const errorValidacion = validarPin(nueva.pin_caja, nueva.pin_confirmar)
    if (errorValidacion) { setErrorPin(errorValidacion); return }
    setErrorPin('')
    setGuardando(true)
    const slugSuc = nueva.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await supabase.from('sucursales').insert([{ negocio_id: negocio.id, nombre: nueva.nombre, slug: slugSuc, direccion: nueva.direccion, pin_caja: nueva.pin_caja }])
    setNueva({ nombre: '', direccion: '', pin_caja: '', pin_confirmar: '' })
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
        <div style={{...s.card, textAlign:'center', color:'#666', fontSize:14, padding:28}}>
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
              {suc.direccion && <div style={{fontSize:12, color:'#666', marginTop:2}}>{suc.direccion}</div>}
            </div>
            <button style={s.deleteBtn} onClick={() => eliminar(suc.id)}>✕</button>
          </div>
          <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:6}}>URL de caja</div>
          <div style={{background:'#f0f2f7', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'monospace', color:'#0e0e0e', wordBreak:'break-all', marginBottom:8}}>
            {urlBase}/c/{negocio.slug}/{suc.slug}
          </div>
          <button style={{...s.btnRed, padding:12, fontSize:13, marginBottom:12}} onClick={() => navigator.clipboard.writeText(`${urlBase}/c/${negocio.slug}/${suc.slug}`)}>📋 Copiar URL de caja</button>
          <PinSucursal suc={suc} recargar={cargar} />
        </div>
      ))}
      </div>
      <div style={s.sectionTitle}>Agregar sucursal</div>
      {alcanzaLimite && (
        <div style={{background:'#fff8e6', border:'1px solid #f0a500', borderRadius:14, padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div style={{fontSize:13, color:'#b37a00'}}>
            {negocio.plan === 'gratis'
              ? `El plan Gratis permite 1 sucursal. Mejorar a Pro para tener hasta 3.`
              : `El plan Pro permite hasta 3 sucursales. Mejorar a Business para sucursales ilimitadas.`}
          </div>
          <button onClick={() => window.location.href = '/dashboard/upgrade'} style={{padding:'8px 16px', background:'#f0a500', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap'}}>
            Mejorar plan →
          </button>
        </div>
      )}
      <div style={{...s.card, maxWidth:480, opacity: alcanzaLimite ? 0.4 : 1, pointerEvents: alcanzaLimite ? 'none' : 'auto'}}>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="sucursal-nombre">Nombre</label>
          <input id="sucursal-nombre" style={s.inputField} placeholder="Ej: Sucursal Centro" value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="sucursal-direccion">Dirección (opcional)</label>
          <input id="sucursal-direccion" style={s.inputField} placeholder="Ej: Av. Corrientes 1234" value={nueva.direccion} onChange={e => setNueva({...nueva, direccion: e.target.value})} />
        </div>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="sucursal-pin">PIN de caja 🔐</label>
          <input id="sucursal-pin" style={{...s.inputField, width:160, fontFamily:'monospace', letterSpacing:2}} type="password" placeholder="Mín. 4 caracteres" value={nueva.pin_caja} onChange={e => { setNueva({...nueva, pin_caja: e.target.value}); setErrorPin('') }} />
          <div style={{fontSize:11, color:'#aaa', marginTop:6}}>Letras, números o mezcla. Mínimo 4 caracteres.</div>
        </div>
        <div style={s.configField}>
          <label style={s.configLabel} htmlFor="sucursal-pin-confirmar">Confirmar PIN 🔐</label>
          <input id="sucursal-pin-confirmar" style={{...s.inputField, width:120, fontFamily:'monospace', letterSpacing:4}} type="password" maxLength={6} placeholder="Repetí el PIN" value={nueva.pin_confirmar} onChange={e => { setNueva({...nueva, pin_confirmar: e.target.value}); setErrorPin('') }} />
        </div>
        {errorPin && <div style={{background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12}}>⚠️ {errorPin}</div>}
        <button style={s.btnRed} onClick={agregar} disabled={guardando}>{guardando ? 'Guardando...' : '+ Agregar sucursal'}</button>
      </div>
    </>
  )
}

function PinSucursal({ suc, recargar }) {
  const [pin, setPin] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)
  const [errorPin, setErrorPin] = useState('')

  const pinActualEsDebil = PINES_COMUNES.includes(suc.pin_caja || '1234')

  async function guardar() {
    const errorValidacion = validarPin(pin, confirmar)
    if (errorValidacion) { setErrorPin(errorValidacion); return }
    setErrorPin('')
    setGuardando(true)
    await supabase.from('sucursales').update({ pin_caja: pin }).eq('id', suc.id)
    setPin('')
    setConfirmar('')
    setGuardando(false)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
    recargar()
  }

  return (
    <div style={{borderTop:'1px solid #f0f2f7', paddingTop:12}}>
      <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:8}}>PIN de caja 🔐</div>
      <div style={{marginBottom:10}}>
        <PinActualDisplay pinActual={suc.pin_caja} esDebil={pinActualEsDebil} />
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:8, maxWidth:220}}>
        <div style={{display:'flex', alignItems:'center', border:'2px solid #e8eaf0', borderRadius:12, overflow:'hidden'}}>
          <input style={{padding:'10px 14px', border:'none', fontSize:15, fontFamily:'monospace', letterSpacing: mostrar ? 2 : 3, outline:'none', width:'100%'}}
            type={mostrar ? 'text' : 'password'} placeholder="Nuevo PIN"
            value={pin} onChange={e => { setPin(e.target.value); setErrorPin('') }} />
          <button style={{padding:'10px 12px', background:'#f0f2f7', border:'none', cursor:'pointer', fontSize:14}}
            onClick={() => setMostrar(!mostrar)}>
            {mostrar ? '🙈' : '👁️'}
          </button>
        </div>
        <input style={{padding:'10px 14px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:15, fontFamily:'monospace', letterSpacing: mostrar ? 2 : 3, outline:'none', width:'100%', boxSizing:'border-box'}}
          type={mostrar ? 'text' : 'password'} placeholder="Confirmar PIN"
          value={confirmar} onChange={e => { setConfirmar(e.target.value); setErrorPin('') }} />
        {errorPin && <div style={{fontSize:12, color:'#e0001b'}}>⚠️ {errorPin}</div>}
        <button style={{padding:'10px 16px', background: ok ? '#00b96b' : '#0e0e0e', border:'none', borderRadius:12, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}
          onClick={guardar} disabled={guardando}>
          {ok ? '✓ PIN actualizado' : guardando ? '...' : 'Cambiar PIN'}
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
                <div style={{fontSize:10, color:'#666', marginTop:2}}>Ventas</div>
              </div>
              <div style={{textAlign:'center', background:'#f0f2f7', borderRadius:12, padding:'12px 8px'}}>
                <div style={{fontSize:20, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{suc.puntosAcreditados}</div>
                <div style={{fontSize:10, color:'#666', marginTop:2}}>Puntos</div>
              </div>
              <div style={{textAlign:'center', background:'#f0f2f7', borderRadius:12, padding:'12px 8px'}}>
                <div style={{fontSize:20, fontWeight:800, color:'#00b96b', fontFamily:'monospace'}}>{suc.totalCanjes}</div>
                <div style={{fontSize:10, color:'#666', marginTop:2}}>Canjes</div>
              </div>
            </div>
            <div style={{fontSize:11, color:'#666', marginBottom:6}}>Puntos acreditados</div>
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
  sectionTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#666', marginBottom:12, marginTop:8 },
  card: { background:'white', borderRadius:20, padding:20, marginBottom:16, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  filtroBtn: { padding:'8px 14px', border:'none', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  toggleBtn: { padding:'6px 12px', border:'none', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  deleteBtn: { minWidth:44, minHeight:44, padding:'6px 10px', background:'#fff0f0', border:'none', borderRadius:8, color:'#e0001b', cursor:'pointer', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' },
  configField: { marginBottom:20 },
  configLabel: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#666', marginBottom:8 },
  inputField: { width:'100%', padding:'12px 14px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  btnRed: { width:'100%', padding:16, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
}

function BannerPinDebil({ negocio, onConfigurar }) {
  const pinDebil = !negocio.pin_caja || PINES_COMUNES.includes(negocio.pin_caja)
  if (!pinDebil) return null
  return (
    <div style={{ background:'#fff8e6', border:'1.5px solid #f0a500', borderRadius:14, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
      <span style={{ fontSize:22, flexShrink:0 }}>🔐</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#0e0e0e', marginBottom:2 }}>PIN de caja no configurado</div>
        <div style={{ fontSize:13, color:'#666', lineHeight:1.4 }}>
          {negocio.pin_caja ? 'El PIN actual es muy común y fácil de adivinar.' : 'Sin PIN configurado, la caja queda bloqueada para el staff.'} Configuralo en Ajustes.
        </div>
      </div>
      <button onClick={onConfigurar} style={{ padding:'8px 16px', background:'#f0a500', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0 }}>
        Configurar →
      </button>
    </div>
  )
}

function BannerLimite({ totalClientes }) {
  if (totalClientes < 40) return null
  const esLimite = totalClientes >= 50

  return (
    <div style={{
      background: esLimite ? '#fff0f0' : '#fff8e6',
      border: `1.5px solid ${esLimite ? '#e0001b' : '#f0a500'}`,
      borderRadius: 14,
      padding: '14px 18px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0e0e0e', marginBottom: 2 }}>
          {esLimite ? '⚠️ Llegaste al límite de 50 clientes' : `📊 ${totalClientes} de 50 clientes — te estás acercando al límite`}
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>
          {esLimite
            ? 'Los nuevos clientes no pueden registrarse. Pasate al plan Pro para seguir creciendo.'
            : 'En el plan Gratis podés tener hasta 50. Pasate al Pro para no tener límite.'}
        </div>
      </div>
      <button
        onClick={() => window.location.href = '/dashboard/upgrade'}
        style={{ padding: '8px 16px', background: esLimite ? '#e0001b' : '#f0a500', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        Ver planes →
      </button>
    </div>
  )
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