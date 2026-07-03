'use client'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { linkWhatsApp } from '@/lib/wa'

export default function CajaSlugSucursal({ params }) {
  const [slugNegocio, setSlugNegocio] = useState(null)
  const [slugSucursal, setSlugSucursal] = useState(null)
  const [negocio, setNegocio] = useState(null)
  const [sucursal, setSucursal] = useState(null)
  const [isMobile, setIsMobile] = useState(null)
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
  const [tabDesktop, setTabDesktop] = useState('puntos')
  const [pinVerificado, setPinVerificado] = useState('')
  const [qrModal, setQrModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [regModal, setRegModal] = useState(false)
  const [regNombre, setRegNombre] = useState('')
  const [regDni, setRegDni] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regTelefono, setRegTelefono] = useState('')
  const [regMonto, setRegMonto] = useState('')
  const [regCargando, setRegCargando] = useState(false)
  const [regError, setRegError] = useState('')
  const [avisoWa, setAvisoWa] = useState(null)

  useEffect(() => {
    params.then(p => { setSlugNegocio(p.slug); setSlugSucursal(p.sucursal) })
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [params])

  useEffect(() => {
    if (!slugNegocio || !slugSucursal) return
    fetch(`/api/caja/info?slug=${encodeURIComponent(slugNegocio)}&sucursal=${encodeURIComponent(slugSucursal)}`)
      .then(res => res.ok ? res.json() : { negocio: null, sucursal: null })
      .then(({ negocio: neg, sucursal: suc }) => { setNegocio(neg); setSucursal(suc) })
      .catch(() => {})
  }, [slugNegocio, slugSucursal])

  async function ingresarPin() {
    if (!pin) return
    setCargando(true)
    try {
      const res = await fetch('/api/caja/verificar-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slugNegocio, sucursalSlug: slugSucursal, pin }),
      })
      const data = await res.json()
      setCargando(false)
      if (!res.ok) { mostrarMensaje(`❌ ${data.error || 'PIN incorrecto'}`, 'error'); setPin(''); return }
      setPinVerificado(pin)
      setPantalla('buscar')
      setPin('')
    } catch {
      setCargando(false)
      mostrarMensaje('❌ Error de conexión', 'error')
    }
  }

  async function buscarCliente(valor) {
    setBusqueda(valor)
    if (valor.length < 2) { setClientes([]); return }
    try {
      const res = await fetch('/api/caja/buscar-clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId: negocio.id, sucursalId: sucursal.id, pin: pinVerificado, q: valor }),
      })
      const data = await res.json()
      setClientes(res.ok ? (data.clientes || []) : [])
    } catch {
      setClientes([])
    }
  }

  function seleccionarCliente(c) {
    setClienteSeleccionado(c)
    setMonto('')
    setCodigo('')
    setCanjeResult(null)
    setAvisoWa(null)
    setTabDesktop('puntos')
    if (isMobile) setPantalla('cliente')
  }

  async function acreditarPuntos() {
    const valor = parseInt(monto)
    if (!valor || valor < 100) { mostrarMensaje('⚠️ Ingresá un monto válido', 'error'); return }

    setCargando(true)
    const res = await fetch('/api/caja/acreditar-puntos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negocioId: negocio.id, clienteId: clienteSeleccionado.id, monto: valor, pin: pinVerificado, sucursalId: sucursal.id })
    })
    const result = await res.json()
    setCargando(false)

    if (!res.ok) { mostrarMensaje(`❌ ${result.error || 'Error al acreditar'}`, 'error'); return }

    const clienteActualizado = { ...clienteSeleccionado, puntos: result.nuevosPuntos, puntos_historicos: result.nuevosHistoricos }
    setClienteSeleccionado(clienteActualizado)
    setClientes(prev => prev.map(c => c.id === clienteSeleccionado.id ? clienteActualizado : c))
    setMonto('')
    mostrarMensaje(`✅ +${result.pts} puntos a ${clienteSeleccionado.nombre.split(' ')[0]}`, 'success')
    if (busqueda.length >= 2) buscarCliente(busqueda)
    if (clienteSeleccionado.telefono) {
      // Solo emojis del plano básico (✨): los de 4 bytes se rompen en WhatsApp Desktop vía wa.me
      const texto = `¡Hola ${clienteSeleccionado.nombre.split(' ')[0]}! Sumaste ${result.pts} puntos en ${negocio.nombre} ✨ Ya tenés ${result.nuevosPuntos} pts. Mirá tu tarjeta: https://www.fielty.app/tarjeta/${clienteSeleccionado.id}`
      setAvisoWa(linkWhatsApp(clienteSeleccionado.telefono, texto))
    }
  }

  async function validarCanje() {
    if (codigo.length < 7) { mostrarMensaje('⚠️ Ingresá el código completo', 'error'); return }
    setCargando(true)
    setCanjeResult(null)
    try {
      const res = await fetch('/api/caja/validar-canje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId: negocio.id, sucursalId: sucursal.id, pin: pinVerificado, codigo }),
      })
      const data = await res.json()
      setCargando(false)
      if (!res.ok) {
        mostrarMensaje(`${data.expirado ? '⏱️' : '❌'} ${data.error || 'Código inválido o ya usado'}`, 'error')
        setCodigo('')
        return
      }
      setCanjeResult(data.canje)
    } catch {
      setCargando(false)
      mostrarMensaje('❌ Error de conexión', 'error')
    }
  }

  async function confirmarCanje() {
    if (!canjeResult) return
    setCargando(true)
    try {
      const res = await fetch('/api/caja/confirmar-canje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId: negocio.id, sucursalId: sucursal.id, pin: pinVerificado, canjeId: canjeResult.id }),
      })
      const data = await res.json()
      setCargando(false)
      if (!res.ok) { mostrarMensaje(`❌ ${data.error || 'Error al confirmar'}`, 'error'); setCanjeResult(null); setCodigo(''); return }
      setCanjeResult(null)
      setCodigo('')
      mostrarMensaje(`✅ Canje confirmado: ${canjeResult.recompensas.nombre}`, 'success')
    } catch {
      setCargando(false)
      mostrarMensaje('❌ Error de conexión', 'error')
    }
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  const pesosPorPunto = negocio?.pesos_por_punto || 100
  const puntosPorTramo = negocio?.puntos_por_tramo || 1
  const ptsPreview = Math.round((parseInt(monto) || 0) / pesosPorPunto * puntosPorTramo)

  const getNivel = (pts) => {
    if (pts >= 5000) return { nombre:'Oro', emoji:'🥇' }
    if (pts >= 1000) return { nombre:'Plata', emoji:'🥈' }
    return { nombre:'Bronce', emoji:'🥉' }
  }

  function abrirRegModal() {
    setRegNombre(''); setRegDni(''); setRegEmail(''); setRegTelefono(''); setRegMonto(''); setRegError('')
    setRegModal(true)
  }

  async function registrarCliente() {
    if (!regNombre.trim()) { setRegError('Ingresá el nombre'); return }
    if (!regDni.trim()) { setRegError('Ingresá el DNI'); return }
    setRegError('')
    setRegCargando(true)
    const res = await fetch('/api/caja/registrar-cliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negocioId: negocio.id, sucursalId: sucursal.id, nombre: regNombre.trim(), dni: regDni.trim(), email: regEmail.trim() || null, telefono: regTelefono.trim() || null, monto: regMonto ? parseInt(regMonto) : null, pin: pinVerificado }),
    })
    const data = await res.json()
    setRegCargando(false)
    if (!res.ok) { setRegError(data.error || 'Error al registrar'); return }
    setRegModal(false)
    const partes = [`✅ ${data.cliente.nombre} registrado`]
    if (data.puntosBienvenida) partes.push(`${data.puntosBienvenida} pts bienvenida`)
    if (data.ptsConsumo) partes.push(`+${data.ptsConsumo} pts consumo`)
    mostrarMensaje(partes.join(' · '), 'success')
    seleccionarCliente({ ...data.cliente, negocio: { pesos_por_punto: negocio.pesos_por_punto, puntos_por_tramo: negocio.puntos_por_tramo, color: negocio.color, nombre: negocio.nombre } })
  }

  async function abrirQrModal() {
    if (!qrDataUrl) {
      const url = `${window.location.origin}/mi-tarjeta`
      const data = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0e0e0e', light: '#ffffff' } })
      setQrDataUrl(data)
    }
    setQrModal(true)
  }

  if (isMobile === null || !negocio || !sucursal) return <div style={{minHeight:'100vh', background:'#0e0e0e'}} />

  // ===== PIN =====
  if (pantalla === 'pin') return (
    <div style={{minHeight:'100vh', background:'#0e0e0e', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:24, padding:32}}>
        <div style={{width:56, height:56, borderRadius:16, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900}}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
        <div style={{fontSize:26, fontWeight:800}}>{negocio.nombre}</div>
        <div style={{fontSize:14, color:'#666', marginTop:-16}}>📍 {sucursal.nombre}</div>
        <input
          type="password"
          placeholder="PIN de caja"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ingresarPin()}
          autoFocus
          style={{width:'100%', padding:'16px 20px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:16, color:'white', fontSize:18, fontFamily:'monospace', outline:'none', textAlign:'center', boxSizing:'border-box', maxWidth:300}}
        />
        <button onClick={ingresarPin} style={{width:'100%', maxWidth:300, padding:18, background: negocio.color, border:'none', borderRadius:16, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
          Ingresar
        </button>
      </div>
    </div>
  )

  const regModalJsx = regModal && (
    <div onClick={() => setRegModal(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'flex-start', justifyContent:'center', zIndex:9999, padding:'20px 16px', overflowY:'auto'}}>
      <div onClick={e => e.stopPropagation()} style={{background:'#111', border:'1px solid #2a2a2a', borderRadius:24, padding:'28px 24px', maxWidth:360, width:'100%', marginTop:'auto', marginBottom:'auto'}}>
        <div style={{fontSize:17, fontWeight:800, color:'white', marginBottom:4}}>Registrar nuevo cliente</div>
        <div style={{fontSize:13, color:'#666', marginBottom:20}}>La contraseña inicial será su DNI.</div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:6}}>Nombre y apellido</div>
          <input style={{width:'100%', padding:'12px 14px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, color:'white', fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box'}}
            placeholder="Ej: María García" value={regNombre} onChange={e => setRegNombre(e.target.value)} autoFocus />
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:6}}>DNI</div>
          <input style={{width:'100%', padding:'12px 14px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, color:'white', fontSize:15, fontFamily:'monospace', outline:'none', boxSizing:'border-box'}}
            placeholder="Ej: 38452100" inputMode="numeric" value={regDni} onChange={e => setRegDni(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:6}}>Email <span style={{color:'#444', fontWeight:400, textTransform:'none'}}>(opcional)</span></div>
          <input style={{width:'100%', padding:'12px 14px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, color:'white', fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box'}}
            placeholder="cliente@email.com" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:6}}>Teléfono <span style={{color:'#444', fontWeight:400, textTransform:'none'}}>(opcional)</span></div>
          <input style={{width:'100%', padding:'12px 14px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, color:'white', fontSize:15, fontFamily:'monospace', outline:'none', boxSizing:'border-box'}}
            placeholder="Ej: 1134567890" inputMode="numeric" value={regTelefono} onChange={e => setRegTelefono(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:6}}>Consumo de hoy <span style={{color:'#444', fontWeight:400, textTransform:'none'}}>(opcional)</span></div>
          <div style={{display:'flex', alignItems:'center', gap:8, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:'12px 14px'}}>
            <span style={{color:'#555'}}>$</span>
            <input style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:15, fontFamily:'monospace'}}
              placeholder="0" inputMode="numeric" value={regMonto ? Number(regMonto).toLocaleString('es-AR') : ''} onChange={e => setRegMonto(e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>

        {regError && <div style={{background:'rgba(224,0,27,0.12)', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12}}>{regError}</div>}

        <div style={{display:'flex', gap:10}}>
          <button onClick={() => setRegModal(false)} style={{flex:1, padding:14, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, color:'#666', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
            Cancelar
          </button>
          <button onClick={registrarCliente} disabled={regCargando} style={{flex:2, padding:14, background: negocio.color, border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}>
            {regCargando ? 'Registrando...' : 'Registrar cliente'}
          </button>
        </div>
      </div>
    </div>
  )

  const qrModalJsx = qrModal && (
    <div onClick={() => setQrModal(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:24}}>
      <div onClick={e => e.stopPropagation()} style={{background:'white', borderRadius:24, padding:'32px 28px', maxWidth:340, width:'100%', textAlign:'center'}}>
        <div style={{fontSize:18, fontWeight:800, color:'#0e0e0e', marginBottom:4}}>Tarjeta de clientes</div>
        <div style={{fontSize:13, color:'#888', marginBottom:24, lineHeight:1.5}}>Mostrá este QR al cliente para que acceda a su tarjeta de puntos</div>
        {qrDataUrl && <img src={qrDataUrl} style={{width:220, height:220}} alt="QR mi tarjeta" />}
        <div style={{fontSize:12, color:'#bbb', marginTop:12, marginBottom:20, fontFamily:'monospace'}}>{typeof window !== 'undefined' ? window.location.origin : ''}/mi-tarjeta</div>
        <button onClick={() => setQrModal(false)} style={{padding:'12px 32px', background:'#0e0e0e', border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Cerrar</button>
      </div>
    </div>
  )

  // ===== DESKTOP =====
  if (!isMobile) return (
    <div style={{minHeight:'100vh', background:'#0e0e0e', color:'white', display:'flex', flexDirection:'column'}}>
      {regModalJsx}
      {qrModalJsx}
      {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 28px', borderBottom:'1px solid #1e1e1e'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 8px #e0001b'}}/>
          <span style={{fontSize:16, fontWeight:800, letterSpacing:-0.5}}>fielty</span>
          <span style={{color:'#333'}}>·</span>
          <div style={{width:28, height:28, borderRadius:8, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900}}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
          <span style={{fontSize:15, fontWeight:700}}>{negocio.nombre}</span>
          <span style={{background:'#1a1a1a', color:'#555', fontSize:11, padding:'3px 10px', borderRadius:100, border:'1px solid #2a2a2a'}}>📍 {sucursal.nombre}</span>
        </div>
        <button style={{padding:'8px 16px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, color:'#666', cursor:'pointer', fontSize:13, fontFamily:'inherit'}}
          onClick={() => { setPantalla('pin'); setPin('') }}>🔒 Bloquear</button>
      </div>

      <div style={{display:'flex', flex:1, overflow:'hidden'}}>
        {/* PANEL IZQUIERDO */}
        <div style={{width:380, borderRight:'1px solid #1e1e1e', display:'flex', flexDirection:'column', background:'#0a0a0a'}}>
          <div style={{padding:'20px 20px 12px'}}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#444', marginBottom:10}}>Buscar cliente</div>
            <div style={{display:'flex', alignItems:'center', gap:10, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, padding:'12px 16px'}}>
              <span style={{color:'#444'}}>🔍</span>
              <input style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:15, fontFamily:'inherit'}}
                placeholder="Nombre o DNI..." value={busqueda}
                onChange={e => buscarCliente(e.target.value)} autoComplete="off" autoFocus />
            </div>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:'0 12px'}}>
            {clientes.map(c => {
              const nivel = getNivel(c.puntos_historicos || 0)
              const seleccionado = clienteSeleccionado?.id === c.id
              return (
                <div key={c.id} onClick={() => seleccionarCliente(c)} style={{display:'flex', alignItems:'center', gap:12, padding:'14px 12px', borderRadius:14, cursor:'pointer', marginBottom:4, background: seleccionado ? '#1e1e1e' : 'transparent', border: seleccionado ? `1px solid ${negocio.color}33` : '1px solid transparent'}}>
                  <div style={{width:44, height:44, borderRadius:12, background: seleccionado ? negocio.color : '#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, flexShrink:0}}>{c.nombre.slice(0,2).toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15, fontWeight:700}}>{c.nombre}</div>
                    <div style={{fontSize:12, color:'#555', marginTop:2}}>DNI {c.dni} · {nivel.emoji} {nivel.nombre}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{c.puntos}</div>
                    <div style={{fontSize:10, color:'#444'}}>pts</div>
                  </div>
                </div>
              )
            })}
            {busqueda.length < 2 && clientes.length === 0 && (
              <div style={{padding:'32px 12px', textAlign:'center', color:'#333', fontSize:13}}>Escribí el nombre o DNI del cliente</div>
            )}
          </div>
          <div style={{padding:16, borderTop:'1px solid #1e1e1e', display:'flex', flexDirection:'column', gap:8}}>
            <button style={{width:'100%', padding:14, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}
              onClick={() => { setClienteSeleccionado(null); setTabDesktop('canje') }}>
              🎁 Validar canje de recompensa
            </button>
            <button style={{width:'100%', padding:14, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'#aaa', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}
              onClick={abrirQrModal}>
              📱 Mostrar QR al cliente
            </button>
            <button style={{width:'100%', padding:14, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'#aaa', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}
              onClick={abrirRegModal}>
              ➕ Registrar cliente nuevo
            </button>
          </div>
        </div>

                {/* PANEL DERECHO */}
        <div style={{flex:1, padding:32, overflowY:'auto', height:'calc(100vh - 65px)'}}>
          {!clienteSeleccionado && tabDesktop !== 'canje' && (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, color:'#333', fontSize:15}}>
              ← Seleccioná un cliente para acreditar puntos
            </div>
          )}

          {tabDesktop === 'canje' && !clienteSeleccionado && (
            <div style={{maxWidth:520}}>
              <div style={{fontSize:20, fontWeight:800, marginBottom:24}}>🎁 Validar canje</div>
              <ValidarCanjePanel negocio={negocio} codigo={codigo} setCodigo={setCodigo} canjeResult={canjeResult} validarCanje={validarCanje} confirmarCanje={confirmarCanje} cargando={cargando} />
            </div>
          )}

          {clienteSeleccionado && (() => {
            const nivel = getNivel(clienteSeleccionado.puntos_historicos || 0)
            return (
              <div style={{maxWidth:520}}>
                <div style={{background:'#1a1a1a', borderRadius:20, padding:24, marginBottom:24, border:'1px solid #2a2a2a'}}>
                  <div style={{display:'flex', alignItems:'center', gap:16}}>
                    <div style={{width:56, height:56, borderRadius:16, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900}}>{clienteSeleccionado.nombre.slice(0,2).toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:20, fontWeight:800}}>{clienteSeleccionado.nombre}</div>
                      <div style={{fontSize:13, color:'#555', marginTop:2}}>DNI {clienteSeleccionado.dni} · {nivel.emoji} {nivel.nombre}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:36, fontWeight:900, color:'#f0a500', fontFamily:'monospace', lineHeight:1}}>{clienteSeleccionado.puntos}</div>
                      <div style={{fontSize:12, color:'#555'}}>puntos</div>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex', gap:8, marginBottom:24}}>
                  {[{id:'puntos', label:'⭐ Acreditar puntos'}, {id:'canje', label:'🎁 Validar canje'}].map(t => (
                    <button key={t.id} onClick={() => setTabDesktop(t.id)} style={{padding:'10px 20px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700, background: tabDesktop === t.id ? negocio.color : '#1a1a1a', color:'white'}}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {tabDesktop === 'puntos' && (
                  <>
                    <div style={{background:'#1a1a1a', border:'2px solid #2a2a2a', borderRadius:20, padding:'20px 24px', marginBottom:16, display:'flex', alignItems:'center', gap:12}}>
                      <span style={{fontSize:28, color:'#444', fontWeight:300}}>$</span>
                      <input style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:48, fontWeight:500, fontFamily:'monospace', minWidth:0}}
                        type="text" inputMode="numeric" placeholder="0"
                        value={monto ? Number(monto).toLocaleString('es-AR') : ''}
                        onChange={e => setMonto(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={e => e.key === 'Enter' && acreditarPuntos()} autoFocus />
                      <div style={{textAlign:'right', minWidth:80}}>
                        <div style={{fontSize:28, fontWeight:800, color:'#00b96b', fontFamily:'monospace'}}>+{ptsPreview}</div>
                        <div style={{fontSize:11, color:'#555'}}>puntos</div>
                      </div>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:20}}>
                      {[500,1000,2000,5000,10000,20000].map(v => (
                        <button key={v} onClick={() => setMonto(String(v))}
                          style={{padding:'12px 8px', borderRadius:12, borderWidth:1, borderStyle:'solid', borderColor: monto==v ? negocio.color : '#2a2a2a', background: monto==v ? `${negocio.color}22` : '#1a1a1a', color: monto==v ? negocio.color : 'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
                          ${v >= 1000 ? (v/1000)+'k' : v}
                        </button>
                      ))}
                    </div>
                    <button style={{width:'100%', padding:20, background: negocio.color, border:'none', borderRadius:16, color:'white', fontSize:18, fontWeight:800, cursor:'pointer', fontFamily:'inherit', opacity: !monto || parseInt(monto)<100 ? 0.4 : 1}}
                      onClick={acreditarPuntos} disabled={cargando || !monto || parseInt(monto)<100}>
                      {cargando ? 'Acreditando...' : `Sumar ${ptsPreview} puntos a ${clienteSeleccionado.nombre.split(' ')[0]}`}
                    </button>
                    {avisoWa && (
                      <a href={avisoWa} target="_blank" rel="noreferrer" onClick={() => setAvisoWa(null)}
                        style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:16, background:'#00a884', borderRadius:16, color:'white', fontSize:15, fontWeight:800, textDecoration:'none', marginTop:12, boxSizing:'border-box'}}>
                        📲 Avisarle por WhatsApp
                      </a>
                    )}
                  </>
                )}
                {tabDesktop === 'canje' && (
                  <ValidarCanjePanel negocio={negocio} codigo={codigo} setCodigo={setCodigo} canjeResult={canjeResult} validarCanje={validarCanje} confirmarCanje={confirmarCanje} cargando={cargando} />
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
  // ===== MOBILE =====
  if (pantalla === 'buscar') return (
    <div style={s.mobileWrap}>
      {regModalJsx}
      {qrModalJsx}
      {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}
      <div style={s.mobileTopbar}>
        <div style={{display:'flex', alignItems:'center', gap:10, flex:1}}>
          <div style={{width:32, height:32, borderRadius:9, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900}}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
          <div>
            <div style={{fontSize:15, fontWeight:700}}>Caja · {sucursal.nombre}</div>
            <div style={{fontSize:11, color:'#666'}}>👤 Staff</div>
          </div>
        </div>
        <button style={s.lockBtnMobile} onClick={() => { setPantalla('pin'); setPin('') }}>🔒</button>
      </div>
      <div style={{padding:20}}>
        <div style={s.mobileLabel}>Buscar cliente</div>
        <div style={{display:'flex', alignItems:'center', gap:10, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:16, padding:'14px 16px', marginBottom:12}}>
          <span>🔍</span>
          <input style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:16, fontFamily:'inherit'}}
            placeholder="Nombre o DNI..." value={busqueda} onChange={e => buscarCliente(e.target.value)} autoComplete="off" />
        </div>
        {clientes.length > 0 && (
          <div style={{background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:16, overflow:'hidden'}}>
            {clientes.map(c => {
              const nivel = getNivel(c.puntos_historicos || 0)
              return (
                <div key={c.id} style={{display:'flex', alignItems:'center', gap:12, padding:16, borderBottom:'1px solid #222', cursor:'pointer'}} onClick={() => seleccionarCliente(c)}>
                  <div style={{width:42, height:42, borderRadius:12, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, flexShrink:0}}>{c.nombre.slice(0,2).toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15, fontWeight:700}}>{c.nombre}</div>
                    <div style={{fontSize:12, color:'#666'}}>DNI {c.dni} · {nivel.emoji} {nivel.nombre}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{c.puntos}</div>
                    <div style={{fontSize:10, color:'#666'}}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {busqueda.length < 2 && (
          <div style={{marginTop:24}}>
            <div style={s.mobileLabel}>Accesos rápidos</div>
            <button style={{width:'100%', padding:16, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textAlign:'left', marginBottom:10}}
              onClick={() => setPantalla('validar')}>🎁 Validar canje de recompensa</button>
            <button style={{width:'100%', padding:16, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'#aaa', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textAlign:'left', marginBottom:10}}
              onClick={abrirRegModal}>➕ Registrar cliente nuevo</button>
            <button style={{width:'100%', padding:16, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'#aaa', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between'}}
              onClick={abrirQrModal}>
              <span>❓ ¿El cliente no sabe cómo ver su tarjeta?</span>
              <span style={{fontSize:18, color:'#555'}}>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (pantalla === 'cliente') {
    const nivel = getNivel(clienteSeleccionado?.puntos_historicos || 0)
    return (
      <div style={s.mobileWrap}>
        {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}
        <div style={s.mobileTopbar}>
          <button style={s.backBtnMobile} onClick={() => setPantalla('buscar')}>←</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15, fontWeight:700}}>{clienteSeleccionado?.nombre}</div>
            <div style={{fontSize:11, color:'#666'}}>DNI {clienteSeleccionado?.dni} · {nivel.emoji} {nivel.nombre}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:24, fontWeight:800, color:'#f0a500', fontFamily:'monospace'}}>{clienteSeleccionado?.puntos}</div>
            <div style={{fontSize:10, color:'#666'}}>puntos</div>
          </div>
        </div>
        <div style={{padding:20}}>
          <div style={s.mobileLabel}>Acreditar puntos</div>
          <div style={{display:'flex', alignItems:'center', gap:12, background:'#1a1a1a', border:'2px solid #2a2a2a', borderRadius:20, padding:'18px 20px', marginBottom:14}}>
            <span style={{fontSize:24, color:'#666', fontWeight:300}}>$</span>
            <input style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:36, fontWeight:500, fontFamily:'monospace', minWidth:0}}
              type="text" inputMode="numeric" placeholder="0"
              value={monto ? Number(monto).toLocaleString('es-AR') : ''}
              onChange={e => setMonto(e.target.value.replace(/\D/g, ''))} />
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#00b96b', fontFamily:'monospace'}}>+{ptsPreview}</div>
              <div style={{fontSize:10, color:'#666'}}>puntos</div>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16}}>
            {[500,1000,2000,5000].map(v => (
              <button key={v} onClick={() => setMonto(String(v))}
                style={{padding:12, borderRadius:12, borderWidth:1, borderStyle:'solid', borderColor: monto==v ? negocio.color : '#2a2a2a', background: monto==v ? `${negocio.color}22` : '#1a1a1a', color: monto==v ? negocio.color : 'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>
                ${v.toLocaleString()}
              </button>
            ))}
          </div>
          <button style={{width:'100%', padding:18, background: negocio.color, border:'none', borderRadius:16, color:'white', fontSize:17, fontWeight:800, cursor:'pointer', fontFamily:'inherit', opacity: !monto || parseInt(monto)<100 ? 0.4 : 1}}
            onClick={acreditarPuntos} disabled={cargando || !monto || parseInt(monto)<100}>
            {cargando ? 'Acreditando...' : 'Sumar puntos al cliente'}
          </button>
          {avisoWa && (
            <a href={avisoWa} target="_blank" rel="noreferrer" onClick={() => setAvisoWa(null)}
              style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:16, background:'#00a884', borderRadius:14, color:'white', fontSize:15, fontWeight:800, textDecoration:'none', marginTop:10, boxSizing:'border-box'}}>
              📲 Avisarle por WhatsApp
            </a>
          )}
          <button style={{width:'100%', padding:16, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginTop:10}}
            onClick={() => setPantalla('validar')}>🎁 Validar canje de recompensa</button>
        </div>
      </div>
    )
  }

  if (pantalla === 'validar') return (
    <div style={s.mobileWrap}>
      {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}
      <div style={s.mobileTopbar}>
        <button style={s.backBtnMobile} onClick={() => { setPantalla('buscar'); setCanjeResult(null); setCodigo('') }}>←</button>
        <div style={{fontSize:15, fontWeight:700}}>Validar canje — {sucursal.nombre}</div>
      </div>
      <div style={{padding:20}}>
        <ValidarCanjePanel negocio={negocio} codigo={codigo} setCodigo={setCodigo} canjeResult={canjeResult} validarCanje={validarCanje} confirmarCanje={confirmarCanje} cargando={cargando} />
      </div>
    </div>
  )
}

function ValidarCanjePanel({ negocio, codigo, setCodigo, canjeResult, validarCanje, confirmarCanje, cargando }) {
  return (
    <>
      <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#666', marginBottom:12}}>Código del cliente</div>
      <div style={{display:'flex', gap:10, marginBottom:20}}>
        <input style={{flex:1, background:'#1a1a1a', border:'2px solid #2a2a2a', borderRadius:14, padding:'16px 18px', color:'white', fontSize:22, fontWeight:500, fontFamily:'monospace', letterSpacing:4, textAlign:'center', outline:'none'}}
          placeholder="XK4-92B" value={codigo} maxLength={7}
          onChange={e => {
            let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
            if (v.length > 3) v = v.slice(0,3) + '-' + v.slice(3,6)
            setCodigo(v)
          }}
          onKeyDown={e => e.key === 'Enter' && validarCanje()} />
        <button style={{padding:'16px 20px', background: negocio.color, border:'none', borderRadius:14, color:'white', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit'}}
          onClick={validarCanje} disabled={cargando}>
          {cargando ? '...' : 'Validar'}
        </button>
      </div>
      {canjeResult && (
        <div style={{background:'rgba(0,185,107,0.08)', border:'1px solid rgba(0,185,107,0.3)', borderRadius:20, padding:28, textAlign:'center'}}>
          <div style={{fontSize:36, marginBottom:12}}>🎁</div>
          <div style={{fontSize:11, color:'#00b96b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4}}>Canje válido</div>
          <div style={{fontSize:20, fontWeight:800, marginBottom:4}}>{canjeResult.recompensas.nombre}</div>
          <div style={{fontSize:14, color:'#888', marginBottom:24}}>Cliente: {canjeResult.clientes.nombre} · {canjeResult.recompensas.puntos_necesarios} pts</div>
          <button style={{width:'100%', padding:18, background:'#00b96b', border:'none', borderRadius:14, color:'white', fontSize:17, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 24px rgba(0,185,107,0.3)'}}
            onClick={confirmarCanje} disabled={cargando}>
            {cargando ? 'Confirmando...' : '✓ Confirmar canje'}
          </button>
        </div>
      )}
    </>
  )
}

const s = {
  toast: (tipo) => ({ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', color:'white', padding:'12px 24px', borderRadius:100, fontSize:14, fontWeight:600, zIndex:9999, whiteSpace:'nowrap', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', background: tipo==='error' ? '#e0001b' : '#00b96b' }),
  mobileWrap: { minHeight:'100vh', background:'#0e0e0e', color:'white', width:'100%', maxWidth:420, margin:'0 auto', position:'relative' },
  mobileTopbar: { display:'flex', alignItems:'center', gap:12, padding:'20px 20px 16px', borderBottom:'1px solid #1e1e1e' },
  mobileLabel: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#666', marginBottom:12 },
  lockBtnMobile: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, padding:'8px 12px', color:'white', cursor:'pointer', fontSize:16 },
  backBtnMobile: { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, width:36, height:36, color:'white', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' },
}