'use client'
import { useEffect, useRef, useState } from 'react'
import { theme } from '@/lib/theme'

/**
 * Botón que copia un texto al portapapeles y lo confirma en el propio
 * botón ("✓ ¡Copiado!" en verde por 2,5s).
 *
 * La caja y el onboarding ya hacían esto a mano, pero los botones del
 * dashboard copiaban en silencio: el dueño tocaba "Copiar link", no
 * pasaba nada visible y volvía a tocar, sin saber nunca si el link
 * estaba en el portapapeles o no. Esto unifica los tres lugares en un
 * solo componente para que no vuelvan a divergir.
 *
 * A diferencia de las versiones a mano, acá el fallo se muestra en vez
 * de tragarse: `navigator.clipboard` no existe fuera de contexto seguro
 * y algunos navegadores lo rechazan sin avisar. En los cuatro usos del
 * dashboard la URL está escrita arriba del botón, así que el mensaje de
 * error manda al usuario a copiarla de ahí.
 */
export default function BotonCopiar({ texto, label = '📋 Copiar link', style, onCopiado }) {
  const [estado, setEstado] = useState('listo') // 'listo' | 'copiado' | 'error'
  const timer = useRef(null)

  // Si el componente se desmonta antes de que venza el timer (el dueño
  // cambia de sección del dashboard justo después de copiar), el
  // setEstado caería sobre un componente muerto.
  useEffect(() => () => clearTimeout(timer.current), [])

  function avisar(nuevo) {
    setEstado(nuevo)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setEstado('listo'), 2500)
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      avisar('error')
      return
    }
    onCopiado?.()
    avisar('copiado')
  }

  const fondo = estado === 'copiado' ? theme.green
    : estado === 'error' ? theme.gold
    : style?.background

  return (
    <button
      type="button"
      onClick={copiar}
      // El texto del botón es la única confirmación que hay, así que
      // tiene que llegar también a un lector de pantalla.
      aria-live="polite"
      style={{...style, background: fondo, transition:'background 0.2s'}}>
      {estado === 'copiado' ? '✓ ¡Copiado!'
        : estado === 'error' ? '⚠ Copialo de arriba'
        : label}
    </button>
  )
}
