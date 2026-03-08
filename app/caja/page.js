'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const NEGOCIO_ID = 'b6bf5d90-9aca-46c4-8f9a-ff3ec342af67'
const PIN_CORRECTO = '1234'

export default function Caja() {
  const [pantalla, setPantalla] = useState('pin')
  const [pin, setPin] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [clientes, setClientes] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [monto, setMonto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [canjeResult, setCanjeResult] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  function presionarPin(d) {
    if (pin.length >= 4) return
    const nuevo = pin + d
    setPin(nuevo)
    if (nuevo.length === 4) {
      setTimeout(() => {
        if (nuevo === PIN_CORRECTO) { setPantalla('buscar'); setPin('') }
        else { mostrarMensaje('❌ PIN incorrecto', 'error'); setPin('') }
      }, 200)
    }
  }

  function borrarPin() { setPin(pin.slice(0, -1)) }

  async function buscarCliente(valor) {
    setBusqueda(valor)
    if (valor.length < 2) { setClientes([]); return }
    const { data } = await supabase
      .from('clientes')
      .select('*, negocio:negocios(pesos_por_punto, puntos_por_tramo, color, nombre)')
      .eq('negocio_id', NEGOCIO_ID)
      .or(`nombre.ilike.%${valor}%,dni.ilike.%${valor}%`)
      .limit(5)
    setClientes(data || [])
  }

  function seleccionarCliente(c) {
    setClienteSeleccionado(c)
    setBusqueda('')
    setClientes([])
    setMonto('')
    setPantalla('cliente')
  }

  async function acreditarPuntos() {
    const valor = parseInt(monto)
    if (!valor || valor < 100) { mostrarMensaje('⚠️ Ingresá un monto válido', 'error'); return }

    const pesosPorPunto = clienteSeleccionado.negocio?.pesos_por_punto || 100
    const puntosPorTramo = clienteSeleccionado.negocio?.puntos_por_tramo || 1
    const pts = Math.floor(valor / pesosPorPunto) * puntosPorTramo

    setCargando(true)

    const nuevosPuntos = clienteSeleccionado.puntos + pts
    const nuevosHistoricos = (clienteSeleccionado.puntos_historicos || 0) + pts

    await supabase
      .from('clientes')
      .update({
        puntos: nuevosPuntos,
        puntos_historicos: nuevosHistoricos,
        visitas: clienteSeleccionado.visitas + 1,
        ultima_visita: new Date().toISOString()
      })
      .eq('id', clienteSeleccionado.id)

    await supabase
      .from('transacciones')
      .insert([{
        cliente_id: clienteSeleccionado.id,
        negocio_id: NEGOCIO_ID,
        tipo: 'suma',
        puntos: pts,
        descripcion: `Compra $${valor.toLocaleString()}`
      }])

    setClienteSeleccionado({ ...clienteSeleccionado, puntos: nuevosPuntos, puntos_historicos: nuevosHistoricos })
    setCargando(false)
    setMonto('')
    mostrarMensaje(`✅ +${pts} puntos a ${clienteSeleccionado.nombre.split(' ')[0]}`, 'success')
  }

  async function validarCanje() {
    if (codigo.length < 7) { mostrarMensaje('⚠️ Ingresá el código completo', 'error'); return }
    setCargando(true)
    setCanjeResult(null)

    const ahora = new Date().toISOString()

    const { data: canje } = await supabase
      .from('canjes')
      .select('*, clientes(id, nombre, puntos), recompensas(nombre, puntos_necesarios)')
      .eq('codigo', codigo.toUpperCase())
      .eq('negocio_id', NEGOCIO_ID)
      .eq('estado', 'pendiente')
      .single()

    setCargando(false)

    if (!canje) { mostrarMensaje('❌ Código inválido o ya usado', 'error'); setCodigo(''); return }

    // Verificar expiración
    if (new Date() > new Date(canje.expira_at)) {
      await supabase.from('canjes').update({ estado: 'expirado' }).eq('id', canje.id)

      const { data: clienteActual } = await supabase
        .from('clientes').select('puntos').eq('id', canje.clientes.id).single()

      await supabase
        .from('clientes')
        .update({ puntos: (clienteActual?.puntos || 0) + canje.puntos_descontados })
        .eq('id', canje.clientes.id)

      mostrarMensaje(`⏱️ Código expirado — se devolvieron ${canje.puntos_descontados} pts a ${canje.clientes.nombre.split(' ')[0]}`, 'error')
      setCodigo('')
      return
    }

    setCanjeResult(canje)
  }

  async function confirmarCanje() {
    if (!canjeResult) return
    setCargando(true)
    await supabase.from('canjes')
      .update({ estado: 'usado', usado_at: new Date().toISOString() })
      .eq('id', canjeResult.id)
    setCargando(false)
    setCanjeResult(null)
    setCodigo('')
    mostrarMensaje(`✅ Canje confirmado: ${canjeResult.recompensas.nombre}`, 'success')
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  // Calcular pts preview
  const pesosPorPunto = clienteSeleccionado?.negocio?.pesos_por_punto || 100
  const puntosPorTramo = clienteSeleccionado?.negocio?.puntos_por_tramo || 1
  const ptsPreview = Math.floor((parseInt(monto) || 0) / pesosPorPunto) * puntosPorTramo

  // Nivel
  const getNivel = (pts) => {
    if (pts >= 5000) return { nombre:'Oro', emoji:'🥇', color:'#f5c842' }
    if (pts >= 1000) return { nombre:'Plata', emoji:'🥈', color:'#aaa' }
    return { nombre:'Bronce', emoji:'🥉', color:'#cd7f32' }
  }

  if (pantalla === 'pin') return (
    <div style={s.wrap}>
      <div style={s.pinWrap}>
        <div style={s.ppLogo}>PP</div>
        <div style={s.pinTitle}>Ingresá tu PIN</div>
        <div style={s.pinSub}>Vista de caja · Staff</div>
        <div style={s.pinDots}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{...s.dot, background: i < pin.length ? '#e0001b' : '#2a2a2a'}} />
          ))}
        </div>
        <div style={s.numpad}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => (
            <button key={i} style={{...s.numBtn, opacity: n==='' ? 0 : 1}}
              onClick={() => n==='⌫' ? borrarPin() : n!=='' ? presionarPin(String(n)) : null}>
              {n}
            </button>
          ))}
        </div>
        <div style={{fontSize:12, color:'#444', textAlign:'center'}}>
          PIN de prueba: <span style={{fontFamily:'monospace', color:'#e0001b'}}>1234</span>
        </div>
      </div>
    </div>
  )

  if (pantalla === 'buscar') return (
    <div style={s.wrap}>
      {mensaje && <div style={{...s.toast, background: mensaje.tipo==='error' ? '#e0001b' : '#00b96b'}}>{mensaje.texto}</div>}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.ppLogoSm}>PP</div>
          <div>
            <div style={s.topbarBiz}>Caja · Pet Point</div>
            <div style={s.topbarRole}>👤 Staff</div>
          </div>
        </div>
        <button style={s.lockBtn} onClick={() => { setPantalla('pin'); setPin('') }}>🔒</button>
      </div>
      <div style={s.content}>
        <div style={s.label}>Buscar cliente</div>
        <div style={s.searchBox}>
          <span>🔍</span>
          <input style={s.searchInput} placeholder="Nombre o DNI..."
            value={busqueda} onChange={e => buscarCliente(e.target.value)} autoComplete="off" />
        </div>
        {clientes.length > 0 && (
          <div style={s.resultList}>
            {clientes.map(c => {
              const nivel = getNivel(c.puntos_historicos || 0)
              return (
                <div key={c.id} style={s.clientRow} onClick={() => seleccionarCliente(c)}>
                  <div style={{...s.clientAvatar, background: c.negocio?.color || '#e0001b'}}>
                    {c.nombre.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={s.clientName}>{c.nombre}</div>
                    <div style={s.clientMeta}>DNI {c.dni} · {nivel.emoji} {nivel.nombre}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={s.clientPts}>{c.puntos}</div>
                    <div style={{fontSize:10, color:'#666'}}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {busqueda.length < 2 && (
          <div style={{marginTop:24}}>
            <div style={s.label}>Accesos rápidos</div>
            <button style={s.quickBtn} onClick={() => setPantalla('validar')}>
              🎁 Validar canje de recompensa
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (pantalla === 'cliente') {
    const nivel = getNivel(clienteSeleccionado?.puntos_historicos || 0)
    return (
      <div style={s.wrap}>
        {mensaje && <div style={{...s.toast, background: mensaje.tipo==='error' ? '#e0001b' : '#00b96b'}}>{mensaje.texto}</div>}
        <div style={s.topbar}>
          <button style={s.backBtn} onClick={() => setPantalla('buscar')}>←</button>
          <div style={{flex:1}}>
            <div style={s.topbarBiz}>{clienteSeleccionado?.nombre}</div>
            <div style={s.topbarRole}>DNI {clienteSeleccionado?.dni} · {nivel.emoji} {nivel.nombre}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:24, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{clienteSeleccionado?.puntos}</div>
            <div style={{fontSize:10, color:'#666'}}>puntos</div>
          </div>
        </div>
        <div style={s.content}>
          <div style={s.label}>Acreditar puntos</div>
          <div style={s.montoWrap}>
            <span style={{fontSize:24, color:'#666', fontWeight:300}}>$</span>
            <input style={s.montoInput} type="number" inputMode="numeric"
              placeholder="0" value={monto} onChange={e => setMonto(e.target.value)} />
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#00b96b', fontFamily:'monospace'}}>+{ptsPreview}</div>
              <div style={{fontSize:10, color:'#666'}}>puntos</div>
            </div>
          </div>
          <div style={s.presets}>
            {[500,1000,2000,5000].map(v => (
              <button key={v}
                style={{...s.presetBtn, ...(monto==v ? {background:'rgba(224,0,27,0.15)', borderWidth:1, borderStyle:'solid', borderColor:'#e0001b', color:'#e0001b'} : {})}}
                onClick={() => setMonto(String(v))}>
                ${v.toLocaleString()}
              </button>
            ))}
          </div>
          <button style={{...s.btnRed, opacity: !monto || parseInt(monto)<100 ? 0.4 : 1}}
            onClick={acreditarPuntos} disabled={cargando || !monto || parseInt(monto)<100}>
            {cargando ? 'Acreditando...' : 'Sumar puntos al cliente'}
          </button>
          <button style={{...s.btnGhost, marginTop:10}} onClick={() => setPantalla('validar')}>
            🎁 Validar canje de recompensa
          </button>
        </div>
      </div>
    )
  }

  if (pantalla === 'validar') return (
    <div style={s.wrap}>
      {mensaje && <div style={{...s.toast, background: mensaje.tipo==='error' ? '#e0001b' : '#00b96b'}}>{mensaje.texto}</div>}
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={() => { setPantalla('buscar'); setCanjeResult(null); setCodigo('') }}>←</button>
        <div style={s.topbarBiz}>Validar canje</div>
      </div>
      <div style={s.content}>
        <div style={s.label}>Ingresá el código del cliente</div>
        <div style={s.codeWrap}>
          <input style={s.codeInput} placeholder="XK4-92B" value={codigo} maxLength={7}
            onChange={e => {
              let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
              if (v.length > 3) v = v.slice(0,3) + '-' + v.slice(3,6)
              setCodigo(v)
            }} />
          <button style={s.btnValidate} onClick={validarCanje} disabled={cargando}>
            {cargando ? '...' : 'Validar'}
          </button>
        </div>
        {canjeResult && (
          <div style={s.canjeCard}>
            <div style={{fontSize:36, marginBottom:12}}>🎁</div>
            <div style={{fontSize:11, color:'#00b96b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4}}>Canje válido</div>
            <div style={{fontSize:20, fontWeight:800, marginBottom:4}}>{canjeResult.recompensas.nombre}</div>
            <div style={{fontSize:14, color:'#888', marginBottom:24}}>
              Cliente: {canjeResult.clientes.nombre} · {canjeResult.recompensas.puntos_necesarios} pts
            </div>
            <button style={s.btnGreen} onClick={confirmarCanje} disabled={cargando}>
              {cargando ? 'Confirmando...' : '✓ Confirmar canje'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', color:'white', width:'100%', maxWidth:420, margin:'0 auto', position:'relative', overflowX:'hidden' },
  toast: { position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', color:'white', padding:'12px 24px', borderRadius:100, fontSize:14, fontWeight:600, zIndex:9999, whiteSpace:'nowrap', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' },
  pinWrap: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:24, padding:32 },
  ppLogo: { width:52, height:52, borderRadius:14, background:'#e0001b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:'white' },
  pinTitle: { fontSize:24, fontWeight:800 },
  pinSub: { fontSize:14, color:'#666', marginTop:-16 },
  pinDots: { display:'flex', gap:14 },
  dot: { width:16, height:16, borderRadius:'50%', transition:'background 0.2s' },
  numpad: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, width:280 },
  numBtn: { aspectRatio:1, borderRadius:20, border:'1px solid #2a2a2a', background:'#1a1a1a', color:'white', fontSize:22, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  topbar: { display:'flex', alignItems:'center', gap:12, padding:'20px 20px 16px', borderBottom:'1px solid #1e1e1e' },
  topbarLeft: { display:'flex', alignItems:'center', gap:10, flex:1 },
  ppLogoSm: { width:32, height:32, borderRadius:9, background:'#e0001b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'white', flexShrink:0 },
  topbarBiz: { fontSize:15, fontWeight:700 },
  topbarRole: { fontSize:11, color:'#666' },
  lockBtn: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, padding:'8px 12px', color:'white', cursor:'pointer', fontSize:16 },
  backBtn: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, width:36, height:36, color:'white', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' },
  content: { padding:20 },
  label: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#666', marginBottom:12 },
  searchBox: { display:'flex', alignItems:'center', gap:10, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:16, padding:'14px 16px', marginBottom:12 },
  searchInput: { flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:16, fontFamily:'inherit' },
  resultList: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:16, overflow:'hidden' },
  clientRow: { display:'flex', alignItems:'center', gap:12, padding:16, borderBottom:'1px solid #222', cursor:'pointer' },
  clientAvatar: { width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, flexShrink:0 },
  clientName: { fontSize:15, fontWeight:700 },
  clientMeta: { fontSize:12, color:'#666' },
  clientPts: { fontSize:18, fontWeight:800, color:'#f0a500', fontFamily:'monospace' },
  quickBtn: { width:'100%', padding:16, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textAlign:'left' },
  montoWrap: { display:'flex', alignItems:'center', gap:12, background:'#1a1a1a', border:'2px solid #2a2a2a', borderRadius:20, padding:'18px 20px', marginBottom:14 },
  montoInput: { flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:36, fontWeight:500, fontFamily:'monospace', minWidth:0 },
  presets: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 },
  presetBtn: { padding:12, borderRadius:12, borderWidth:1, borderStyle:'solid', borderColor:'#2a2a2a', background:'#1a1a1a', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  btnRed: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:16, color:'white', fontSize:17, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
  btnGhost: { width:'100%', padding:16, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  codeWrap: { display:'flex', gap:10, marginBottom:20 },
  codeInput: { flex:1, background:'#1a1a1a', border:'2px solid #2a2a2a', borderRadius:14, padding:'16px 18px', color:'white', fontSize:22, fontWeight:500, fontFamily:'monospace', letterSpacing:4, textAlign:'center', outline:'none' },
  btnValidate: { padding:'16px 20px', background:'#00b96b', border:'none', borderRadius:14, color:'white', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
  canjeCard: { background:'rgba(0,185,107,0.08)', border:'1px solid rgba(0,185,107,0.3)', borderRadius:20, padding:28, textAlign:'center' },
  btnGreen: { width:'100%', padding:18, background:'#00b96b', border:'none', borderRadius:14, color:'white', fontSize:17, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 24px rgba(0,185,107,0.3)' },
}