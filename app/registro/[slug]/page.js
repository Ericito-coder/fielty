'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function RegistroSlug({ params }) {
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [cargando, setCargando] = useState(false)
  const [clienteId, setClienteId] = useState(null)
  const [error, setError] = useState('')
  const [negocio, setNegocio] = useState(null)
  const [REFERIDO_POR, setReferidoPor] = useState(null)

  useEffect(() => {
    params.then(p => {
      supabase.from('negocios').select('*').eq('slug', p.slug).single()
        .then(({ data }) => setNegocio(data))
    })
    const searchParams = new URLSearchParams(window.location.search)
    setReferidoPor(searchParams.get('ref') || null)
  }, [params])

  async function registrar() {
    if (!nombre) { setError('Ingresá tu nombre'); return }
    if (!dni) { setError('Ingresá tu DNI'); return }
    if (!email) { setError('Ingresá tu email'); return }
    if (!password) { setError('Creá una contraseña'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (!negocio) { setError('Negocio no encontrado'); return }
    setError('')
    setCargando(true)

    try {
      const res = await fetch('/api/cliente/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          dni,
          telefono: telefono || null,
          email,
          password,
          slug: negocio.slug,
          referidoPor: REFERIDO_POR || null,
          fechaNacimiento: fechaNacimiento || null,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Hubo un error, intentá de nuevo')
        setCargando(false)
        return
      }

      setCargando(false)
      setClienteId(result.clienteId)
    } catch {
      setError('Error de conexión. Revisá tu internet e intentá de nuevo.')
      setCargando(false)
    }
  }

  if (!negocio) return (
    <div style={styles.wrap}>
      <div style={{color:'white', textAlign:'center'}}>Cargando...</div>
    </div>
  )

  if (clienteId) return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{fontSize:56, marginBottom:16}}>🎉</div>
        <h2 style={styles.title}>¡Bienvenido!</h2>
        <p style={styles.sub}>
          Tu tarjeta fue creada con <strong>{REFERIDO_POR ? `${negocio.puntos_referido_receptor || 50} puntos por referido` : `${negocio.puntos_bienvenida || 10} puntos`}</strong> de regalo.
        </p>
        <button style={{...styles.btn, background: negocio.color}} onClick={() => window.location.href = `/tarjeta/${clienteId}`}>
          Ver mi tarjeta →
        </button>
      </div>
    </div>
  )

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          {negocio.logo_url
            ? <img src={negocio.logo_url} alt={negocio.nombre} style={{width:40, height:40, borderRadius:12, objectFit:'cover'}} />
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

        <div style={styles.field}>
          <label style={styles.label}>Tu nombre</label>
          <input style={styles.input} placeholder="Ej: Martina García"
            value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>DNI</label>
          <input style={styles.input} placeholder="Ej: 38.452.100"
            value={dni} onChange={e => setDni(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>WhatsApp <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input style={styles.input} placeholder="Ej: 11 5555-1234"
            value={telefono} onChange={e => setTelefono(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="Ej: martina@gmail.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Contraseña <span style={{color:'#bbb', fontWeight:400}}>(para ver tu tarjeta)</span></label>
          <input style={styles.input} type="password" placeholder="Mínimo 6 caracteres"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Fecha de nacimiento <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input style={{...styles.input, width:'calc(100% - 32px)'}} type="date"
            value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
          {negocio.puntos_cumpleanos > 0 && (
            <div style={{fontSize:12, color:'#888', marginTop:6}}>🎂 Si la cargás, podés recibir puntos de regalo en tu cumpleaños.</div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={{...styles.btn, background: negocio.color}} onClick={registrar} disabled={cargando}>
          {cargando ? 'Creando tu tarjeta...' : '✦ Crear mi tarjeta gratis'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'36px 28px', width:'100%', maxWidth:400 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', lineHeight:1.2, marginBottom:10 },
  sub: { fontSize:14, color:'#888', marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:16 },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box', maxWidth:'100%' },
  btn: { width:'100%', padding:18, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 }
}