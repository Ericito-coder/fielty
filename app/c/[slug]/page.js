'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CajaSlug({ params }) {
  const [slug, setSlug] = useState(null)
  const [negocio, setNegocio] = useState(null)
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

  useEffect(() => {
    params.then(p => setSlug(p.slug))
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [params])

  useEffect(() => {
    if (!slug) return
    supabase.from('negocios').select('*').eq('slug', slug).single()
      .then(({ data }) => setNegocio(data))
  }, [slug])

  function presionarPin(d) {
    if (pin.length >= 4) return
    const nuevo = pin + d
    setPin(nuevo)
    if (nuevo.length === 4) {
      setTimeout(() => {
        if (nuevo === (negocio?.pin_caja || '1234')) { setPantalla('buscar'); setPin('') }
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
      .eq('negocio_id', negocio.id)
      .or(`nombre.ilike.%${valor}%,dni.ilike.%${valor}%`)
      .limit(8)
    setClientes(data || [])
  }

  function seleccionarCliente(c) {
    setClienteSeleccionado(c)
    setMonto('')
    setCodigo('')
    setCanjeResult(null)
    setTabDesktop('puntos')
    if (isMobile) setPantalla('cliente')
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
    await supabase.from('clientes').update({
      puntos: nuevosPuntos, puntos_historicos: nuevosHistoricos,
      visitas: clienteSeleccionado.visitas + 1, ultima_visita: new Date().toISOString()
    }).eq('id', clienteSeleccionado.id)
    await supabase.from('transacciones').insert([{
      cliente_id: clienteSeleccionado.id, negocio_id: negocio.id,
      tipo: 'suma', puntos: pts, descripcion: `Compra $${valor.toLocaleString()}`
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
    const { data: canje } = await supabase
      .from('canjes')
      .select('*, clientes(id, nombre, puntos), recompensas(nombre, puntos_necesarios)')
      .eq('codigo', codigo.toUpperCase()).eq('negocio_id', negocio.id).eq('estado', 'pendiente').single()
    setCargando(false)
    if (!canje) { mostrarMensaje('❌ Código inválido o ya usado', 'error'); setCodigo(''); return }
    if (new Date() > new Date(canje.expira_at)) {
      await supabase.from('canjes').update({ estado: 'expirado' }).eq('id', canje.id)
      const { data: ca } = await supabase.from('clientes').select('puntos').eq('id', canje.clientes.id).single()
      await supabase.from('clientes').update({ puntos: (ca?.puntos || 0) + canje.puntos_descontados }).eq('id', canje.clientes.id)
      mostrarMensaje(`⏱️ Código expirado — se devolvieron ${canje.puntos_descontados} pts`, 'error')
      setCodigo(''); return
    }
    setCanjeResult(canje)
  }

  async function confirmarCanje() {
    if (!canjeResult) return
    setCargando(true)
    await supabase.from('canjes').update({ estado: 'usado', usado_at: new Date().toISOString() }).eq('id', canjeResult.id)
    setCargando(false)
    setCanjeResult(null)
    setCodigo('')
    mostrarMensaje(`✅ Canje confirmado: ${canjeResult.recompensas.nombre}`, 'success')
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  const pesosPorPunto = clienteSeleccionado?.negocio?.pesos_por_punto || 100
  const puntosPorTramo = clienteSeleccionado?.negocio?.puntos_por_tramo || 1
  const ptsPreview = Math.floor((parseInt(monto) || 0) / pesosPorPunto) * puntosPorTramo

  const getNivel = (pts) => {
    if (pts >= 5000) return { nombre:'Oro', emoji:'🥇' }
    if (pts >= 1000) return { nombre:'Plata', emoji:'🥈' }
    return { nombre:'Bronce', emoji:'🥉' }
  }

  if (isMobile === null || !negocio) return <div style={{minHeight:'100vh', background:'#0e0e0e'}} />

  // ===== PIN (igual para todos) =====
  if (pantalla === 'pin') return (
    <div style={{minHeight:'100vh', background:'#0e0e0e', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
      {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:24, padding:32}}>
        <div style={{width:56, height:56, borderRadius:16, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900}}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
        <div style={{fontSize:26, fontWeight:800}}>{negocio.nombre}</div>
        <div style={{fontSize:14, color:'#666', marginTop:-16}}>Vista de caja · Staff</div>
        <div style={{display:'flex', gap:14}}>
          {[0,1,2,3].map(i => <div key={i} style={{width:16, height:16, borderRadius:'50%', background: i < pin.length ? negocio.color : '#2a2a2a', transition:'background 0.2s'}} />)}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, width: isMobile ? 280 : 320}}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => (
            <button key={i} style={{aspectRatio:1, borderRadius:20, border:'1px solid #2a2a2a', background:'#1a1a1a', color:'white', fontSize: isMobile ? 22 : 26, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity: n==='' ? 0 : 1}}
              onClick={() => n==='⌫' ? borrarPin() : n!=='' ? presionarPin(String(n)) : null}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ===== DESKTOP LAYOUT =====
  if (!isMobile) return (
    <div style={{minHeight:'100vh', background:'#0e0e0e', color:'white', display:'flex', flexDirection:'column'}}>
      {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}

      {/* TOPBAR */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 28px', borderBottom:'1px solid #1e1e1e', background:'#0e0e0e'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 8px #e0001b'}}/>
          <span style={{fontSize:16, fontWeight:800, color:'white', letterSpacing:-0.5}}>fielty</span>
          <span style={{color:'#333', fontSize:16}}>·</span>
          <div style={{width:28, height:28, borderRadius:8, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900}}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
          <span style={{fontSize:15, fontWeight:700}}>{negocio.nombre}</span>
          <span style={{background:'#1a1a1a', color:'#666', fontSize:11, padding:'3px 10px', borderRadius:100, border:'1px solid #2a2a2a'}}>Caja</span>
        </div>
        <button style={{padding:'8px 16px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, color:'#666', cursor:'pointer', fontSize:13, fontFamily:'inherit'}}
          onClick={() => { setPantalla('pin'); setPin('') }}>🔒 Bloquear</button>
      </div>

      {/* BODY */}
      <div style={{display:'flex', flex:1, overflow:'hidden'}}>

        {/* PANEL IZQUIERDO — búsqueda */}
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
              <div style={{padding:'32px 12px', textAlign:'center', color:'#333', fontSize:13}}>
                Escribí el nombre o DNI del cliente
              </div>
            )}
          </div>

          {/* Botón validar canje */}
          <div style={{padding:16, borderTop:'1px solid #1e1e1e'}}>
            <button style={{width:'100%', padding:14, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}
              onClick={() => { setClienteSeleccionado(null); setTabDesktop('canje') }}>
              🎁 Validar canje de recompensa
            </button>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{flex:1, padding:32, overflowY:'auto'}}>
          {!clienteSeleccionado && tabDesktop !== 'canje' && (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#333', fontSize:15}}>
              ← Seleccioná un cliente para acreditar puntos
            </div>
          )}

          {clienteSeleccionado && tabDesktop !== 'canje' && (() => {
            const nivel = getNivel(clienteSeleccionado.puntos_historicos || 0)
            return (
              <div style={{maxWidth:520}}>
                {/* Cliente info */}
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

                {/* Tabs */}
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
                        type="number" inputMode="numeric" placeholder="0" value={monto}
                        onChange={e => setMonto(e.target.value)}
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
                  </>
                )}

                {tabDesktop === 'canje' && <ValidarCanjePanel negocio={negocio} codigo={codigo} setCodigo={setCodigo} canjeResult={canjeResult} validarCanje={validarCanje} confirmarCanje={confirmarCanje} cargando={cargando} />}
              </div>
            )
          })()}

          {tabDesktop === 'canje' && !clienteSeleccionado && (
            <div style={{maxWidth:520}}>
              <div style={{fontSize:20, fontWeight:800, marginBottom:24}}>🎁 Validar canje</div>
              <ValidarCanjePanel negocio={negocio} codigo={codigo} setCodigo={setCodigo} canjeResult={canjeResult} validarCanje={validarCanje} confirmarCanje={confirmarCanje} cargando={cargando} />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ===== MOBILE LAYOUT =====
  if (pantalla === 'buscar') return (
    <div style={s.mobileWrap}>
      {mensaje && <div style={s.toast(mensaje.tipo)}>{mensaje.texto}</div>}
      <div style={s.mobileTopbar}>
        <div style={{display:'flex', alignItems:'center', gap:10, flex:1}}>
          <div style={{width:32, height:32, borderRadius:9, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900}}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
          <div>
            <div style={{fontSize:15, fontWeight:700}}>Caja · {negocio.nombre}</div>
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
            <button style={{width:'100%', padding:16, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textAlign:'left'}}
              onClick={() => setPantalla('validar')}>🎁 Validar canje de recompensa</button>
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
              type="number" inputMode="numeric" placeholder="0" value={monto} onChange={e => setMonto(e.target.value)} />
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
        <div style={{fontSize:15, fontWeight:700}}>Validar canje</div>
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