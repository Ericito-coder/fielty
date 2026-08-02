'use client'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function QRMiTarjeta() {
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    const url = `${window.location.origin}/mi-tarjeta`
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#0e0e0e', light: '#ffffff' }
    }).then(setQrUrl)
  }, [])

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { box-shadow: none !important; }
        }
      `}</style>

      <div style={s.wrap}>
        <button className="no-print" style={s.printBtn} onClick={() => window.print()}>
          🖨️ Imprimir
        </button>

        <div style={s.page} className="print-page">
          <div style={s.header}>
            <div style={s.logoDot} />
            <div style={s.logoText}>fielty</div>
          </div>

          <div style={s.content}>
            <div style={s.headline}>¿Ya sos cliente?</div>
            <div style={s.sub}>Escaneá el QR para ver tu tarjeta de puntos y tus recompensas.</div>

            <div style={s.qrWrap}>
              {qrUrl && <img src={qrUrl} style={s.qrImg} alt="QR mi tarjeta" />}
            </div>

            <div style={s.steps}>
              {[
                { n:1, text:'Escaneá el QR' },
                { n:2, text:'Ingresá a tu cuenta' },
                { n:3, text:'¡Ves tus puntos!' },
              ].map(({ n, text }) => (
                <div key={n} style={s.step}>
                  <div style={s.stepNum}>{n}</div>
                  <div style={s.stepText}>{text}</div>
                </div>
              ))}
            </div>

            <div style={s.footer}>
              <div style={s.footerDot} />
              <span style={s.footerText}>Powered by fielty</span>
            </div>
          </div>
        </div>

        {/* Versión mini para mostrador */}
        <div style={{...s.page, maxWidth:280}} className="print-page no-print">
          <div style={{...s.header, padding:'16px 20px'}}>
            <div style={{...s.logoDot, width:8, height:8}} />
            <div style={{...s.logoText, fontSize:16}}>fielty</div>
          </div>
          <div style={{padding:20, textAlign:'center'}}>
            <div style={{fontSize:15, fontWeight:800, color:'#0e0e0e', marginBottom:4}}>¿Ya sos cliente?</div>
            <div style={{fontSize:12, color:'#666', marginBottom:16}}>Escaneá para ver tu tarjeta</div>
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
  header: { background:'#0e0e0e', padding:'28px', display:'flex', alignItems:'center', justifyContent:'center', gap:10 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 8px #e0001b' },
  logoText: { fontSize:22, fontWeight:900, color:'white', letterSpacing:-0.5 },
  content: { padding:'32px 28px' },
  headline: { fontSize:26, fontWeight:900, color:'#0e0e0e', textAlign:'center', marginBottom:8 },
  sub: { fontSize:14, color:'#666', textAlign:'center', lineHeight:1.6, marginBottom:28 },
  qrWrap: { display:'flex', justifyContent:'center', marginBottom:28, padding:16, background:'#f8f9fc', borderRadius:20 },
  qrImg: { width:200, height:200 },
  steps: { display:'flex', alignItems:'flex-start', justifyContent:'center', gap:16, marginBottom:28 },
  step: { display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:1 },
  stepNum: { width:32, height:32, borderRadius:'50%', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:800 },
  stepText: { fontSize:11, fontWeight:600, color:'#666', textAlign:'center' },
  footer: { display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  footerDot: { width:8, height:8, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 6px #e0001b' },
  footerText: { fontSize:12, color:'#aaa', fontWeight:600 },
}
