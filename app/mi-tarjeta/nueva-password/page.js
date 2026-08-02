'use client'
import { theme } from '@/lib/theme'
import { useState, useEffect } from 'react'

export default function NuevaPassword() {
  const [clienteId, setClienteId] = useState(null)
  const [dni, setDni] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    try {
      const datos = JSON.parse(sessionStorage.getItem('fielty_cambio_pwd') || 'null')
      if (!datos?.clienteId || !datos?.dni) {
        window.location.href = '/mi-tarjeta'
        return
      }
      setClienteId(datos.clienteId)
      setDni(datos.dni)
    } catch {
      window.location.href = '/mi-tarjeta'
    }
  }, [])

  async function guardar() {
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    setError('')
    setCargando(true)

    const res = await fetch('/api/cliente/cambiar-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId, dni, nuevaPassword: password, email: email || undefined, telefono: telefono || undefined }),
    })
    const data = await res.json()
    setCargando(false)

    if (!res.ok) { setError(data.error || 'Error al guardar'); return }

    sessionStorage.removeItem('fielty_cambio_pwd')
    window.location.href = '/mi-tarjeta'
  }

  if (!clienteId) return <div style={{ minHeight: '100vh', background: theme.black }} />

  return (
    <div style={s.wrap}>
      <main style={s.card}>
        <div style={s.logo}><div style={s.logoDot} /><span style={s.logoText}>fielty</span></div>
        <h1 style={s.title}>Completá tu cuenta</h1>
        <p style={s.sub}>Es la primera vez que ingresás. Elegí una contraseña y, si querés, agregá tu email para recibir notificaciones de puntos.</p>

        <div style={s.field}>
          <label style={s.label} htmlFor="nueva-pwd-email">Email <span style={{color:'#bbb', fontWeight:400, textTransform:'none', letterSpacing:0}}>(opcional)</span></label>
          <input id="nueva-pwd-email" style={s.input} type="email" placeholder="tu@email.com"
            value={email} onChange={e => setEmail(e.target.value)} autoFocus />
        </div>
        <div style={s.field}>
          <label style={s.label} htmlFor="nueva-pwd-telefono">Teléfono <span style={{color:'#bbb', fontWeight:400, textTransform:'none', letterSpacing:0}}>(opcional)</span></label>
          <input id="nueva-pwd-telefono" style={s.input} type="tel" inputMode="numeric" placeholder="Ej: 1134567890"
            value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g, ''))} />
        </div>

        <div style={s.field}>
          <label style={s.label} htmlFor="nueva-pwd-password">Nueva contraseña</label>
          <input id="nueva-pwd-password" style={s.input} type="password" placeholder="Mínimo 8 caracteres"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && guardar()} autoFocus />
        </div>
        <div style={s.field}>
          <label style={s.label} htmlFor="nueva-pwd-confirmar">Confirmá la contraseña</label>
          <input id="nueva-pwd-confirmar" style={s.input} type="password" placeholder="Repetí tu contraseña"
            value={confirmar} onChange={e => setConfirmar(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && guardar()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={guardar} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar contraseña →'}
        </button>
      </main>
    </div>
  )
}

const s = {
  wrap: { minHeight: '100vh', background: theme.black, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'white', borderRadius: 28, padding: '40px 32px', width: '100%', maxWidth: 400 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  logoDot: { width: 8, height: 8, borderRadius: '50%', background: theme.red, boxShadow: '0 0 8px #e0001b' },
  logoText: { fontSize: 20, fontWeight: 800, color: theme.black, letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: 800, color: theme.black, marginBottom: 8, lineHeight: 1.2 },
  sub: { fontSize: 14, color: theme.gray, marginBottom: 28, lineHeight: 1.6 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.gray, marginBottom: 8 },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #e8eaf0', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: 18, background: theme.red, border: 'none', borderRadius: 14, color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' },
  error: { background: theme.errorBg, color: theme.red, padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 },
}
