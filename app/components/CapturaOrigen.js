'use client'
import { useEffect } from 'react'
import { capturarOrigen } from '@/lib/origen'

// Va en los mismos layouts que el pixel: el embudo de venta. En las
// tarjetas de los clientes finales no hay nada que atribuir.
export default function CapturaOrigen() {
  useEffect(() => { capturarOrigen() }, [])
  return null
}
