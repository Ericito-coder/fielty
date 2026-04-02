'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('plan')
    if (p) {
      localStorage.setItem('fielty_plan', p)
      setPlan(p)
    }
  }, [])

  async function registrar() {
    if (!nombre) { setError('Ingresá tu nombre'); return }
    if (!email) { setError('Ingresá tu email'); return }
    if (password.length < 6) { setError('La contraseña tiene que tener al menos 6 caracteres'); return }
    setError('')
    setCargando(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })

    setCargando(false)

    if (authError) {
      setError(authError.message)
      return
    }

    // Guardar el user_id en localStorage para el siguiente paso
    localStorage.setItem('fielty_user_id', data.user.id)
    window.location.href = '/onboarding/negocio'
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>fielty</span>
        </div>

        <div style={s.step}>Paso 1 de 3</div>
        <h1 style={s.title}>Creá tu cuenta</h1>
        <p style={s.sub}>
          {plan === 'pro_early' && 'Estás a un paso de activar el plan Pro. Primero creá tu cuenta.'}
          {plan === 'pro' && 'Estás a un paso de activar el plan Pro. Primero creá tu cuenta.'}
          {plan === 'business' && 'Estás a un paso de activar el plan Business. Primero creá tu cuenta.'}
          {!plan && 'Gratis para empezar. Sin tarjeta de crédito.'}
        </p>

        <div style={s.field}>
          <label style={s.label}>Tu nombre</label>
          <input style={s.input} placeholder="Ej: Marcos Pérez"
            value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="Ej: marcos@petpoint.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Contraseña</label>
          <input style={s.input} type="password" placeholder="Mínimo 6 caracteres"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={registrar} disabled={cargando}>
          {cargando ? 'Creando cuenta...' : 'Continuar →'}
        </button>

        <div style={s.login}>
          ¿Ya tenés cuenta? <a href="/login" style={s.link}>Iniciá sesión</a>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:28 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:'#0e0e0e', letterSpacing:-0.5 },
  step: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#e0001b', marginBottom:8 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', marginBottom:8 },
  sub: { fontSize:14, color:'#888', marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:16 },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
  btn: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 },
  login: { textAlign:'center', marginTop:20, fontSize:13, color:'#888' },
  link: { color:'#e0001b', fontWeight:600, textDecoration:'none' },
}
