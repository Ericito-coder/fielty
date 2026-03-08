'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PrimeraRecompensa() {
  const [recompensas, setRecompensas] = useState([
    { nombre: '', puntos: '' }
  ])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  function agregar() {
    setRecompensas([...recompensas, { nombre: '', puntos: '' }])
  }

  function actualizar(i, campo, valor) {
    const nuevas = [...recompensas]
    nuevas[i][campo] = valor
    setRecompensas(nuevas)
  }

  function eliminar(i) {
    setRecompensas(recompensas.filter((_, idx) => idx !== i))
  }

  async function guardar() {
    const validas = recompensas.filter(r => r.nombre && r.puntos)
    if (validas.length === 0) { setError('Agregá al menos una recompensa'); return }
    setError('')
    setCargando(true)

    const negocioId = localStorage.getItem('fielty_negocio_id')

    const { error: dbError } = await supabase
      .from('recompensas')
      .insert(validas.map(r => ({
        negocio_id: negocioId,
        nombre: r.nombre,
        puntos_necesarios: parseInt(r.puntos),
        activa: true
      })))

    setCargando(false)
    if (dbError) { setError('Hubo un error, intentá de nuevo'); return }

    window.location.href = '/onboarding/listo'
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>fielty</span>
        </div>

        <div style={s.step}>Paso 3 de 3</div>
        <h1 style={s.title}>Creá tus recompensas</h1>
        <p style={s.sub}>¿Qué van a poder canjear tus clientes? Podés cambiarlas cuando quieras.</p>

        {recompensas.map((r, i) => (
          <div key={i} style={s.recompensaRow}>
            <div style={{flex:2}}>
              <label style={s.label}>Recompensa</label>
              <input style={s.input} placeholder="Ej: Baño gratis"
                value={r.nombre} onChange={e => actualizar(i, 'nombre', e.target.value)} />
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>Puntos</label>
              <input style={s.input} type="number" placeholder="50"
                value={r.puntos} onChange={e => actualizar(i, 'puntos', e.target.value)} />
            </div>
            {recompensas.length > 1 && (
              <button style={s.deleteBtn} onClick={() => eliminar(i)}>✕</button>
            )}
          </div>
        ))}

        <button style={s.addBtn} onClick={agregar}>+ Agregar otra recompensa</button>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={guardar} disabled={cargando}>
          {cargando ? 'Guardando...' : '¡Listo, empezar! →'}
        </button>
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
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  recompensaRow: { display:'flex', gap:10, alignItems:'flex-end', marginBottom:12 },
  deleteBtn: { padding:'14px 12px', background:'#fff0f0', border:'none', borderRadius:12, color:'#e0001b', cursor:'pointer', fontSize:14, fontWeight:700, marginBottom:0, alignSelf:'flex-end' },
  addBtn: { width:'100%', padding:14, background:'#f5f6fa', border:'2px dashed #e8eaf0', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', color:'#888', fontFamily:'inherit', marginBottom:20 },
  btn: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 },
}