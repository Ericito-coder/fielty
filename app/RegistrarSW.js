'use client'
import { useEffect } from 'react'

// Registra el service worker (PWA instalable + tarjeta offline)
export default function RegistrarSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
