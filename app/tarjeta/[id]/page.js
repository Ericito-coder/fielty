'use client'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function Tarjeta({ params }) {
  const [cliente, setCliente] = useState(null)
  const [recompensas, setRecompensas] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [id, setId] = useState(null)
  const [canjeando, setCanjeando] = useState(null)
  const [codigoCanje, setCodigoCanje] = useState(null)
  const [segundos, setSegundos] = useState(86399)
  const [bannerInstalar, setBannerInstalar] = useState(false)
  const [walletOk, setWalletOk] = useState(false)
  const [walletCargando, setWalletCargando] = useState(false)
  const [qrAbierto, setQrAbierto] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [esIOS, setEsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [modalIOSAbierto, setModalIOSAbierto] = useState(false)

  useEffect(() => { params.then(p => setId(p.id)) }, [params])
  useEffect(() => { if (!id) return; cargarDatos() }, [id])

  useEffect(() => {
    const yaInstalada = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
    if (yaInstalada) return
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setEsIOS(ios)
    setBannerInstalar(true)
    if (!ios) {
      const handler = (e) => { e.preventDefault(); setDeferredPrompt(e) }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

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
    let data
    try {
      const res = await fetch(`/api/tarjeta/${id}`)
      if (!res.ok) { setCargando(false); setCargandoHistorial(false); return }
      data = await res.json()
    } catch {
      setCargando(false)
      setCargandoHistorial(false)
      return
    }

    const { cliente: clienteData, recompensas: recompensasData, canjeActivo, transacciones: transaccionesData, wallet } = data
    setWalletOk(!!wallet)

    if (canjeActivo) {
      const segsRestantes = Math.floor((new Date(canjeActivo.expira_at) - new Date()) / 1000)
      setSegundos(segsRestantes)
      setCodigoCanje({ codigo: canjeActivo.codigo, recompensa: canjeActivo.recompensas })
    }

    setCliente(clienteData)
    setRecompensas(recompensasData || [])
    setTransacciones(transaccionesData || [])
    setCargando(false)
    setCargandoHistorial(false)

    try {
      const guardadas = JSON.parse(localStorage.getItem('fielty_tarjetas') || '{}')
      guardadas[clienteData.negocio_id] = {
        id: clienteData.id,
        negocioNombre: clienteData.negocio.nombre,
        negocioColor: clienteData.negocio.color,
      }
      localStorage.setItem('fielty_tarjetas', JSON.stringify(guardadas))
    } catch {}
  }

  async function canjear(recompensa) {
    if (cliente.puntos < recompensa.puntos_necesarios) return
    setCanjeando(recompensa.id)

    try {
      const res = await fetch('/api/tarjeta/canjear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId: cliente.id, recompensaId: recompensa.id }),
      })
      const data = await res.json()
      if (!res.ok) { setCanjeando(null); return }

      setCliente({ ...cliente, puntos: data.puntos ?? cliente.puntos - recompensa.puntos_necesarios })
      setCodigoCanje({ codigo: data.codigo, recompensa })
      setSegundos(Math.floor((new Date(data.expira_at) - new Date()) / 1000))
    } catch {}
    setCanjeando(null)
  }

  async function mostrarMiCodigo() {
    if (!qrDataUrl) {
      const url = `${window.location.origin}/tarjeta/${id}`
      const data = await QRCode.toDataURL(url, { width: 320, margin: 2, color: { dark: '#0e0e0e', light: '#ffffff' } })
      setQrDataUrl(data)
    }
    setQrAbierto(true)
  }

  async function agregarAWallet() {
    setWalletCargando(true)
    try {
      const res = await fetch(`/api/wallet/save-link?cliente=${id}`)
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      }
    } catch {}
    setWalletCargando(false)
  }

  function formatTime(s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m ${s % 60}s`
  }

  if (cargando) return <div style={st.wrap}><div style={st.loader}>Cargando tu tarjeta...</div></div>
  if (!cliente) return <div style={st.wrap}><div style={{textAlign:'center', padding:60}}>😕 Cliente no encontrado</div></div>

  const nivel = cliente.puntos_historicos >= 5000 ? { nombre:'Oro', emoji:'🥇', color:'#f5c842' }
    : cliente.puntos_historicos >= 1000 ? { nombre:'Plata', emoji:'🥈', color:'#aaa' }
    : { nombre:'Bronce', emoji:'🥉', color:'#cd7f32' }

  const proxima = recompensas.find(r => r.puntos_necesarios > cliente.puntos)
  const meta = proxima ? proxima.puntos_necesarios : recompensas[recompensas.length - 1]?.puntos_necesarios || 100
  const pct = Math.min((cliente.puntos / meta) * 100, 100)

  return (
    <div style={st.wrap}>

      {/* CANJE ACTIVO */}
      {codigoCanje && (
        <div style={{background:'linear-gradient(135deg, #0e0e0e, #1a1a2e)', borderRadius:24, padding:24, marginBottom:16, textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
          {segundos <= 0 ? (
            <>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#e0001b', marginBottom:8}}>⏱ Código vencido</div>
              <div style={{fontSize:18, fontWeight:800, color:'white', marginBottom:8}}>{codigoCanje.recompensa.nombre}</div>
              <div style={{fontSize:13, color:'#888', marginBottom:16, lineHeight:1.5}}>
                Tu código expiró. Los puntos volvieron a tu saldo. Podés generar uno nuevo cuando quieras.
              </div>
            </>
          ) : (
            <>
              <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#00b96b', marginBottom:8}}>🎁 Canje activo</div>
              <div style={{fontSize:18, fontWeight:800, color:'white', marginBottom:4}}>{codigoCanje.recompensa.nombre}</div>
              <div style={{fontFamily:'monospace', fontSize:32, fontWeight:700, letterSpacing:6, color:'white', marginBottom:8}}>{codigoCanje.codigo}</div>
              <div style={{fontSize:13, color:'#666', marginBottom:16}}>
                Expira en <span style={{color: segundos < 3600 ? '#e0001b' : '#00b96b', fontWeight:700}}>{formatTime(segundos)}</span>
              </div>
              <div style={{fontSize:12, color:'#555', marginBottom:16}}>📌 Mostrá este código al empleado para canjear tu recompensa.</div>
            </>
          )}
          <button style={{padding:'10px 20px', background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:12, color:'#888', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}
            onClick={() => setCodigoCanje(null)}>
            Cerrar
          </button>
        </div>
      )}

      <div style={st.loyaltyCard}>
        <div style={st.cardTop}>
          {cliente.negocio?.logo_url
            ? <img src={cliente.negocio.logo_url} style={{...st.bizLogo, objectFit:'cover', padding:0}} />
            : <div style={{...st.bizLogo, background: cliente.negocio?.color || '#e0001b'}}>
                {cliente.negocio?.nombre?.slice(0,2).toUpperCase() || 'PP'}
              </div>
          }
          <div>
            <div style={st.bizName}>{cliente.negocio?.nombre || 'Mi Negocio'}</div>
            <div style={st.bizType}>Programa de puntos</div>
          </div>
          <div style={{...st.level, color: nivel.color, borderColor: nivel.color, background: `${nivel.color}22`}}>
            {nivel.emoji} Nivel {nivel.nombre}
          </div>
        </div>

        <div style={{fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:16, lineHeight:1.5}}>
          🥉 Bronce · 🥈 Plata desde 1.000 pts históricos · 🥇 Oro desde 5.000 pts históricos
        </div>
        <div style={st.ptsLabel}>Tus puntos</div>
        <div style={st.ptsValue}>{cliente.puntos} <span style={st.ptsUnit}>pts</span></div>

        <div style={st.progressInfo}>
          <span style={st.progressText}>
            {recompensas.length === 0
              ? 'Próximamente habrá recompensas disponibles'
              : proxima
                ? `Te faltan ${meta - cliente.puntos} pts para: ${proxima.nombre}`
                : '🎉 ¡Tenés todos los premios disponibles!'}
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

      <button onClick={mostrarMiCodigo}
        style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'14px 18px', background:'white', border:'none', borderRadius:16, color:'#0e0e0e', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:16, boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
        <span style={{fontSize:18}}>📷</span>
        Mostrar mi código en la caja
      </button>

      {walletOk && (
        <button onClick={agregarAWallet} disabled={walletCargando}
          style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'14px 18px', background:'#0e0e0e', border:'none', borderRadius:16, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:16}}>
          <span style={{fontSize:18}}>👛</span>
          {walletCargando ? 'Generando tu pase...' : 'Agregar a Google Wallet'}
        </button>
      )}

      {qrAbierto && (
        <div onClick={() => setQrAbierto(false)}
          style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24}}>
          <div style={{background:'white', borderRadius:28, padding:'32px 28px', textAlign:'center', maxWidth:340, width:'100%'}} onClick={e => e.stopPropagation()}>
            <div style={{fontSize:17, fontWeight:800, color:'#0e0e0e', marginBottom:6}}>Mostrale este código al negocio</div>
            <div style={{fontSize:13, color:'#888', marginBottom:20, lineHeight:1.5}}>El empleado lo escanea desde la caja para sumarte puntos al instante.</div>
            {qrDataUrl && <img src={qrDataUrl} alt="Mi código" style={{width:'100%', maxWidth:260, height:'auto'}} />}
            <div style={{fontFamily:'monospace', fontSize:13, color:'#bbb', marginTop:12}}>FLT-{cliente.id.slice(0,5).toUpperCase()}</div>
            <button onClick={() => setQrAbierto(false)}
              style={{marginTop:20, padding:'12px 32px', background:'#0e0e0e', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {bannerInstalar && (
        <div style={{background:'white', borderRadius:20, padding:'16px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:12, boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <span style={{fontSize:22, flexShrink:0}}>📲</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14, fontWeight:700, color:'#0e0e0e', marginBottom:2}}>Guardá tu tarjeta</div>
            <div style={{fontSize:12, color:'#888'}}>Accedé sin buscarla cada vez</div>
          </div>
          {esIOS ? (
            <button style={{padding:'8px 14px', background:'#0e0e0e', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0}}
              onClick={() => setModalIOSAbierto(true)}>
              Cómo hacerlo
            </button>
          ) : deferredPrompt ? (
            <button style={{padding:'8px 14px', background:'#0e0e0e', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0}}
              onClick={async () => { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') setBannerInstalar(false) }}>
              Instalar
            </button>
          ) : null}
          <button style={{background:'none', border:'none', color:'#ccc', fontSize:16, cursor:'pointer', padding:4, flexShrink:0}}
            onClick={() => setBannerInstalar(false)}>
            ✕
          </button>
        </div>
      )}

      {/* MODAL IOS */}
      {modalIOSAbierto && (
        <div style={{position:'fixed', inset:0, zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end'}} onClick={() => setModalIOSAbierto(false)}>
          <div style={{background:'white', borderRadius:'24px 24px 0 0', padding:'28px 24px 40px', boxShadow:'0 -8px 40px rgba(0,0,0,0.15)'}} onClick={e => e.stopPropagation()}>
            <div style={{width:40, height:4, background:'#e0e0e0', borderRadius:2, margin:'0 auto 24px'}} />
            <div style={{fontSize:18, fontWeight:800, color:'#0e0e0e', marginBottom:6}}>Agregar a pantalla de inicio</div>
            <div style={{fontSize:13, color:'#888', marginBottom:24}}>Seguí estos pasos en Safari para tener tu tarjeta como una app:</div>
            {[
              { n:1, texto: <>Tocá los <strong>⋯ tres puntos</strong> arriba a la derecha en Safari</> },
              { n:2, texto: <>Tocá <strong>Compartir</strong></> },
              { n:3, texto: <>Deslizá y tocá <strong>Ver más</strong></> },
              { n:4, texto: <>Tocá <strong>"Agregar a pantalla de inicio"</strong> y confirmá</> },
            ].map(({ n, texto }) => (
              <div key={n} style={{display:'flex', alignItems:'flex-start', gap:14, marginBottom:18}}>
                <div style={{width:28, height:28, borderRadius:'50%', background:'#0e0e0e', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0}}>{n}</div>
                <div style={{fontSize:14, color:'#333', lineHeight:1.5, paddingTop:4}}>{texto}</div>
              </div>
            ))}
            <button style={{width:'100%', padding:16, background:'#0e0e0e', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginTop:8}}
              onClick={() => setModalIOSAbierto(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

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

      <div style={st.section}>
        <div style={st.sectionTitle}>Invitá amigos</div>
        <div style={{textAlign:'center', padding:'8px 0 16px'}}>
          <div style={{fontSize:32, marginBottom:8}}>🤝</div>
          <div style={{fontSize:15, fontWeight:700, color:'#0e0e0e', marginBottom:4}}>
            Compartí tu link y ganá puntos
          </div>
          <div style={{fontSize:13, color:'#888', marginBottom:20, lineHeight:1.5}}>
            Cuando un amigo se registra con tu link, vos ganás{' '}
            <strong style={{color:'#0e0e0e'}}>{cliente.negocio?.puntos_referido_emisor || 100} pts</strong>{' '}
            y tu amigo gana{' '}
            <strong style={{color:'#0e0e0e'}}>{cliente.negocio?.puntos_referido_receptor || 50} pts</strong>.
          </div>
          <button style={{
            width:'100%', padding:14,
            background:'linear-gradient(135deg, #0e0e0e, #333)',
            border:'none', borderRadius:14, color:'white',
            fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit'
          }} onClick={() => {
            const link = `${window.location.origin}/registro/${cliente.negocio?.slug || ''}?ref=${cliente.id}`
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

      <HistorialSection transacciones={transacciones} cargando={cargandoHistorial} />

      <div style={{ textAlign: 'center', padding: '8px 0 32px' }}>
        <a href="/mi-tarjeta" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
          ¿No sos vos? Ingresá con tu cuenta
        </a>
      </div>

    </div>
  )
}

function HistorialSection({ transacciones, cargando }) {
  const getIcono = (tipo) => {
    if (tipo === 'suma') return '⭐'
    if (tipo === 'cumpleanos') return '🎂'
    if (tipo === 'referido') return '🤝'
    if (tipo === 'canje') return '🎁'
    if (tipo === 'devolucion') return '↩️'
    return '✨'
  }

  const getColor = (tipo) => tipo === 'canje' ? '#e0001b' : '#00b96b'
  const getPrefix = (tipo) => tipo === 'canje' ? '-' : '+'

  return (
    <div style={st.section}>
      <div style={st.sectionTitle}>Historial</div>
      {cargando && <div style={{textAlign:'center', padding:20, color:'#888', fontSize:13}}>Cargando...</div>}
      {!cargando && transacciones.length === 0 && (
        <div style={{textAlign:'center', padding:20, color:'#888', fontSize:13}}>Todavía no hay movimientos</div>
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
}