'use client'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export const META_PIXEL_ID = '1632044678338938'

// Sobrevive al remonte del componente (pasar de (marketing) a /onboarding
// desmonta un layout y monta el otro). Solo se resetea con una recarga
// real, que es justo cuando el snippet vuelve a mandar el PageView solo.
let ultimaRutaMedida = null

// Pixel de Meta. Va solo en el embudo de venta —landing, páginas por rubro
// y onboarding—, no en el layout raíz: las tarjetas de los clientes finales
// (/tarjeta, /mi-tarjeta, /c) son gente que nunca va a comprar Fielty y
// meterlas acá ensucia las audiencias y las manda a una red publicitaria
// sin motivo.
export default function MetaPixel() {
  const pathname = usePathname()

  // El snippet dispara el PageView de la carga inicial. Hoy todas las
  // navegaciones son <a href> (recarga completa), así que esto no hace
  // nada; queda para el día que alguien use <Link> y Next cambie de
  // página sin recargar, porque ahí Meta vería una sola visita por sesión.
  useEffect(() => {
    if (ultimaRutaMedida === pathname) return
    const esCargaInicial = ultimaRutaMedida === null
    ultimaRutaMedida = pathname
    if (esCargaInicial) return
    window.fbq?.('track', 'PageView')
  }, [pathname])

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* Un beacon de 1x1 de Meta, no una imagen: next/image lo rompería. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: 'none' }} alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  )
}
