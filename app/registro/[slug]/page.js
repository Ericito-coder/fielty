'use client'
import { theme } from '@/lib/theme'
import { useState, useEffect } from 'react'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { juntarNombre, partirNombre } from '@/lib/clientes'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

// Solo para prellenar el formulario: la verificación real del token la
// hace el backend contra Google en /api/cliente/registrar.
function decodificarJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    // atob devuelve bytes crudos, no texto: si se leen como string los
    // acentos quedan rotos ("Julián" -> "JuliÃ¡n").
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch { return null }
}

export default function RegistroSlug({ params }) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [google, setGoogle] = useState(null)
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [cargando, setCargando] = useState(false)
  const [registrandoGoogle, setRegistrandoGoogle] = useState(false)
  const [clienteId, setClienteId] = useState(null)
  const [error, setError] = useState('')
  const [negocio, setNegocio] = useState(null)
  const [REFERIDO_POR, setReferidoPor] = useState(null)
  const [esIOS, setEsIOS] = useState(false)
  const [yaInstalada, setYaInstalada] = useState(false)

  useEffect(() => {
    params.then(p => {
      fetch(`/api/negocio-publico?slug=${encodeURIComponent(p.slug)}`)
        .then(res => res.ok ? res.json() : { negocio: null })
        .then(({ negocio: data }) => setNegocio(data))
        .catch(() => {})
    })
    const searchParams = new URLSearchParams(window.location.search)
    setReferidoPor(searchParams.get('ref') || null)
    setEsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setYaInstalada(window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches)
  }, [params])

  // Con Google la tarjeta se crea de una: el token trae nombre y email
  // verificados, que es todo lo que hace falta. El resto del perfil
  // (WhatsApp, cumpleaños) se completa después desde la tarjeta.
  function conectarGoogle(token) {
    const payload = decodificarJwt(token)
    // Google manda el nombre partido en given_name / family_name, que es
    // justo lo que necesitan los dos campos. Si la cuenta no los trae
    // separados, se parte el `name` completo a mano.
    const desdeName = partirNombre(payload?.name)
    const nombreGoogle = payload?.given_name || desdeName.nombre
    const apellidoGoogle = payload?.family_name || desdeName.apellido
    const completoGoogle = juntarNombre(nombreGoogle, apellidoGoogle) || juntarNombre(nombre, apellido)
    setGoogle({ token, email: payload?.email || '' })
    if (nombreGoogle) setNombre(n => n || nombreGoogle)
    if (apellidoGoogle) setApellido(a => a || apellidoGoogle)
    setError('')
    setRegistrandoGoogle(true)
    registrar({ googleToken: token, nombre: completoGoogle })
  }

  async function registrar(override = {}) {
    const nombreFinal = override.nombre || juntarNombre(nombre, apellido)
    const tokenGoogle = override.googleToken || google?.token || null

    if (!tokenGoogle) {
      if (!nombre.trim()) { setError('Ingresá tu nombre'); return }
      if (!apellido.trim()) { setError('Ingresá tu apellido'); return }
      if (!dni) { setError('Ingresá tu DNI'); return }
      if (!email) { setError('Ingresá tu email'); return }
      if (!password) { setError('Creá una contraseña'); return }
      if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    }
    // Red de seguridad para el camino de Google: si la cuenta no trajo
    // ningún nombre, no se puede crear la tarjeta sin uno.
    if (!nombreFinal) { setError('Ingresá tu nombre'); return }
    if (!negocio) { setError('Negocio no encontrado'); return }
    setError('')
    setCargando(true)

    try {
      const res = await fetch('/api/cliente/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreFinal,
          dni: dni || null,
          telefono: telefono || null,
          email: tokenGoogle ? null : email,
          password: tokenGoogle ? null : password,
          googleToken: tokenGoogle,
          slug: negocio.slug,
          referidoPor: REFERIDO_POR || null,
          fechaNacimiento: fechaNacimiento || null,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Hubo un error, intentá de nuevo')
        setCargando(false)
        setRegistrandoGoogle(false)
        return
      }

      setCargando(false)
      setRegistrandoGoogle(false)
      setClienteId(result.clienteId)
    } catch {
      setError('Error de conexión. Revisá tu internet e intentá de nuevo.')
      setCargando(false)
      setRegistrandoGoogle(false)
    }
  }

  if (!negocio) return (
    <div style={styles.wrap}>
      <div style={{color:'white', textAlign:'center'}}>Cargando...</div>
    </div>
  )

  if (registrandoGoogle) return (
    <div style={styles.wrap}>
      <main style={{...styles.card, textAlign:'center'}}>
        <div style={{fontSize:40, marginBottom:16}}>✨</div>
        <h2 style={styles.title}>Creando tu tarjeta...</h2>
        <p style={{...styles.sub, marginBottom:0}}>Un segundo, ya casi está.</p>
      </main>
    </div>
  )

  if (clienteId) return (
    <div style={styles.wrap}>
      <main style={styles.card}>
        <div style={{fontSize:56, marginBottom:16}}>🎉</div>
        <h2 style={styles.title}>¡Bienvenido!</h2>
        <p style={styles.sub}>
          Tu tarjeta fue creada con <strong>{REFERIDO_POR ? `${negocio.puntos_referido_receptor || 50} puntos por referido` : `${negocio.puntos_bienvenida || 10} puntos`}</strong> de regalo.
        </p>
        <button style={{...styles.btn, background: negocio.color}} onClick={() => window.location.href = `/tarjeta/${clienteId}`}>
          Ver mi tarjeta →
        </button>
        {!yaInstalada && (
          <div style={{marginTop:20, background:theme.bgMuted2, borderRadius:14, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start'}}>
            <span style={{fontSize:20, flexShrink:0}}>📲</span>
            <p style={{margin:0, fontSize:13, color:theme.grayMid, lineHeight:1.5}}>
              <strong style={{color:theme.black}}>Guardá tu tarjeta a mano: </strong>
              {esIOS
                ? <>tocá los <strong>⋯ tres puntos</strong> en Safari → <strong>Compartir</strong> → <strong>Ver más</strong> → <strong>"Agregar a inicio"</strong>.</>
                : <>tocá los <strong>⋮ tres puntos</strong> del navegador y elegí <strong>"Agregar a pantalla de inicio"</strong>.</>
              }
            </p>
          </div>
        )}
      </main>
    </div>
  )

  return (
    <div style={styles.wrap}>
      <main style={styles.card}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          {negocio.logo_url
            ? <Image src={negocio.logo_url} alt={negocio.nombre} width={40} height={40} style={{borderRadius:12, objectFit:'cover'}} />
            : <div style={{width:40, height:40, borderRadius:12, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'white'}}>
                {negocio.nombre.slice(0,2).toUpperCase()}
              </div>
          }
          <div style={{fontSize:13, color: negocio.color, fontWeight:700, letterSpacing:'0.05em'}}>
            {negocio.nombre.toUpperCase()}
          </div>
        </div>
        <h1 style={styles.title}>Sumá puntos,<br/>ganá premios.</h1>
        <p style={styles.sub}>
          {REFERIDO_POR
            ? '🤝 Un amigo te invitó — vas a recibir puntos extra al registrarte.'
            : 'Registrate y empezá a acumular en cada compra. Sin app, sin complicaciones.'}
        </p>

        {!google ? (
          <>
            <GoogleSignInButton onCredential={conectarGoogle} onError={() => setError('No pudimos conectar con Google. Completá el formulario para registrarte.')} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e8eaf0' }} />
              <span style={{ fontSize: 12, color: theme.grayLight }}>o completá tus datos</span>
              <div style={{ flex: 1, height: 1, background: '#e8eaf0' }} />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: theme.bgMuted2, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.black }}>Conectado con Google</div>
              <div style={{ fontSize: 12, color: theme.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{google.email}</div>
            </div>
            <button onClick={() => setGoogle(null)}
              style={{ fontSize: 12, color: theme.gray, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', flexShrink: 0, minHeight: 44, padding: '0 4px' }}>
              Cambiar
            </button>
          </div>
        )}

        {/* Nombre y apellido van en una sola fila: son dos campos pero
            ocupan un renglón, así el formulario no se hace más largo. */}
        <div style={{display:'flex', gap:10}}>
          <div style={{...styles.field, flex:1, minWidth:0}}>
            <label style={styles.label} htmlFor="cliente-nombre">Nombre</label>
            <input id="cliente-nombre" style={styles.input} placeholder="Ej: Martina" autoComplete="given-name"
              value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div style={{...styles.field, flex:1, minWidth:0}}>
            <label style={styles.label} htmlFor="cliente-apellido">Apellido</label>
            <input id="cliente-apellido" style={styles.input} placeholder="Ej: García" autoComplete="family-name"
              value={apellido} onChange={e => setApellido(e.target.value)} />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="cliente-dni">
            DNI {google && <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span>}
          </label>
          <input id="cliente-dni" style={styles.input} placeholder="Ej: 38.452.100"
            value={dni} onChange={e => setDni(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="cliente-whatsapp">WhatsApp <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input id="cliente-whatsapp" style={styles.input} placeholder="Ej: 11 5555-1234"
            value={telefono} onChange={e => setTelefono(e.target.value)} />
        </div>
        {!google && (
          <>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="cliente-email">Email</label>
              <input id="cliente-email" style={styles.input} type="email" placeholder="Ej: martina@gmail.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="cliente-password">Contraseña <span style={{color:'#bbb', fontWeight:400}}>(para ver tu tarjeta)</span></label>
              <input id="cliente-password" style={styles.input} type="password" placeholder="Mínimo 8 caracteres"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </>
        )}
        <div style={styles.field}>
          <label style={styles.label} htmlFor="cliente-nacimiento">Fecha de nacimiento <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input id="cliente-nacimiento" style={{...styles.input, width:'calc(100% - 32px)'}} type="date"
            value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
          {negocio.puntos_cumpleanos > 0 && (
            <div style={{fontSize:12, color:theme.gray, marginTop:6}}>🎂 Si la cargás, podés recibir puntos de regalo en tu cumpleaños.</div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={{...styles.btn, background: negocio.color}} onClick={() => registrar()} disabled={cargando}>
          {cargando ? 'Creando tu tarjeta...' : '✦ Crear mi tarjeta gratis'}
        </button>
      </main>
    </div>
  )
}

const styles = {
  wrap: { minHeight:'100vh', background:theme.black, display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'36px 28px', width:'100%', maxWidth:400 },
  title: { fontSize:28, fontWeight:800, color:theme.black, lineHeight:1.2, marginBottom:10 },
  sub: { fontSize:14, color:theme.gray, marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:16 },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:theme.gray, marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box', maxWidth:'100%' },
  btn: { width:'100%', padding:18, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  error: { background:theme.errorBg, color:theme.red, padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 }
}