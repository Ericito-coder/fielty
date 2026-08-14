'use client'
import { theme } from '@/lib/theme'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import FondoImpreso, { colorSolido } from '@/components/FondoImpreso'
import { generarCartelPng, descargarCartel } from '@/lib/cartelPng'

// Los mismos beneficios los usa el cartel en pantalla y el PNG que se
// descarga, así que se arman en un solo lugar.
function beneficiosDe(negocio) {
  return [
    ...(negocio.tieneRecompensas ? ['🎁 Canjeá recompensas exclusivas'] : []),
    ...(negocio.puntos_cumpleanos > 0 ? ['🎂 Puntos de regalo en tu cumpleaños'] : []),
    '🤝 Invitá amigos y ganás más puntos',
  ]
}

export default function QRPage({ params }) {
  const [negocio, setNegocio] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [cartel, setCartel] = useState(null)

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

  // El PNG se arma apenas está el QR y no al apretar el botón: en iOS la
  // hoja de compartir solo se abre si no se perdió el gesto del usuario, y
  // generar la imagen en el medio lo pierde.
  useEffect(() => {
    if (!qrUrl || !negocio) return
    let cancelado = false
    generarCartelPng({
      header: {
        color: negocio.color,
        iniciales: negocio.nombre.slice(0,2).toUpperCase(),
        nombre: negocio.nombre,
        subtitulo: 'Programa de fidelización',
      },
      headline: '¡Sumate y ganá puntos!',
      sub: ['Escaneá el código QR con tu celular,', 'registrate y empezá a acumular premios.'],
      qr: qrUrl,
      pasos: ['Escaneá el QR', 'Registrate', '¡Ganás puntos!'],
      flechas: true,
      beneficios: beneficiosDe(negocio),
    }).then(blob => { if (!cancelado) setCartel(blob) }).catch(() => {})
    return () => { cancelado = true }
  }, [qrUrl, negocio])

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
            onClick={() => descargarCartel(cartel, `cartel-${negocio.slug}.png`)}
            disabled={!cartel}
          >
            {cartel ? '⬇️ Descargar cartel' : 'Preparando cartel…'}
          </button>
        </div>

        <div style={s.page} className="print-page">
          {/* Header */}
          <div style={{...s.header, background: negocio.color}}>
            <FondoImpreso color={negocio.color} />
            <div style={s.bizLogo}>
              <FondoImpreso color="#ffffff" opacidad={0.2} />
              <span style={{position:'relative'}}>{negocio.nombre.slice(0,2).toUpperCase()}</span>
            </div>
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
                <div style={{...s.stepNum, background: negocio.color}}>
                  <FondoImpreso color={negocio.color} />
                  <span style={{position:'relative'}}>1</span>
                </div>
                <div style={s.stepText}>Escaneá el QR</div>
              </div>
              <div style={s.stepArrow}>→</div>
              <div style={s.step}>
                <div style={{...s.stepNum, background: negocio.color}}>
                  <FondoImpreso color={negocio.color} />
                  <span style={{position:'relative'}}>2</span>
                </div>
                <div style={s.stepText}>Registrate</div>
              </div>
              <div style={s.stepArrow}>→</div>
              <div style={s.step}>
                <div style={{...s.stepNum, background: negocio.color}}>
                  <FondoImpreso color={negocio.color} />
                  <span style={{position:'relative'}}>3</span>
                </div>
                <div style={s.stepText}>¡Ganás puntos!</div>
              </div>
            </div>

            {/* Beneficios */}
            <div style={s.benefits}>
              {beneficiosDe(negocio).map(b => <div key={b} style={s.benefit}>{b}</div>)}
            </div>

            {/* Footer */}
            <div style={s.footer}>
              <img src={colorSolido(theme.red)} alt="" aria-hidden="true" style={s.footerDot} />
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
  acciones: { display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' },
  printBtn: { padding:'12px 28px', background:theme.black, border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  descargarBtn: { padding:'12px 28px', background:'white', borderWidth:2, borderStyle:'solid', borderColor:theme.black, borderRadius:12, color:theme.black, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  descargarBtnEsperando: { borderColor:theme.grayLight, color:theme.gray, cursor:'default' },
  page: { background:'white', borderRadius:24, width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' },
  pageMini: { maxWidth:280 },
  header: { position:'relative', padding:'32px 28px 28px', textAlign:'center', color:'white' },
  bizLogo: { position:'relative', width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, margin:'0 auto 12px' },
  bizName: { position:'relative', fontSize:24, fontWeight:900, marginBottom:4 },
  bizSub: { position:'relative', fontSize:13, opacity:0.75 },
  content: { padding:'32px 28px' },
  headline: { fontSize:26, fontWeight:900, color:theme.black, textAlign:'center', marginBottom:8 },
  sub: { fontSize:14, color:theme.gray, textAlign:'center', lineHeight:1.6, marginBottom:28 },
  qrWrap: { display:'flex', justifyContent:'center', marginBottom:28, padding:16, background:'#f8f9fc', borderRadius:20 },
  qrImg: { width:200, height:200 },
  steps: { display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:24 },
  step: { display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  stepNum: { position:'relative', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:800 },
  stepText: { fontSize:11, fontWeight:600, color:theme.gray, textAlign:'center' },
  stepArrow: { fontSize:18, color:'#ccc', marginBottom:16 },
  benefits: { background:'#f8f9fc', borderRadius:16, padding:'16px 20px', marginBottom:24, display:'flex', flexDirection:'column', gap:10 },
  benefit: { fontSize:13, color:theme.grayMid, fontWeight:500 },
  footer: { display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
  footerDot: { position:'relative', width:8, height:8, borderRadius:'50%', background:theme.red, boxShadow:'0 0 6px #e0001b' },
  footerText: { fontSize:12, color:theme.grayLight, fontWeight:600 },
}