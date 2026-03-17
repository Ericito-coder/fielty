'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

export default function QRPage({ params }) {
  const [negocio, setNegocio] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const canvasRef = useRef(null)

  useEffect(() => {
    params.then(p => {
      supabase.from('negocios').select('*').eq('slug', p.slug).single()
        .then(({ data }) => setNegocio(data))
    })
  }, [params])

  useEffect(() => {
    if (!negocio) return
    const url = `${window.location.origin}/registro?negocio=${negocio.id}`
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#0e0e0e', light: '#ffffff' }
    }).then(setQrUrl)
  }, [negocio])

  if (!negocio) return <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Cargando...</div>

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { box-shadow: none !important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
      `}</style>

      <div style={s.wrap}>
        <button className="no-print" style={s.printBtn} onClick={() => window.print()}>
          🖨️ Imprimir
        </button>

        <div style={s.page} className="print-page">
          {/* Header */}
          <div style={{...s.header, background: negocio.color}}>
            <div style={s.bizLogo}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
            <div style={s.bizName}>{negocio.nombre}</div>
            <div style={s.bizSub}>Programa de fidelización</div>
          </div>

          {/* Content */}
          <div style={s.content}>
            <div style={s.headline}>¡Sumate y ganá puntos!</div>
            <div style={s.sub}>Escaneá el código QR con tu celular,<br/>registrate y empezá a acumular premios.</div>

            {/* QR */}
            <div style={s.qrWrap}>
              {qrUrl && <img src={qrUrl} style={s.qrImg} alt="QR" />}
            </div>

            {/* Steps */}
            <div style={s.steps}>
              <div style={s.step}>
                <div style={{...s.stepNum, background: negocio.color}}>1</div>
                <div style={s.stepText}>Escaneá el QR</div>
              </div>
              <div style={s.stepArrow}>→</div>
              <div style={s.step}>
                <div style={{...s.stepNum, background: negocio.color}}>2</div>
                <div style={s.stepText}>Registrate</div>
              </div>
              <div style={s.stepArrow}>→</div>
              <div style={s.step}>
                <div style={{...s.stepNum, background: negocio.color}}>3</div>
                <div style={s.stepText}>¡Ganás puntos!</div>
              </div>
            </div>

            {/* Beneficios */}
            <div style={s.benefits}>
              <div style={s.benefit}>🎁 Canjeá recompensas exclusivas</div>
              <div style={s.benefit}>🎂 Puntos de regalo en tu cumpleaños</div>
              <div style={s.benefit}>🤝 Invitá amigos y ganás más puntos</div>
            </div>

            {/* Footer */}
            <div style={s.footer}>
              <div style={s.footerDot}></div>
              <span style={s.footerText}>Powered by fielty</span>
            </div>
          </div>
        </div>

        {/* Versión mini para mostrador */}
        <div style={{...s.page, ...s.pageMini}} className="print-page no-print">
          <div style={{background: negocio.color, padding:'16px 20px', display:'flex', alignItems:'center', gap:12}}>
            <div style={{...s.bizLogo, width:36, height:36, fontSize:13}}>{negocio.nombre.slice(0,2).toUpperCase()}</div>
            <div>
              <div style={{...s.bizName, fontSize:16}}>{negocio.nombre}</div>
              <div style={{...s.bizSub, fontSize:11}}>Programa de puntos</div>
            </div>
          </div>
          <div style={{padding:20, textAlign:'center'}}>
            <div style={{fontSize:15, fontWeight:800, color:'#0e0e0e', marginBottom:4}}>¡Sumate y ganá puntos!</div>
            <div style={{fontSize:12, color:'#888', marginBottom:16}}>Escaneá con tu celular</div>
            {qrUrl && <img src={qrUrl} style={{width:150, height:150}} alt="QR" />}
            <div style={{fontSize:11, color:'#aaa', marginTop:12}}>Powered by fielty</div>
          </div>
        </div>
      </div>
    </>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#f0f2f7', padding:'40px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:24 },
  printBtn: { padding:'12px 28px', background:'#0e0e0e', border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  page: { background:'white', borderRadius:24, width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' },
  pageMini: { maxWidth:280 },
  header: { padding:'32px 28px 28px', textAlign:'center', color:'white' },
  bizLogo: { width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, margin:'0 auto 12px' },
  bizName: { fontSize:24, fontWeight:900, marginBottom:4 },
  bizSub: { fontSize:13, opacity:0.75 },
  content: { padding:'32px 28px' },
  headline: { fontSize:26, fontWeight:900, color:'#0e0e0e', textAlign:'center', marginBottom:8 },
  sub: { fontSize:14, color:'#888', textAlign:'center', lineHeight:1.6, marginBottom:28 },
  qrWrap: { display:'flex', justifyContent:'center', marginBottom:28, padding:16, background:'#f8f9fc', borderRadius:20 },
  qrImg: { width:200, height:200 },
  steps: { display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:24 },
  step: { display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  stepNum: { width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:800 },
  stepText: { fontSize:11, fontWeight:600, color:'#888', textAlign:'center' },
  stepArrow: { fontSize:18, color:'#ccc', marginBottom:16 },
  benefits: { background:'#f8f9fc', borderRadius:16, padding:'16px 20px', marginBottom:24, display:'flex', flexDirection:'column', gap:10 },
  benefit: { fontSize:13, color:'#555', fontWeight:500 },
  footer: { display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  footerDot: { width:8, height:8, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 6px #e0001b' },
  footerText: { fontSize:12, color:'#aaa', fontWeight:600 },
}