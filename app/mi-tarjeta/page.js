'use client'
import { useState, useEffect } from 'react'

export default function MiTarjeta() {
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [tarjetas, setTarjetas] = useState(null)

  useEffect(() => {
    try {
      const guardadas = JSON.parse(localStorage.getItem('fielty_tarjetas') || '{}')
      const lista = Object.values(guardadas)
      if (lista.length === 1) { window.location.href = `/tarjeta/${lista[0].id}`; return }
      if (lista.length > 1) setTarjetas(lista)
    } catch {}
  }, [])

  async function ingresar() {
    if (!dni) { setError('Ingresá tu DNI'); return }
    if (!password) { setError('Ingresá tu contraseña'); return }
    setError('')
    setCargando(true)

    const res = await fetch('/api/cliente/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, password }),
    })
    const data = await res.json()
    setCargando(false)

    if (!res.ok) { setError(data.error); return }

    if (data.debe_cambiar_password) {
      sessionStorage.setItem('fielty_cambio_pwd', JSON.stringify({ dni, clienteId: data.clienteId }))
      window.location.href = '/mi-tarjeta/nueva-password'
      return
    }

    if (data.tarjetas.length === 1) {
      window.location.href = `/tarjeta/${data.tarjetas[0].id}`
    } else {
      setTarjetas(data.tarjetas)
    }
  }

  if (tarjetas) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}><div style={s.logoDot} /><span style={s.logoText}>fielty</span></div>
        <h2 style={s.title}>¿A cuál negocio querés ir?</h2>
        <p style={s.sub}>Tenés tarjeta en varios negocios.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tarjetas.map(t => (
            <button key={t.id} onClick={() => window.location.href = `/tarjeta/${t.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: '#f5f6fa', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: t.negocioColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                {t.negocioNombre?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0e0e0e' }}>{t.negocioNombre}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Ver mi tarjeta →</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button style={{ fontSize: 13, color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => { localStorage.removeItem('fielty_tarjetas'); setTarjetas(null) }}>
            No soy yo — ingresar con otra cuenta
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}><div style={s.logoDot} /><span style={s.logoText}>fielty</span></div>
        <h1 style={s.title}>Ver mi tarjeta</h1>
        <p style={s.sub}>Ingresá con tu DNI y contraseña para acceder a tus puntos.</p>

        <div style={s.field}>
          <label style={s.label} htmlFor="mitarjeta-dni">DNI</label>
          <input id="mitarjeta-dni" style={s.input} placeholder="Ej: 38452100" value={dni}
            onChange={e => setDni(e.target.value)} onKeyDown={e => e.key === 'Enter' && ingresar()} />
        </div>
        <div style={s.field}>
          <label style={s.label} htmlFor="mitarjeta-password">Contraseña</label>
          <input id="mitarjeta-password" style={s.input} type="password" placeholder="Tu contraseña" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && ingresar()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={ingresar} disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ver mi tarjeta →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/mi-tarjeta/reset" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>
            ¿Olvidaste tu contraseña?
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
  sub: { fontSize: 14, color: '#666', marginBottom: 28, lineHeight: 1.6 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#666', marginBottom: 8 },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #e8eaf0', borderRadius: 12, fontSize: 16, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: 18, background: '#e0001b', border: 'none', borderRadius: 14, color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' },
  error: { background: '#fff0f0', color: '#e0001b', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 },
}
