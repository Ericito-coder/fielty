'use client'
import { theme } from '@/lib/theme'
import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRPage({ params }) {
  const [negocio, setNegocio] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const canvasRef = useRef(null)

  useEffect(() => {
    params.then(p => {
      fetch(`/api/negocio-publico?slug=${encodeURIComponent(p.slug)}`)
        .then(res => res.ok ? res.json() : { negocio: null })
        .then(({ negocio: data }) => setNegocio(data))
        .catch(() => {})
    })
  }, [params])

  useEffect(() => {
    if (!negocio) return
    const url = `${window.location.origin}/registro/${negocio.slug}`
    QRCode.toDataURL(url, {
      width: 800,
      margin: 2,
      color: { dark: theme.black, light: '#ffffff' }
    }).then(setQrUrl)
  }, [negocio])

  if (!negocio) return <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Cargando...</div>

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          /* Imprimir los fondos de color (header, cajas grises, numeros de pasos) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-wrap {
            min-height: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            display: block !important;
          }
          .print-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: none !important;
            width: 440px !important;
            margin: 0 auto !important;
            zoom: 1.15;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <main style={s.wrap} className="print-wrap">
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
              {negocio.tieneRecompensas && <div style={s.benefit}>🎁 Canjeá recompensas exclusivas</div>}
              {negocio.puntos_cumpleanos > 0 && <div style={s.benefit}>🎂 Puntos de regalo en tu cumpleaños</div>}
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
            <div style={{fontSize:15, fontWeight:800, color:theme.black, marginBottom:4}}>¡Sumate y ganá puntos!</div>
            <div style={{fontSize:12, color:theme.gray, marginBottom:16}}>Escaneá con tu celular</div>
            {qrUrl && <img src={qrUrl} style={{width:150, height:150}} alt="QR" />}
            <div style={{fontSize:11, color:theme.grayLight, marginTop:12}}>Powered by fielty</div>
          </div>
        </div>
      </main>
    </>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:theme.bgMuted, padding:'40px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:24 },
  printBtn: { padding:'12px 28px', background:theme.black, border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  page: { background:'white', borderRadius:24, width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' },
  pageMini: { maxWidth:280 },
  header: { padding:'32px 28px 28px', textAlign:'center', color:'white' },
  bizLogo: { width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, margin:'0 auto 12px' },
  bizName: { fontSize:24, fontWeight:900, marginBottom:4 },
  bizSub: { fontSize:13, opacity:0.75 },
  content: { padding:'32px 28px' },
  headline: { fontSize:26, fontWeight:900, color:theme.black, textAlign:'center', marginBottom:8 },
  sub: { fontSize:14, color:theme.gray, textAlign:'center', lineHeight:1.6, marginBottom:28 },
  qrWrap: { display:'flex', justifyContent:'center', marginBottom:28, padding:16, background:'#f8f9fc', borderRadius:20 },
  qrImg: { width:200, height:200 },
  steps: { display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:24 },
  step: { display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  stepNum: { width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:800 },
  stepText: { fontSize:11, fontWeight:600, color:theme.gray, textAlign:'center' },
  stepArrow: { fontSize:18, color:'#ccc', marginBottom:16 },
  benefits: { background:'#f8f9fc', borderRadius:16, padding:'16px 20px', marginBottom:24, display:'flex', flexDirection:'column', gap:10 },
  benefit: { fontSize:13, color:theme.grayMid, fontWeight:500 },
  footer: { display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  footerDot: { width:8, height:8, borderRadius:'50%', background:theme.red, boxShadow:'0 0 6px #e0001b' },
  footerText: { fontSize:12, color:theme.grayLight, fontWeight:600 },
}