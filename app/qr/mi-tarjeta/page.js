'use client'
import { theme } from '@/lib/theme'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import FondoImpreso, { colorSolido } from '@/components/FondoImpreso'
import { generarCartelPng, descargarCartel } from '@/lib/cartelPng'
import { SITIO } from '@/lib/sitio'

export default function QRMiTarjeta() {
  const [qrUrl, setQrUrl] = useState('')
  const [cartel, setCartel] = useState(null)

  useEffect(() => {
    const url = `${SITIO}/mi-tarjeta`
    QRCode.toDataURL(url, {
      width: 800,   // se dibuja a 200px pero el PNG lo usa a 4x
      margin: 2,
      color: { dark: theme.black, light: '#ffffff' }
    }).then(setQrUrl)
  }, [])

  // El PNG se arma apenas está el QR y no al apretar el botón: en iOS la
  // hoja de compartir solo se abre si no se perdió el gesto del usuario, y
  // generar la imagen en el medio lo pierde.
  useEffect(() => {
    if (!qrUrl) return
    let cancelado = false
    generarCartelPng({
      header: { tipo: 'fielty', color: theme.black },
      headline: '¿Ya sos cliente?',
      sub: ['Escaneá el QR para ver tu tarjeta de puntos', 'y tus recompensas.'],
      qr: qrUrl,
      pasos: ['Escaneá el QR', 'Ingresá a tu cuenta', '¡Ves tus puntos!'],
    }).then(blob => { if (!cancelado) setCartel(blob) }).catch(() => {})
    return () => { cancelado = true }
  }, [qrUrl])

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
          /* Imprimir los fondos de color (cajas grises claras). Los bloques
             de color fuerte van con <img> (ver components/FondoImpreso)
             porque Safari de iOS ignora esta propiedad. */
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
        <div className="no-print" style={s.acciones}>
          <button style={s.printBtn} onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
          <button
            style={{...s.descargarBtn, ...(cartel ? {} : s.descargarBtnEsperando)}}
            onClick={() => descargarCartel(cartel, 'cartel-fielty.png')}
            disabled={!cartel}
          >
            {cartel ? '⬇️ Descargar cartel' : 'Preparando cartel…'}
          </button>
        </div>

        <div style={s.page} className="print-page">
          <div style={s.header}>
            <FondoImpreso color={theme.black} />
            <img src={colorSolido(theme.red)} alt="" aria-hidden="true" style={s.logoDot} />
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
                  <div style={s.stepNum}>
                    <FondoImpreso color={theme.black} />
                    <span style={{position:'relative'}}>{n}</span>
                  </div>
                  <div style={s.stepText}>{text}</div>
                </div>
              ))}
            </div>

            <div style={s.footer}>
              <img src={colorSolido(theme.red)} alt="" aria-hidden="true" style={s.footerDot} />
              <span style={s.footerText}>Powered by fielty</span>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:theme.bgMuted, padding:'40px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:24 },
  acciones: { display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' },
  printBtn: { padding:'12px 28px', background:theme.black, border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  descargarBtn: { padding:'12px 28px', background:'white', borderWidth:2, borderStyle:'solid', borderColor:theme.black, borderRadius:12, color:theme.black, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  descargarBtnEsperando: { borderColor:theme.grayLight, color:theme.gray, cursor:'default' },
  page: { background:'white', borderRadius:24, width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' },
  header: { position:'relative', background:theme.black, padding:'28px', display:'flex', alignItems:'center', justifyContent:'center', gap:10 },
  logoDot: { position:'relative', width:10, height:10, borderRadius:'50%', background:theme.red, boxShadow:'0 0 8px #e0001b' },
  logoText: { position:'relative', fontSize:22, fontWeight:900, color:'white', letterSpacing:-0.5 },
  content: { padding:'32px 28px' },
  headline: { fontSize:26, fontWeight:900, color:theme.black, textAlign:'center', marginBottom:8 },
  sub: { fontSize:14, color:theme.gray, textAlign:'center', lineHeight:1.6, marginBottom:28 },
  qrWrap: { display:'flex', justifyContent:'center', marginBottom:28, padding:16, background:'#f8f9fc', borderRadius:20 },
  qrImg: { width:200, height:200 },
  steps: { display:'flex', alignItems:'flex-start', justifyContent:'center', gap:16, marginBottom:28 },
  step: { display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:1 },
  stepNum: { position:'relative', width:32, height:32, borderRadius:'50%', background:theme.black, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:800 },
  stepText: { fontSize:11, fontWeight:600, color:theme.gray, textAlign:'center' },
  footer: { display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  footerDot: { position:'relative', width:8, height:8, borderRadius:'50%', background:theme.red, boxShadow:'0 0 6px #e0001b' },
  footerText: { fontSize:12, color:theme.grayLight, fontWeight:600 },
}
