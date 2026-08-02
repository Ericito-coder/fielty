'use client'
import { theme } from '@/lib/theme'
import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

// Extrae el UUID del cliente del contenido del QR. Acepta tanto la
// URL de la tarjeta (.../tarjeta/{id}) como un UUID pelado.
function extraerId(texto) {
  const m = String(texto).match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)
  return m ? m[0] : null
}

// Escáner de QR con la cámara del dispositivo. Llama a onDetectar(id)
// cuando reconoce el QR de una tarjeta Fielty. Prefiere la cámara
// trasera. Se cierra con onCerrar.
export default function EscanerQR({ onDetectar, onCerrar }) {
  const videoRef = useRef(null)
  const onDetectarRef = useRef(onDetectar)
  onDetectarRef.current = onDetectar
  const [error, setError] = useState('')

  useEffect(() => {
    let stream, raf, activo = true
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    async function iniciar() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.setAttribute('playsinline', 'true')
        await video.play()

        const tick = () => {
          if (!activo) return
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
            if (code) {
              const id = extraerId(code.data)
              if (id) { activo = false; onDetectarRef.current(id); return }
            }
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      } catch {
        setError('No se pudo acceder a la cámara. Revisá que el navegador tenga permiso.')
      }
    }
    iniciar()

    return () => {
      activo = false
      if (raf) cancelAnimationFrame(raf)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div style={{position:'fixed', inset:0, background:'#000', zIndex:10000, display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', color:'white'}}>
        <div style={{fontSize:16, fontWeight:700}}>Escaneá la tarjeta del cliente</div>
        <button onClick={onCerrar} style={{background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:10, width:44, height:44, color:'white', fontSize:20, cursor:'pointer', fontFamily:'inherit'}}>✕</button>
      </div>

      <div style={{flex:1, position:'relative', overflow:'hidden'}}>
        <video ref={videoRef} style={{width:'100%', height:'100%', objectFit:'cover'}} muted playsInline />
        {!error && (
          <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
            <div style={{width:230, height:230, border:'3px solid rgba(255,255,255,0.9)', borderRadius:24, boxShadow:'0 0 0 4000px rgba(0,0,0,0.45)'}} />
          </div>
        )}
        {error && (
          <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', padding:32}}>
            <div style={{textAlign:'center', color:'white'}}>
              <div style={{fontSize:40, marginBottom:12}}>📷</div>
              <div style={{fontSize:15, lineHeight:1.5, color:'#ccc'}}>{error}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{padding:'20px', textAlign:'center', color:theme.gray, fontSize:13}}>
        Pedile al cliente que abra su tarjeta o su pase de Google Wallet y apuntá la cámara al código.
      </div>
    </div>
  )
}
