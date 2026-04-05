'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PLANES = {
  pro_early: {
    nombre: 'Pro',
    badge: 'Early Adopter · 50% OFF',
    precio: '$10.000',
    precioOriginal: '$20.000',
    periodo: 'por mes · primer año',
    color: '#e0001b',
    features: [
      'Clientes ilimitados',
      'Hasta 3 sucursales',
      'Métricas por sucursal',
      'Puntos de cumpleaños',
      'Sistema de referidos',
      'Soporte por WhatsApp',
    ],
    destacado: true,
  },
  business: {
    nombre: 'Business',
    precio: '$35.000',
    periodo: 'por mes',
    color: '#f0a500',
    features: [
      'Todo lo de Pro',
      'Sucursales ilimitadas',
      'Campañas por WhatsApp',
      'Integraciones (próximamente)',
      'Soporte prioritario',
    ],
    destacado: false,
  },
}

export default function Upgrade() {
  const [negocio, setNegocio] = useState(null)
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      supabase.from('negocios').select('id, nombre, plan').eq('user_id', user.id).single()
        .then(({ data }) => {
          if (!data) { window.location.href = '/dashboard'; return }
          // Si ya tiene business, no hay nada más para subir
          if (data.plan === 'business') { window.location.href = '/dashboard'; return }
          setNegocio(data)
          // Pre-seleccionar plan según contexto
          const planLocalStorage = localStorage.getItem('fielty_plan')
          if (planLocalStorage && PLANES[planLocalStorage]) {
            setPlanSeleccionado(planLocalStorage)
          } else if (!data.plan || data.plan === 'gratis') {
            setPlanSeleccionado('pro_early')
          } else {
            setPlanSeleccionado('business')
          }
        })
    })
  }, [])

  async function pagar() {
    if (!negocio || !planSeleccionado) return
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId: negocio.id, plan: planSeleccionado }),
      })
      const data = await res.json()
      if (data.init_point) {
        localStorage.removeItem('fielty_plan')
        window.location.href = data.init_point
      } else {
        setError('No se pudo iniciar el pago. Intentá de nuevo.')
      }
    } catch {
      setError('Error al conectar con el servidor. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  if (!negocio) return (
    <div style={s.wrap}><div style={{color:'#888'}}>Cargando...</div></div>
  )

  // Opciones según plan actual
  const planActual = negocio.plan || 'gratis'
  const opciones = planActual === 'gratis' ? ['pro_early', 'business'] : ['business']

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>fielty</span>
        </div>

        <h1 style={s.title}>Elegí tu plan</h1>
        <p style={s.sub}>Suscripción mensual con Mercado Pago. Cancelá cuando quieras.</p>

        <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:24}}>
          {opciones.map(key => {
            const info = PLANES[key]
            const seleccionado = planSeleccionado === key
            return (
              <div
                key={key}
                onClick={() => setPlanSeleccionado(key)}
                style={{
                  border: seleccionado ? `2px solid ${info.color}` : '2px solid #e8eaf0',
                  borderRadius: 16,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                  background: seleccionado ? `${info.color}08` : 'white',
                  position: 'relative',
                }}
              >
                {info.badge && (
                  <div style={{position:'absolute', top:-10, left:16, background:info.color, color:'white', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100}}>
                    {info.badge}
                  </div>
                )}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div style={{width:18, height:18, borderRadius:'50%', border:`2px solid ${info.color}`, background: seleccionado ? info.color : 'white', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {seleccionado && <div style={{width:8, height:8, borderRadius:'50%', background:'white'}} />}
                    </div>
                    <div>
                      <div style={{fontSize:16, fontWeight:800, color:'#0e0e0e'}}>{info.nombre}</div>
                      <div style={{fontSize:12, color:'#888'}}>{info.periodo}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    {info.precioOriginal && (
                      <div style={{fontSize:12, color:'#bbb', textDecoration:'line-through', fontFamily:'monospace'}}>{info.precioOriginal}</div>
                    )}
                    <div style={{fontSize:22, fontWeight:900, color:'#0e0e0e', fontFamily:'monospace'}}>{info.precio}</div>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:6, paddingLeft:28}}>
                  {info.features.map((f, i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#555'}}>
                      <span style={{color:info.color, fontWeight:700, fontSize:11}}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button
          style={{...s.btn, background: planSeleccionado ? PLANES[planSeleccionado].color : '#e0001b', opacity: cargando ? 0.7 : 1}}
          onClick={pagar}
          disabled={cargando || !planSeleccionado}
        >
          {cargando ? 'Conectando...' : `Pagar con Mercado Pago →`}
        </button>

        <button style={s.btnSecondary} onClick={() => window.location.href = '/dashboard'}>
          Ahora no, ir al panel
        </button>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:480 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:28 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:'#0e0e0e', letterSpacing:-0.5 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', marginBottom:8 },
  sub: { fontSize:14, color:'#888', marginBottom:24, lineHeight:1.6 },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:16 },
  btn: { width:'100%', padding:18, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginBottom:12 },
  btnSecondary: { width:'100%', padding:14, background:'transparent', border:'none', borderRadius:14, color:'#888', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
}
