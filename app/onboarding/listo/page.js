'use client'
import { theme } from '@/lib/theme'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import QRCode from 'qrcode'

export default function Listo() {
  const [negocio, setNegocio] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    const id = storage.get('fielty_negocio_id')
    if (!id) return
    supabase
      .from('negocios')
      .select('*')
      .eq('id', id)
      .single()
      .then(async ({ data }) => {
        setNegocio(data)
        const yaEnviado = storage.get('fielty_bienvenida_enviada')
        if (!yaEnviado) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            fetch('/api/bienvenida', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ negocioId: data.id }),
            }).catch(() => {})
            storage.set('fielty_bienvenida_enviada', '1')
          }
        }
      })
  }, [])

  useEffect(() => {
    if (!negocio) return
    const plan = storage.get('fielty_plan')
    if (plan && plan !== 'gratis') {
      setTimeout(() => { window.location.href = '/dashboard/upgrade' }, 1800)
    }
    // Generar QR real
    const url = `${window.location.origin}/registro/${negocio.slug}`
    QRCode.toDataURL(url, { width: 200, margin: 1, color: { dark: theme.black, light: '#ffffff' } })
      .then(setQrUrl)
  }, [negocio])

  function copiarLink() {
    const url = `${window.location.origin}/registro/${negocio.slug}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  if (!negocio) return (
    <div style={s.wrap}>
      <div style={{color:theme.gray, fontSize:16}}>Cargando...</div>
    </div>
  )

  const registroUrl = `${window.location.origin}/registro/${negocio.slug}`
  const cajaUrl = `${window.location.origin}/c/${negocio.slug}`

  return (
    <div style={s.wrap}>
      <main style={s.card}>
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
          <button style={{...s.copyBtn, background: copiado ? theme.green : theme.black}} onClick={copiarLink}>
            {copiado ? '✓ ¡Copiado!' : '📋 Copiar link'}
          </button>
        </div>

        {/* QR real */}
        <div style={s.qrWrap}>
          <div style={s.qrLabel}>QR para imprimir en tu local</div>
          <div style={s.qrBox}>
            {qrUrl
              ? <img src={qrUrl} alt="QR de registro" style={{width:132, height:132}} />
              : <div style={{width:132, height:132, background:theme.bgMuted, borderRadius:8}} />
            }
          </div>
          <div style={{fontSize:12, color:theme.gray, textAlign:'center', marginBottom:8}}>
            Escaneá para registrarse en {negocio.nombre}
          </div>
          <div style={{textAlign:'center'}}>
            <a href={`/qr/${negocio.slug}`} target="_blank" rel="noreferrer"
              style={{fontSize:13, color:theme.red, fontWeight:700, textDecoration:'none'}}>
              Ver QR completo para imprimir →
            </a>
          </div>
        </div>

        {/* Probar el circuito antes de abrir */}
        <div style={s.pasos}>
          <div style={s.pasosTitle}>Probalo antes de abrir</div>
          <p style={s.pasosIntro}>
            Hacé el circuito completo una vez, con vos mismo de cliente. Son dos minutos
            y te evita descubrir algo raro con un cliente esperando en el mostrador.
          </p>

          <a href={registroUrl} target="_blank" rel="noreferrer" style={s.pasoBtn}>
            <span style={s.pasoNum}>1</span>
            <span style={s.pasoTexto}>Registrate con tu propio link</span>
            <span style={s.pasoFlecha}>→</span>
          </a>

          <a href={cajaUrl} target="_blank" rel="noreferrer" style={s.pasoBtn}>
            <span style={s.pasoNum}>2</span>
            <span style={s.pasoTexto}>Cargate una compra desde la caja</span>
            <span style={s.pasoFlecha}>→</span>
          </a>

          <a href={`/qr/${negocio.slug}`} target="_blank" rel="noreferrer" style={s.pasoBtn}>
            <span style={s.pasoNum}>3</span>
            <span style={s.pasoTexto}>Imprimí el QR para el mostrador</span>
            <span style={s.pasoFlecha}>→</span>
          </a>

          <div style={s.pasosNota}>
            Para entrar a la caja usás el PIN que acabás de elegir. Es la misma
            dirección que le vas a pasar a tus empleados.
          </div>
        </div>

        <button style={s.btn} onClick={() => {
          const plan = storage.get('fielty_plan')
          window.location.href = (plan && plan !== 'gratis') ? '/dashboard/upgrade' : '/dashboard'
        }}>
          {typeof window !== 'undefined' && storage.get('fielty_plan') && storage.get('fielty_plan') !== 'gratis'
            ? 'Completar pago →'
            : 'Ir al panel →'}
        </button>
      </main>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:theme.black, display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:24 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:theme.red, boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:theme.black, letterSpacing:-0.5 },
  celebracion: { fontSize:52, marginBottom:16, textAlign:'center' },
  title: { fontSize:28, fontWeight:800, color:theme.black, marginBottom:8, lineHeight:1.2 },
  sub: { fontSize:14, color:theme.gray, marginBottom:24, lineHeight:1.6 },
  linkCard: { background:theme.bgMuted2, borderRadius:16, padding:20, marginBottom:20 },
  linkLabel: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:theme.gray, marginBottom:8 },
  linkUrl: { fontSize:12, color:theme.black, fontFamily:'monospace', wordBreak:'break-all', marginBottom:12, lineHeight:1.5 },
  copyBtn: { padding:'10px 16px', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background 0.2s' },
  qrWrap: { marginBottom:24 },
  qrLabel: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:theme.gray, marginBottom:12, textAlign:'center' },
  qrBox: { width:160, height:160, background:theme.bgMuted2, borderRadius:16, margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center' },
  pasos: { background:theme.bgMuted2, borderRadius:16, padding:20, marginBottom:24 },
  pasosTitle: { fontSize:13, fontWeight:700, color:theme.black, marginBottom:8 },
  pasosIntro: { fontSize:13, color:theme.gray, lineHeight:1.6, margin:'0 0 16px' },
  pasoBtn: { display:'flex', alignItems:'center', gap:12, background:'white', border:'1px solid #e8eaf0', borderRadius:12, padding:'12px 14px', marginBottom:8, textDecoration:'none' },
  pasoTexto: { flex:1, fontSize:13, fontWeight:600, color:theme.black, lineHeight:1.4 },
  pasoFlecha: { fontSize:14, color:theme.red, fontWeight:700, flexShrink:0 },
  pasosNota: { fontSize:12, color:theme.gray, lineHeight:1.6, marginTop:12 },
  pasoNum: { width:24, height:24, borderRadius:'50%', background:theme.red, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 },
  btn: { width:'100%', padding:18, background:theme.red, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
}
