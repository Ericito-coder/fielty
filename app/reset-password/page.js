'use client'
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
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
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
      <div style={s.card}>
        <div style={{fontSize:52, marginBottom:16}}>✅</div>
        <h2 style={s.title}>¡Contraseña actualizada!</h2>
        <p style={s.sub}>Te estamos redirigiendo al panel...</p>
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

        <h1 style={s.title}>Nueva contraseña</h1>
        <p style={s.sub}>Elegí una contraseña nueva para tu cuenta.</p>

        <div style={s.field}>
          <label style={s.label}>Nueva contraseña</label>
          <input style={s.input} type="password" placeholder="Mínimo 6 caracteres"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Confirmar contraseña</label>
          <input style={s.input} type="password" placeholder="Repetí la contraseña"
            value={confirmar} onChange={e => setConfirmar(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cambiarPassword()} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={cambiarPassword} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420, textAlign:'center' },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:32, justifyContent:'center' },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:'#0e0e0e', letterSpacing:-0.5 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', marginBottom:8 },
  sub: { fontSize:14, color:'#888', marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:16, textAlign:'left' },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 },
}