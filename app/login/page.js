'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [modo, setModo] = useState('login') // 'login' o 'reset'
  const [resetOk, setResetOk] = useState(false)

  async function iniciarSesion() {
    if (!email) { setError('Ingresá tu email'); return }
    if (!password) { setError('Ingresá tu contraseña'); return }
    setError('')
    setCargando(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setCargando(false)
    if (authError) { setError('Email o contraseña incorrectos'); return }
    window.location.href = '/dashboard'
  }

  async function resetearPassword() {
    if (!email) { setError('Ingresá tu email para recibir el link'); return }
    setError('')
    setCargando(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    setCargando(false)
    if (resetError) { setError('Hubo un error, intentá de nuevo'); return }
    setResetOk(true)
  }

  if (modo === 'reset') return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>fielty</span>
        </div>

        <h1 style={s.title}>Resetear contraseña</h1>
        <p style={s.sub}>Te mandamos un link a tu email para crear una nueva contraseña.</p>

        {resetOk ? (
          <div style={s.successBox}>
            ✅ ¡Listo! Revisá tu email y hacé clic en el link para resetear tu contraseña.
          </div>
        ) : (
          <>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="tu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {error && <div style={s.error}>{error}</div>}

            <button style={s.btn} onClick={resetearPassword} disabled={cargando}>
              {cargando ? 'Enviando...' : 'Enviar link de reseteo'}
            </button>
          </>
        )}

        <button style={s.linkBtn} onClick={() => { setModo('login'); setError(''); setResetOk(false) }}>
          ← Volver al login
        </button>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>fielty</span>
        </div>

        <h1 style={s.title}>Bienvenido</h1>
        <p style={s.sub}>Ingresá a tu panel de fidelización.</p>

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="tu@email.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Contraseña</label>
          <input style={s.input} type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && iniciarSesion()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={iniciarSesion} disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar →'}
        </button>

        <button style={s.linkBtn} onClick={() => { setModo('reset'); setError('') }}>
          ¿Olvidaste tu contraseña? 
        </button>

        <div style={s.register}>
          ¿No tenés cuenta? <a href="/onboarding/registro" style={s.link}>Registrá tu negocio</a>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:32 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:'#0e0e0e', letterSpacing:-0.5 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', marginBottom:8 },
  sub: { fontSize:14, color:'#888', marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:16 },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  linkBtn: { width:'100%', padding:12, background:'transparent', border:'none', color:'#888', fontSize:13, cursor:'pointer', fontFamily:'inherit', marginTop:8 },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 },
  successBox: { background:'#e8faf2', color:'#00b96b', padding:'14px 16px', borderRadius:12, fontSize:14, lineHeight:1.6, marginBottom:20 },
  register: { textAlign:'center', marginTop:8, fontSize:13, color:'#888' },
  link: { color:'#e0001b', fontWeight:600, textDecoration:'none' },
}