'use client'
import { useState, useEffect } from 'react'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [token, setToken] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [reseteado, setReseteado] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) setToken(t)
  }, [])

  async function pedirReset() {
    if (!email) { setError('Ingresá tu email'); return }
    setError('')
    setCargando(true)
    await fetch('/api/cliente/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setCargando(false)
    setEnviado(true)
  }

  async function confirmarReset() {
    if (!password) { setError('Ingresá una contraseña'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== password2) { setError('Las contraseñas no coinciden'); return }
    setError('')
    setCargando(true)
    const res = await fetch('/api/cliente/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setCargando(false)
    if (!res.ok) { setError(data.error); return }
    setReseteado(true)
  }

  if (reseteado) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}><div style={s.logoDot} /><span style={s.logoText}>fielty</span></div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={s.title}>¡Contraseña actualizada!</h2>
        <p style={s.sub}>Ya podés ingresar con tu nueva contraseña.</p>
        <a href="/mi-tarjeta" style={{ ...s.btn, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Ir a mi tarjeta →
        </a>
      </div>
    </div>
  )

  if (enviado) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}><div style={s.logoDot} /><span style={s.logoText}>fielty</span></div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
        <h2 style={s.title}>Revisá tu email</h2>
        <p style={s.sub}>Si el email está registrado, te enviamos un link para resetear tu contraseña. Revisá también el spam.</p>
        <a href="/mi-tarjeta" style={{ fontSize: 14, color: '#888', textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 16 }}>
          Volver al inicio
        </a>
      </div>
    </div>
  )

  if (token) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}><div style={s.logoDot} /><span style={s.logoText}>fielty</span></div>
        <h1 style={s.title}>Nueva contraseña</h1>
        <p style={s.sub}>Ingresá tu nueva contraseña.</p>

        <div style={s.field}>
          <label style={s.label}>Nueva contraseña</label>
          <input style={s.input} type="password" placeholder="Mínimo 6 caracteres" value={password}
            onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Repetir contraseña</label>
          <input style={s.input} type="password" placeholder="Repetí la contraseña" value={password2}
            onChange={e => setPassword2(e.target.value)} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={confirmarReset} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar contraseña →'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}><div style={s.logoDot} /><span style={s.logoText}>fielty</span></div>
        <h1 style={s.title}>Recuperar contraseña</h1>
        <p style={s.sub}>Ingresá el email con el que te registraste y te mandamos un link para crear una nueva contraseña.</p>

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="Ej: martina@gmail.com" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && pedirReset()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={pedirReset} disabled={cargando}>
          {cargando ? 'Enviando...' : 'Enviar link →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/mi-tarjeta" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>
            ← Volver
          </a>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'white', borderRadius: 28, padding: '40px 32px', width: '100%', maxWidth: 400 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  logoDot: { width: 8, height: 8, borderRadius: '50%', background: '#e0001b', boxShadow: '0 0 8px #e0001b' },
  logoText: { fontSize: 20, fontWeight: 800, color: '#0e0e0e', letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: 800, color: '#0e0e0e', marginBottom: 8, lineHeight: 1.2 },
  sub: { fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.6 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888', marginBottom: 8 },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #e8eaf0', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: 18, background: '#e0001b', border: 'none', borderRadius: 14, color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' },
  error: { background: '#fff0f0', color: '#e0001b', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 },
}
