'use client'
import { theme } from '@/lib/theme'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)

  async function cambiarPassword() {
    if (!password) { setError('Ingresá una contraseña'); return }
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    setError('')
    setCargando(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setCargando(false)
    if (updateError) { setError('Hubo un error, intentá de nuevo'); return }
    setListo(true)
    setTimeout(() => window.location.href = '/dashboard', 2000)
  }

  if (listo) return (
    <div style={s.wrap}>
      <main style={s.card}>
        <div style={{fontSize:52, marginBottom:16}}>✅</div>
        <h2 style={s.title}>¡Contraseña actualizada!</h2>
        <p style={s.sub}>Te estamos redirigiendo al panel...</p>
      </main>
    </div>
  )

  return (
    <div style={s.wrap}>
      <main style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>fielty</span>
        </div>

        <h1 style={s.title}>Nueva contraseña</h1>
        <p style={s.sub}>Elegí una contraseña nueva para tu cuenta.</p>

        <div style={s.field}>
          <label style={s.label} htmlFor="reset-nueva-password">Nueva contraseña</label>
          <input id="reset-nueva-password" style={s.input} type="password" placeholder="Mínimo 8 caracteres"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label} htmlFor="reset-confirmar-password">Confirmar contraseña</label>
          <input id="reset-confirmar-password" style={s.input} type="password" placeholder="Repetí la contraseña"
            value={confirmar} onChange={e => setConfirmar(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cambiarPassword()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={cambiarPassword} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </main>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:theme.black, display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420, textAlign:'center' },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:32, justifyContent:'center' },
  logoDot: { width:10, height:10, borderRadius:'50%', background:theme.red, boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:theme.black, letterSpacing:-0.5 },
  title: { fontSize:28, fontWeight:800, color:theme.black, marginBottom:8 },
  sub: { fontSize:14, color:theme.gray, marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:16, textAlign:'left' },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:theme.gray, marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:18, background:theme.red, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  error: { background:theme.errorBg, color:theme.red, padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 },
}