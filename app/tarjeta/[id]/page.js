'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Tarjeta({ params }) {
  const [cliente, setCliente] = useState(null)
  const [recompensas, setRecompensas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [id, setId] = useState(null)
  const [canjeando, setCanjeando] = useState(null)
  const [codigoCanje, setCodigoCanje] = useState(null)
  const [segundos, setSegundos] = useState(86399)

  useEffect(() => { params.then(p => setId(p.id)) }, [params])
  useEffect(() => { 
    if (!id) return
    cargarDatos()
  }, [id])

  useEffect(() => {
    if (!codigoCanje || segundos <= 0) return
    const interval = setInterval(() => {
      setSegundos(s => {
        if (s <= 1) { clearInterval(interval); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [codigoCanje])

  async function cargarDatos() {
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*, negocio:negocios(nombre, color, pesos_por_punto, puntos_por_tramo)')
      .eq('id', id)
      .single()

    const { data: recompensasData } = await supabase
      .from('recompensas')
      .select('*')
      .eq('negocio_id', clienteData.negocio_id)
      .eq('activa', true)
      .order('puntos_necesarios', { ascending: true })

       // Buscar canje pendiente activo
    const { data: canjeActivo } = await supabase
      .from('canjes')
      .select('*, recompensas(nombre)')
      .eq('cliente_id', id)
      .eq('estado', 'pendiente')
      .gt('expira_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (canjeActivo) {
      const segsRestantes = Math.floor((new Date(canjeActivo.expira_at) - new Date()) / 1000)
      setSegundos(segsRestantes)
      setCodigoCanje({ codigo: canjeActivo.codigo, recompensa: canjeActivo.recompensas })
    }

    setCliente(clienteData)
    setRecompensas(recompensasData || [])
    setCargando(false)
  }

  async function canjear(recompensa) {
    if (cliente.puntos < recompensa.puntos_necesarios) return
    setCanjeando(recompensa.id)

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let codigo = ''
    for (let i = 0; i < 3; i++) codigo += chars[Math.floor(Math.random() * chars.length)]
    codigo += '-'
    for (let i = 0; i < 3; i++) codigo += chars[Math.floor(Math.random() * chars.length)]

    const expira_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('canjes')
      .insert([{
        cliente_id: cliente.id,
        negocio_id: cliente.negocio_id,
        recompensa_id: recompensa.id,
        codigo,
        estado: 'pendiente',
        puntos_descontados: recompensa.puntos_necesarios,
        expira_at
      }])

    if (error) { setCanjeando(null); return }

    const nuevosPuntos = cliente.puntos - recompensa.puntos_necesarios
    await supabase.from('clientes').update({ puntos: nuevosPuntos }).eq('id', cliente.id)

    setCliente({ ...cliente, puntos: nuevosPuntos })
    setCodigoCanje({ codigo, recompensa })
    setCanjeando(null)
    setSegundos(86399)

  }

  function formatTime(s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m ${s % 60}s`
  }

  if (cargando) return <div style={st.wrap}><div style={st.loader}>Cargando tu tarjeta...</div></div>
  if (!cliente) return <div style={st.wrap}><div style={{textAlign:'center', padding:60}}>😕 Cliente no encontrado</div></div>

  if (codigoCanje) return (
    <div style={st.wrap}>
      <div style={st.qrCard}>
        <div style={{fontSize:14, color:'#888', marginBottom:4}}>{cliente.negocio?.nombre}</div>
        <div style={st.qrReward}>{codigoCanje.recompensa.nombre}</div>
        <div style={st.qrDesc}>Mostrá este código al empleado</div>
        <div style={st.qrBox}>
          <div style={st.qrGrid}>
            {Array.from({length:49}).map((_,i) => (
              <div key={i} style={{borderRadius:2, background: Math.random() > 0.5 ? '#0e0e0e' : 'white'}}/>
            ))}
          </div>
        </div>
        <div style={st.codigo}>{codigoCanje.codigo}</div>
        <div style={st.expira}>
          Expira en <span style={{color: segundos < 3600 ? '#e0001b' : '#00b96b', fontWeight:700}}>{formatTime(segundos)}</span>
        </div>
        <div style={st.warning}>📌 Una vez validado por el empleado, el código se invalida automáticamente.</div>
        <button style={st.btnVolver} onClick={() => setCodigoCanje(null)}>← Volver a mi tarjeta</button>
      </div>
    </div>
  )

  // Nivel del cliente
  const nivel = cliente.puntos_historicos >= 5000 ? { nombre:'Oro', emoji:'🥇', color:'#f5c842' }
    : cliente.puntos_historicos >= 1000 ? { nombre:'Plata', emoji:'🥈', color:'#aaa' }
    : { nombre:'Bronce', emoji:'🥉', color:'#cd7f32' }

  const proxima = recompensas.find(r => r.puntos_necesarios > cliente.puntos)
  const meta = proxima ? proxima.puntos_necesarios : recompensas[recompensas.length - 1]?.puntos_necesarios || 100
  const pct = Math.min((cliente.puntos / meta) * 100, 100)

  return (
    <div style={st.wrap}>
      <div style={st.loyaltyCard}>
        <div style={st.cardTop}>
          <div style={{...st.bizLogo, background: cliente.negocio?.color || '#e0001b'}}>
            {cliente.negocio?.nombre?.slice(0,2).toUpperCase() || 'PP'}
          </div>
          <div>
            <div style={st.bizName}>{cliente.negocio?.nombre || 'Mi Negocio'}</div>
            <div style={st.bizType}>Programa de puntos</div>
          </div>
          <div style={{...st.level, color: nivel.color, borderColor: nivel.color, background: `${nivel.color}22`}}>
            {nivel.emoji} Nivel {nivel.nombre}
          </div>
        </div>

        <div style={st.ptsLabel}>Tus puntos</div>
        <div style={st.ptsValue}>{cliente.puntos} <span style={st.ptsUnit}>pts</span></div>

        <div style={st.progressInfo}>
          <span style={st.progressText}>
            {proxima ? `Te faltan ${meta - cliente.puntos} pts para: ${proxima.nombre}` : '🎉 ¡Tenés todos los premios disponibles!'}
          </span>
        </div>
        <div style={st.progressBg}>
          <div style={{...st.progressFill, width: pct+'%', background: `linear-gradient(90deg, ${cliente.negocio?.color || '#e0001b'}, #f5c842)`}} />
        </div>

        <div style={st.cardFooter}>
          <span style={st.cardUser}>{cliente.nombre}</span>
          <span style={st.cardId}>FLT-{cliente.id.slice(0,5).toUpperCase()}</span>
        </div>
      </div>

      <div style={st.section}>
        <div style={st.sectionTitle}>Tus recompensas</div>
        {recompensas.map(r => {
          const desbloqueada = cliente.puntos >= r.puntos_necesarios
          const estaCargando = canjeando === r.id
          return (
            <div key={r.id} style={{
              ...st.rewardRow,
              background: desbloqueada ? 'rgba(0,185,107,0.05)' : 'transparent',
              borderRadius: desbloqueada ? 12 : 0,
              margin: desbloqueada ? '4px -8px' : 0,
              padding: desbloqueada ? '12px 8px' : '14px 0',
            }}>
              <div style={st.rewardIcon}>{desbloqueada ? '🎁' : '🔒'}</div>
              <div style={st.rewardInfo}>
                <div style={st.rewardName}>{r.nombre}</div>
                <div style={st.rewardReq}>
                  {r.puntos_necesarios} pts · {desbloqueada ? '¡Ya podés canjear!' : `Te faltan ${r.puntos_necesarios - cliente.puntos} pts`}
                </div>
              </div>
              <button disabled={!desbloqueada || estaCargando} onClick={() => canjear(r)}
                style={{...st.badge, background: desbloqueada ? 'rgba(0,185,107,0.15)' : '#f0f1f5',
                  color: desbloqueada ? '#00b96b' : '#aaa', cursor: desbloqueada ? 'pointer' : 'default',
                  border:'none', fontFamily:'inherit'}}>
                {estaCargando ? '...' : desbloqueada ? 'Canjear' : `${r.puntos_necesarios} pts`}
              </button>
            </div>
          )
        })}
      </div>

      {/* REFERIDOS */}
      <div style={st.section}>
        <div style={st.sectionTitle}>Invitá amigos</div>
        <div style={{textAlign:'center', padding:'8px 0 16px'}}>
          <div style={{fontSize:32, marginBottom:8}}>🤝</div>
          <div style={{fontSize:15, fontWeight:700, color:'#0e0e0e', marginBottom:4}}>
            Compartí tu link y ganá puntos
          </div>
          <div style={{fontSize:13, color:'#888', marginBottom:20, lineHeight:1.5}}>
            Cuando un amigo se registra con tu link,<br/>los dos reciben puntos de regalo.
          </div>
          <button style={{
            width:'100%', padding:14,
            background:'linear-gradient(135deg, #0e0e0e, #333)',
            border:'none', borderRadius:14, color:'white',
            fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit'
          }} onClick={() => {
            const link = `${window.location.origin}/registro?negocio=${cliente.negocio_id}&ref=${cliente.id}`
            if (navigator.share) {
              navigator.share({ title: 'Sumate al programa de puntos', text: '¡Registrate con mi link y los dos ganamos puntos!', url: link })
            } else {
              navigator.clipboard.writeText(link)
              alert('¡Link copiado!')
            }
          }}>
            🔗 Compartir mi link
          </button>
        </div>
      </div>

      <HistorialSection clienteId={id} />

    </div>
  )
}
function HistorialSection({ clienteId }) {
  const [transacciones, setTransacciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!clienteId) return
    supabase
      .from('transacciones')
      .select('*, sucursal:sucursales(nombre)')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setTransacciones(data || [])
        setCargando(false)
      })
  }, [clienteId])

  const getIcono = (tipo) => {
    if (tipo === 'suma') return '⭐'
    if (tipo === 'cumpleanos') return '🎂'
    if (tipo === 'referido') return '🤝'
    if (tipo === 'canje') return '🎁'
    return '✨'
  }

  const getColor = (tipo) => {
    if (tipo === 'canje') return '#e0001b'
    return '#00b96b'
  }

  const getPrefix = (tipo) => tipo === 'canje' ? '-' : '+'

  return (
    <div style={st.section}>
      <div style={st.sectionTitle}>Historial</div>
      {cargando && <div style={{textAlign:'center', padding:20, color:'#888', fontSize:13}}>Cargando...</div>}
      {!cargando && transacciones.length === 0 && (
        <div style={{textAlign:'center', padding:20, color:'#888', fontSize:13}}>
          Todavía no hay movimientos
        </div>
      )}
      {transacciones.map((t, i) => (
        <div key={i} style={{...st.histItem, borderBottom: i < transacciones.length - 1 ? '1px solid #f0f1f5' : 'none'}}>
          <div style={{...st.histIcon, background: t.tipo === 'canje' ? '#fff0f0' : t.tipo === 'cumpleanos' ? '#fff8e0' : '#f0f2f7'}}>
            {getIcono(t.tipo)}
          </div>
          <div style={st.histInfo}>
            <div style={st.histTitle}>{t.descripcion}</div>
            <div style={st.histDate}>
              {new Date(t.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' })}
              {t.sucursal?.nombre && ` · ${t.sucursal.nombre}`}
            </div>
          </div>
          <div style={{...st.histPts, color: getColor(t.tipo)}}>
            {getPrefix(t.tipo)}{t.puntos} pts
          </div>
        </div>
      ))}
    </div>
  )
}
const st = {
  wrap: { minHeight:'100vh', background:'#f0f2f7', padding:'20px 16px 60px', maxWidth:420, margin:'0 auto' },
  loader: { textAlign:'center', padding:60, color:'#888', fontSize:16 },
  loyaltyCard: { background:'linear-gradient(145deg, #1a1a2e, #0f3460)', borderRadius:28, padding:28, marginBottom:16, boxShadow:'0 20px 60px rgba(26,26,46,0.3)' },
  cardTop: { display:'flex', alignItems:'center', gap:12, marginBottom:28 },
  bizLogo: { width:44, height:44, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:900, color:'white', flexShrink:0 },
  bizName: { fontSize:17, fontWeight:700, color:'white' },
  bizType: { fontSize:12, color:'rgba(255,255,255,0.5)' },
  level: { marginLeft:'auto', border:'1px solid', borderRadius:100, padding:'5px 12px', fontSize:12, fontWeight:600 },
  ptsLabel: { fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 },
  ptsValue: { fontSize:54, fontWeight:900, color:'white', lineHeight:1, letterSpacing:-2, marginBottom:20 },
  ptsUnit: { fontSize:20, fontWeight:400, color:'rgba(255,255,255,0.5)', letterSpacing:0 },
  progressInfo: { marginBottom:10 },
  progressText: { fontSize:13, color:'rgba(255,255,255,0.6)', fontWeight:500 },
  progressBg: { height:8, background:'rgba(255,255,255,0.12)', borderRadius:100, overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:100, transition:'width 1s ease' },
  cardFooter: { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:20, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.1)' },
  cardUser: { fontSize:14, color:'rgba(255,255,255,0.7)', fontWeight:500 },
  cardId: { fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.3)' },
  section: { background:'white', borderRadius:24, padding:24, marginBottom:16, boxShadow:'0 4px 20px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:16 },
  rewardRow: { display:'flex', alignItems:'center', gap:14, borderBottom:'1px solid #f0f1f5' },
  rewardIcon: { width:44, height:44, borderRadius:12, background:'#f0f2f7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 },
  rewardInfo: { flex:1 },
  rewardName: { fontSize:15, fontWeight:700, color:'#0e0e0e' },
  rewardReq: { fontSize:12, color:'#888', marginTop:2 },
  badge: { padding:'6px 12px', borderRadius:100, fontSize:12, fontWeight:700, flexShrink:0 },
  histItem: { display:'flex', alignItems:'center', gap:12, padding:'12px 0' },
  histIcon: { width:36, height:36, borderRadius:10, background:'#f0f2f7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 },
  histInfo: { flex:1 },
  histTitle: { fontSize:14, fontWeight:600 },
  histDate: { fontSize:12, color:'#888', marginTop:1 },
  histPts: { fontSize:14, fontWeight:700, color:'#00b96b' },
  qrCard: { background:'white', borderRadius:28, padding:'36px 28px', textAlign:'center', maxWidth:380, margin:'40px auto' },
  qrReward: { fontSize:24, fontWeight:800, color:'#0e0e0e', marginBottom:6 },
  qrDesc: { fontSize:14, color:'#888', marginBottom:28 },
  qrBox: { width:180, height:180, background:'#0e0e0e', borderRadius:16, margin:'0 auto 24px', padding:16, display:'flex', alignItems:'center', justifyContent:'center' },
  qrGrid: { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, width:'100%', height:'100%' },
  codigo: { fontFamily:'monospace', fontSize:28, fontWeight:700, letterSpacing:6, color:'#0e0e0e', marginBottom:8 },
  expira: { fontSize:13, color:'#888', marginBottom:24 },
  warning: { background:'#fff8f0', border:'1px solid #ffe5cc', borderRadius:12, padding:'14px 16px', fontSize:13, color:'#888', lineHeight:1.6, marginBottom:20, textAlign:'left' },
  btnVolver: { width:'100%', padding:16, background:'#f0f2f7', border:'none', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color:'#0e0e0e' },
}