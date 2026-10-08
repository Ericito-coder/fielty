'use client'
import { theme } from '@/lib/theme'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import { medirConversion } from '@/lib/medicion'
import { linkWhatsApp } from '@/lib/wa'
import { prepararPrimerosClientes } from '@/lib/clientes'
import BotonCopiar from '@/components/BotonCopiar'

// Última pantalla del alta. Antes decía "¡Todo listo!" y mostraba el link y
// el QR; ahora lo primero que pide es cargar a dos clientes conocidos y
// mandarles la tarjeta por WhatsApp.
//
// El motivo: el día del alta decide casi todo. De los negocios que ese día
// cargaron dos clientes o más siguió usando Fielty la mitad (16 de 31); de
// los que cargaron uno solo, que casi siempre es el dueño probándose a sí
// mismo, 10 de 39; y de los que no cargaron ninguno, 2 de 33 (base al
// 07/10/2026). Por eso la prueba con uno mismo dejó de ser el camino
// sugerido: lo que cambia el resultado es salir de acá con clientes de
// verdad.
//
// Lo demás (el cartel con el QR, la caja, el link) aparece recién después,
// como lo que sigue, para que en la primera vista haya una sola cosa para
// hacer.
export default function Listo() {
  const [negocio, setNegocio] = useState(null)
  const [sinNegocio, setSinNegocio] = useState(false)
  const [planPago, setPlanPago] = useState(false)
  const [filas, setFilas] = useState([{ nombre: '', telefono: '' }, { nombre: '', telefono: '' }])
  const [cargados, setCargados] = useState([])
  const [enviados, setEnviados] = useState({})
  const [saltado, setSaltado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Onboarding terminado: cuenta + negocio + recompensa cargada. Es la
  // conversión principal (evento clave en GA, la que optimizan Meta y
  // Google Ads), así que va una sola vez por dueño y no en cada F5.
  useEffect(() => {
    medirConversion('alta', { unaVezPorClave: 'fielty_conv_alta' })
  }, [])

  useEffect(() => {
    const plan = storage.get('fielty_plan')
    setPlanPago(!!plan && plan !== 'gratis')

    const id = storage.get('fielty_negocio_id')
    if (!id) { setSinNegocio(true); return }

    async function cargar() {
      try {
        const { data } = await supabase.from('negocios').select('*').eq('id', id).single()
        if (!data) { setSinNegocio(true); return }

        // Si el dueño recarga la página o vuelve más tarde, los clientes
        // que ya cargó tienen que seguir ahí con su botón de WhatsApp, en
        // vez de ofrecerle el formulario vacío otra vez.
        const { data: previos } = await supabase
          .from('clientes')
          .select('id, nombre, telefono, puntos')
          .eq('negocio_id', data.id)
          .not('telefono', 'is', null)
          .order('created_at', { ascending: true })
          .limit(5)
        if (previos?.length) setCargados(previos)
        setNegocio(data)

        if (!storage.get('fielty_bienvenida_enviada')) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            fetch('/api/bienvenida', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ negocioId: data.id }),
            }).catch(() => {})
            storage.set('fielty_bienvenida_enviada', '1')
          }
        }
      } catch {
        setSinNegocio(true)
      }
    }
    cargar()
  }, [])

  // El que eligió un plan pago en la landing sigue de largo hacia el
  // checkout: cargar clientes lo hace después, ya con el plan activo.
  useEffect(() => {
    if (!negocio || !planPago) return
    const t = setTimeout(() => { window.location.href = '/dashboard/upgrade' }, 1800)
    return () => clearTimeout(t)
  }, [negocio, planPago])

  function actualizarFila(i, campo, valor) {
    setFilas(filas.map((f, idx) => idx === i ? { ...f, [campo]: valor } : f))
  }

  async function crearTarjetas() {
    const { clientes, error: invalido } = prepararPrimerosClientes(filas)
    if (invalido) { setError(invalido); return }
    setError('')
    setCargando(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/onboarding/primeros-clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ negocioId: negocio.id, clientes }),
      })
      const data = await res.json()
      if (res.status === 401) { setError('Se venció tu sesión. Entrá de nuevo desde el panel y cargalos desde ahí.'); return }
      if (!res.ok) { setError(data.error || 'Hubo un error, intentá de nuevo'); return }
      setCargados(data.clientes)
    } catch {
      setError('Error de conexión. Revisá tu internet e intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  // El mensaje sale del WhatsApp del dueño, así que está escrito como lo
  // diría él y no como un aviso de Fielty. Sin emojis: WhatsApp Desktop
  // los rompe cuando van por link wa.me y llegan como "?".
  function linkTarjeta(cliente) {
    const regalo = cliente.puntos > 0 ? ` Ya tenés ${cliente.puntos} puntos de regalo.` : ''
    const texto = `Hola ${cliente.nombre.split(' ')[0]}! Te sumé al programa de puntos de ${negocio.nombre}.${regalo} Esta es tu tarjeta: ${window.location.origin}/tarjeta/${cliente.id}`
    return linkWhatsApp(cliente.telefono, texto)
  }

  if (sinNegocio) return (
    <div style={s.wrap}>
      <main style={s.card}>
        <Logo />
        <h1 style={s.title}>No encontramos tu negocio</h1>
        <p style={s.sub}>Puede que hayas abierto esta página en otro navegador. Entrá al panel y seguí desde ahí.</p>
        <button style={s.btn} onClick={() => { window.location.href = '/dashboard' }}>Ir al panel →</button>
      </main>
    </div>
  )

  if (!negocio) return (
    <div style={s.wrap}>
      <div style={{color:theme.gray, fontSize:16}}>Cargando...</div>
    </div>
  )

  if (planPago) return (
    <div style={s.wrap}>
      <main style={s.card}>
        <Logo />
        <div style={s.celebracion}>🎉</div>
        <h1 style={s.title}>¡Todo listo,<br/>{negocio.nombre}!</h1>
        <p style={s.sub}>Tu programa de fidelización está activo. Te llevamos a completar el pago.</p>
        <button style={s.btn} onClick={() => { window.location.href = '/dashboard/upgrade' }}>Completar pago →</button>
      </main>
    </div>
  )

  const registroUrl = `${window.location.origin}/registro/${negocio.slug}`
  const puntosRegalo = negocio.puntos_bienvenida ?? 10

  // ===== Primera vista: una sola cosa para hacer =====
  if (!cargados.length && !saltado) return (
    <div style={s.wrap}>
      <main style={s.card}>
        <Logo />
        <div style={s.step}>Último paso</div>
        <h1 style={s.title}>Sumá tus dos primeros clientes</h1>
        <p style={s.sub}>
          {negocio.nombre} ya está activo. Pensá en dos personas que te compran seguido.
          Les creamos la tarjeta{puntosRegalo > 0 ? ` con ${puntosRegalo} puntos de regalo` : ''} y
          se la mandás vos por WhatsApp.
        </p>

        {filas.map((f, i) => (
          <div key={i} style={s.fila}>
            <div style={s.campo}>
              <label style={s.label} htmlFor={`cliente-nombre-${i}`}>Nombre</label>
              <input id={`cliente-nombre-${i}`} style={s.input} placeholder={i === 0 ? 'Ej: Martina García' : 'Ej: Lucas Pérez'} autoComplete="off"
                value={f.nombre} onChange={e => actualizarFila(i, 'nombre', e.target.value)} />
            </div>
            <div style={s.campo}>
              <label style={s.label} htmlFor={`cliente-whatsapp-${i}`}>WhatsApp</label>
              <input id={`cliente-whatsapp-${i}`} style={s.input} type="tel" inputMode="tel" placeholder="11 5555-1234" autoComplete="off"
                value={f.telefono} onChange={e => actualizarFila(i, 'telefono', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && crearTarjetas()} />
            </div>
          </div>
        ))}

        {error && <div style={s.error} role="alert">{error}</div>}

        <button style={{...s.btn, marginTop:8}} onClick={crearTarjetas} disabled={cargando}>
          {cargando ? 'Creando sus tarjetas...' : 'Crear sus tarjetas →'}
        </button>
        <button style={s.ghost} onClick={() => setSaltado(true)} disabled={cargando}>Ahora no</button>
      </main>
    </div>
  )

  // ===== Segunda vista: mandar las tarjetas y lo que sigue =====
  const faltaEnviar = cargados.some(c => !enviados[c.id])

  return (
    <div style={s.wrap}>
      <main style={s.card}>
        <Logo />

        {cargados.length > 0 ? (
          <>
            <div style={s.celebracion}>🎉</div>
            <h1 style={s.title}>{cargados.length === 1 ? '¡Ya tenés tu primer cliente!' : '¡Ya tenés tus primeros clientes!'}</h1>
            <p style={s.sub}>
              {cargados.length === 1 ? 'Mandale su tarjeta' : 'Mandales su tarjeta'} por WhatsApp.
              El mensaje ya está escrito y sale desde tu número.
            </p>

            <div style={{marginBottom:24}}>
              {cargados.map(c => (
                <div key={c.id} style={s.clienteRow}>
                  <div style={s.clienteDatos}>
                    <div style={s.clienteNombre}>{c.nombre}</div>
                    <div style={s.clienteTel}>{enviados[c.id] ? '✓ WhatsApp abierto' : c.telefono}</div>
                  </div>
                  <a href={linkTarjeta(c)} target="_blank" rel="noreferrer"
                    onClick={() => setEnviados(prev => ({ ...prev, [c.id]: true }))}
                    style={enviados[c.id] ? s.waBtnHecho : s.waBtn}>
                    {enviados[c.id] ? 'Enviar de nuevo' : 'Enviar por WhatsApp'}
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={s.celebracion}>🎉</div>
            <h1 style={s.title}>¡Todo listo,<br/>{negocio.nombre}!</h1>
            <p style={s.sub}>Tu programa de fidelización está activo. Esto es lo que sigue para sumar clientes.</p>
          </>
        )}

        <div style={s.pasos}>
          <div style={s.pasosTitle}>{cargados.length > 0 ? 'Para el resto de tus clientes' : 'Lo que sigue'}</div>

          <a href={`/qr/${negocio.slug}`} target="_blank" rel="noreferrer" style={s.pasoBtn}>
            <span style={s.pasoNum}>1</span>
            <span style={s.pasoTexto}>Imprimí el cartel con el QR y dejalo donde te pagan</span>
            <span style={s.pasoFlecha}>→</span>
          </a>

          <a href={`/c/${negocio.slug}`} target="_blank" rel="noreferrer" style={s.pasoBtn}>
            <span style={s.pasoNum}>2</span>
            <span style={s.pasoTexto}>Cuando te compren, sumales puntos desde la caja</span>
            <span style={s.pasoFlecha}>→</span>
          </a>

          {/* El link va arriba del botón a propósito: si el navegador no
              deja copiar, BotonCopiar manda a copiarlo "de arriba". */}
          <div style={{...s.pasoBtn, display:'block', marginBottom:0}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <span style={s.pasoNum}>3</span>
              <span style={s.pasoTexto}>Pasá tu link de registro por WhatsApp o Instagram</span>
            </div>
            <div style={s.linkUrl}>{registroUrl}</div>
            <BotonCopiar texto={registroUrl} style={s.copiarBtn}
              onCopiado={() => storage.set('fielty_tutorial_link_copiado', '1')} />
          </div>

          <div style={s.pasosNota}>
            A la caja entrás con el PIN que acabás de elegir. Es la misma
            dirección que les vas a pasar a tus empleados.
          </div>
        </div>

        {/* Mientras falte mandar una tarjeta, el botón que tiene que
            llamar la atención es el de WhatsApp y este baja el volumen. */}
        <button style={faltaEnviar ? s.btnNeutro : s.btn} onClick={() => { window.location.href = '/dashboard' }}>
          Ir al panel →
        </button>
        {!cargados.length && (
          <button style={s.ghost} onClick={() => setSaltado(false)}>Cargar a mis primeros clientes</button>
        )}
      </main>
    </div>
  )
}

function Logo() {
  return (
    <div style={s.logo}>
      <div style={s.logoDot}></div>
      <span style={s.logoText}>fielty</span>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:theme.black, display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:24 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:theme.red, boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:theme.black, letterSpacing:-0.5 },
  step: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:theme.red, marginBottom:8 },
  celebracion: { fontSize:52, marginBottom:16, textAlign:'center' },
  title: { fontSize:28, fontWeight:800, color:theme.black, marginBottom:8, lineHeight:1.2 },
  sub: { fontSize:14, color:theme.gray, marginBottom:24, lineHeight:1.6 },
  // Lado a lado en una pantalla ancha; en un celular cada campo queda en
  // 130px y no entra ni "11 5555-1234", así que con wrap se apilan. El
  // margen de abajo, más grande que el gap, es lo que separa un cliente
  // del otro cuando quedan los cuatro campos en columna.
  fila: { display:'flex', flexWrap:'wrap', gap:'10px 10px', marginBottom:20 },
  campo: { flex:'1 1 150px', minWidth:0 },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:theme.gray, marginBottom:8 },
  input: { width:'100%', padding:'14px 14px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  error: { background:theme.errorBg, color:theme.red, padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12, lineHeight:1.5 },
  // En un celular el nombre y el botón no entran en un renglón: el nombre
  // quedaba cortado en "Beto Prue…". Con wrap el botón baja y ocupa todo el
  // ancho; el 999 hace que, cuando sí entran juntos, el espacio que sobra
  // se lo lleve el nombre y no el botón.
  clienteRow: { display:'flex', flexWrap:'wrap', alignItems:'center', gap:'10px 12px', padding:'12px 0', borderBottom:'1px solid #f0f2f7' },
  clienteDatos: { flex:'999 1 150px', minWidth:0 },
  clienteNombre: { fontSize:15, fontWeight:700, color:theme.black, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  clienteTel: { fontSize:12, color:theme.gray, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  // Mismo verde que el botón de WhatsApp de la caja.
  waBtn: { flex:'1 0 auto', minHeight:44, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px', background:'#00a884', borderRadius:12, color:'white', fontSize:13, fontWeight:800, textDecoration:'none', boxSizing:'border-box' },
  waBtnHecho: { flex:'1 0 auto', minHeight:44, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px', background:theme.bgMuted2, borderRadius:12, color:theme.grayMid, fontSize:13, fontWeight:700, textDecoration:'none', boxSizing:'border-box' },
  pasos: { background:theme.bgMuted2, borderRadius:16, padding:20, marginBottom:24 },
  pasosTitle: { fontSize:13, fontWeight:700, color:theme.black, marginBottom:12 },
  pasoBtn: { display:'flex', alignItems:'center', gap:12, background:'white', border:'1px solid #e8eaf0', borderRadius:12, padding:'12px 14px', marginBottom:8, textDecoration:'none' },
  pasoTexto: { flex:1, fontSize:13, fontWeight:600, color:theme.black, lineHeight:1.4 },
  pasoFlecha: { fontSize:14, color:theme.red, fontWeight:700, flexShrink:0 },
  pasosNota: { fontSize:12, color:theme.gray, lineHeight:1.6, marginTop:12 },
  pasoNum: { width:24, height:24, borderRadius:'50%', background:theme.red, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 },
  linkUrl: { fontSize:12, color:theme.black, fontFamily:'monospace', wordBreak:'break-all', lineHeight:1.5, margin:'10px 0 10px 36px' },
  copiarBtn: { marginLeft:36, padding:'10px 16px', background:theme.black, border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  btn: { width:'100%', padding:18, background:theme.red, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
  btnNeutro: { width:'100%', padding:16, background:'white', border:'2px solid #e8eaf0', borderRadius:14, color:theme.black, fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
  ghost: { width:'100%', minHeight:44, marginTop:8, background:'none', border:'none', color:theme.gray, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
}
