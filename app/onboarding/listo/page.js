'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Listo() {
  const [negocio, setNegocio] = useState(null)

  useEffect(() => {
    const id = localStorage.getItem('fielty_negocio_id')
    if (!id) return
    supabase
      .from('negocios')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setNegocio(data))
  }, [])

  useEffect(() => {
    if (!negocio) return
    const plan = localStorage.getItem('fielty_plan')
    if (plan && plan !== 'gratis') {
      setTimeout(() => { window.location.href = '/dashboard/upgrade' }, 1800)
    }
  }, [negocio])

  if (!negocio) return (
    <div style={s.wrap}>
      <div style={{color:'#888', fontSize:16}}>Cargando...</div>
    </div>
  )

  const registroUrl = `${window.location.origin}/registro?negocio=${negocio.id}`

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>fielty</span>
        </div>

        <div style={s.celebracion}>🎉</div>
        <h1 style={s.title}>¡Todo listo,<br/>{negocio.nombre}!</h1>
        <p style={s.sub}>Tu programa de fidelización está activo. Compartí este link o QR con tus clientes para que se registren.</p>

        {/* Link del negocio */}
        <div style={s.linkCard}>
          <div style={s.linkLabel}>Link de registro de clientes</div>
          <div style={s.linkUrl}>{registroUrl}</div>
          <button style={s.copyBtn} onClick={() => {
            navigator.clipboard.writeText(registroUrl)
            alert('¡Link copiado!')
          }}>
            📋 Copiar link
          </button>
        </div>

        {/* QR placeholder */}
        <div style={s.qrWrap}>
          <div style={s.qrLabel}>QR para imprimir en tu local</div>
          <div style={s.qrBox}>
            <div style={s.qrGrid}>
              {Array.from({length: 49}).map((_, i) => (
                <div key={i} style={{
                  borderRadius: 2,
                  background: Math.random() > 0.5 ? '#0e0e0e' : 'white'
                }}/>
              ))}
            </div>
          </div>
          <div style={{fontSize:12, color:'#888', textAlign:'center'}}>
            Escaneá para registrarse en {negocio.nombre}
          </div>
        </div>

        {/* Próximos pasos */}
        <div style={s.pasos}>
          <div style={s.pasosTitle}>Próximos pasos</div>
          <div style={s.pasoItem}>
            <div style={s.pasoNum}>1</div>
            <div>Imprimí el QR y ponelo en el mostrador</div>
          </div>
          <div style={s.pasoItem}>
            <div style={s.pasoNum}>2</div>
            <div>Pedile a tus empleados que usen <strong>/caja</strong> para acreditar puntos</div>
          </div>
          <div style={s.pasoItem}>
            <div style={s.pasoNum}>3</div>
            <div>Mirá las métricas desde tu panel</div>
          </div>
        </div>

        <button style={s.btn} onClick={() => {
          const plan = localStorage.getItem('fielty_plan')
          window.location.href = (plan && plan !== 'gratis') ? '/dashboard/upgrade' : '/dashboard'
        }}>
          {typeof window !== 'undefined' && localStorage.getItem('fielty_plan') && localStorage.getItem('fielty_plan') !== 'gratis'
            ? 'Completar pago →'
            : 'Ir al panel →'}
        </button>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:24 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:'#0e0e0e', letterSpacing:-0.5 },
  celebracion: { fontSize:52, marginBottom:16, textAlign:'center' },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', marginBottom:8, lineHeight:1.2 },
  sub: { fontSize:14, color:'#888', marginBottom:24, lineHeight:1.6 },
  linkCard: { background:'#f5f6fa', borderRadius:16, padding:20, marginBottom:20 },
  linkLabel: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  linkUrl: { fontSize:12, color:'#0e0e0e', fontFamily:'monospace', wordBreak:'break-all', marginBottom:12, lineHeight:1.5 },
  copyBtn: { padding:'10px 16px', background:'#0e0e0e', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  qrWrap: { marginBottom:24 },
  qrLabel: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:12, textAlign:'center' },
  qrBox: { width:160, height:160, background:'#0e0e0e', borderRadius:16, margin:'0 auto 12px', padding:14, display:'grid', placeItems:'center' },
  qrGrid: { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, width:'100%', height:'100%' },
  pasos: { background:'#f5f6fa', borderRadius:16, padding:20, marginBottom:24 },
  pasosTitle: { fontSize:13, fontWeight:700, color:'#0e0e0e', marginBottom:14 },
  pasoItem: { display:'flex', alignItems:'flex-start', gap:12, marginBottom:12, fontSize:13, color:'#555', lineHeight:1.5 },
  pasoNum: { width:24, height:24, borderRadius:'50%', background:'#e0001b', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 },
  btn: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
}