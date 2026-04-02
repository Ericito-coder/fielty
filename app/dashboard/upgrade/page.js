'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PLANES = {
  pro_early: {
    nombre: 'Pro',
    badge: 'Early Adopter',
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
  },
  pro: {
    nombre: 'Pro',
    precio: '$20.000',
    periodo: 'por mes',
    color: '#e0001b',
    features: [
      'Clientes ilimitados',
      'Hasta 3 sucursales',
      'Métricas por sucursal',
      'Puntos de cumpleaños',
      'Sistema de referidos',
      'Soporte por WhatsApp',
    ],
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
  },
}

export default function Upgrade() {
  const [negocio, setNegocio] = useState(null)
  const [plan, setPlan] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const planGuardado = localStorage.getItem('fielty_plan')
    if (planGuardado && PLANES[planGuardado]) {
      setPlan(planGuardado)
    } else {
      setPlan('pro_early') // fallback
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      supabase.from('negocios').select('id, nombre, plan').eq('user_id', user.id).single()
        .then(({ data }) => {
          if (!data) { window.location.href = '/dashboard'; return }
          if (data.plan && data.plan !== 'gratis') {
            // Ya tiene un plan pago, ir al dashboard
            window.location.href = '/dashboard'
            return
          }
          setNegocio(data)
        })
    })
  }, [])

  async function pagar() {
    if (!negocio || !plan) return
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId: negocio.id, plan }),
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

  if (!negocio || !plan) return (
    <div style={s.wrap}><div style={{color:'#888'}}>Cargando...</div></div>
  )

  const info = PLANES[plan]

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>fielty</span>
        </div>

        <div style={s.step}>Último paso</div>
        <h1 style={s.title}>Activá tu plan {info.nombre}</h1>
        <p style={s.sub}>Vas a suscribirte con Mercado Pago. Podés cancelar cuando quieras.</p>

        {/* Plan card */}
        <div style={{...s.planCard, borderColor: info.color}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
            <div>
              <div style={{fontSize:18, fontWeight:800, color:'#0e0e0e'}}>
                {info.nombre}
                {info.badge && (
                  <span style={{marginLeft:8, fontSize:11, fontWeight:700, background:info.color, color:'white', padding:'3px 8px', borderRadius:100}}>
                    {info.badge}
                  </span>
                )}
              </div>
              <div style={{fontSize:13, color:'#888', marginTop:2}}>{info.periodo}</div>
            </div>
            <div style={{textAlign:'right'}}>
              {info.precioOriginal && (
                <div style={{fontSize:13, color:'#bbb', textDecoration:'line-through', fontFamily:'monospace'}}>{info.precioOriginal}</div>
              )}
              <div style={{fontSize:28, fontWeight:900, color:'#0e0e0e', fontFamily:'monospace'}}>{info.precio}</div>
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {info.features.map((f, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#555'}}>
                <span style={{color:info.color, fontWeight:700}}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={{...s.btn, background: info.color}} onClick={pagar} disabled={cargando}>
          {cargando ? 'Conectando...' : 'Pagar con Mercado Pago →'}
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
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:440 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:28 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:'#0e0e0e', letterSpacing:-0.5 },
  step: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#e0001b', marginBottom:8 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', marginBottom:8 },
  sub: { fontSize:14, color:'#888', marginBottom:24, lineHeight:1.6 },
  planCard: { border:'2px solid', borderRadius:20, padding:24, marginBottom:24 },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:16 },
  btn: { width:'100%', padding:18, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginBottom:12 },
  btnSecondary: { width:'100%', padding:14, background:'transparent', border:'none', borderRadius:14, color:'#888', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
}
