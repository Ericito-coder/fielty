'use client'
import { useEffect } from 'react'

// Registra el service worker (PWA instalable + tarjeta offline)
export default function RegistrarSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    // Si entra un service worker nuevo (deploy con sw.js actualizado) y
    // toma el control mientras la pestaña ya estaba abierta, la página
    // sigue corriendo el JS viejo hasta que recarga. Recargamos una sola
    // vez para que quede al día sin que el usuario tenga que darse cuenta.
    let yaRecargando = false
    const alCambiarController = () => {
      if (yaRecargando) return
      yaRecargando = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', alCambiarController)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', alCambiarController)
  }, [])
  return null
}
