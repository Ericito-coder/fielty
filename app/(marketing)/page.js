import LandingClient from './LandingClient'

// La home es estática y se regenera cada 6 horas.
export const revalidate = 21600

export const metadata = {
  title: 'Fielty — Programa de fidelización y puntos para negocios sin app',
  description: 'Programa de fidelización con puntos por QR para negocios en Argentina. Tus clientes suman en cada compra, sin instalar nada. Gratis hasta 50 clientes.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Fielty — Fidelización de clientes sin app',
    description: 'Programa de puntos con QR, niveles y referidos para negocios físicos en Argentina. Empezá gratis.',
    url: '/',
    siteName: 'Fielty',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fielty — Fidelización de clientes sin app',
    description: 'Programa de puntos con QR, niveles y referidos para negocios físicos en Argentina.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Fielty',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://www.fielty.app',
  description: 'Sistema de fidelización de clientes con programa de puntos, niveles y referidos para negocios físicos. Sin app, funciona desde el navegador vía QR.',
  offers: [
    { '@type': 'Offer', name: 'Gratis', price: '0', priceCurrency: 'ARS', description: 'Hasta 50 clientes, 1 sucursal, puntos, niveles, referidos y tarjeta de cliente en Google Wallet.' },
    { '@type': 'Offer', name: 'Pro', price: '20000', priceCurrency: 'ARS', description: 'Clientes ilimitados, hasta 3 sucursales, campañas de email, tu logo en la tarjeta del cliente y en Google Wallet.' },
    { '@type': 'Offer', name: 'Business', price: '35000', priceCurrency: 'ARS', description: 'Sucursales ilimitadas, WhatsApp automático y soporte prioritario.' },
  ],
  // Referencia al Organization que define app/layout.js, en vez de volver a
  // declararlo. Antes había dos nodos para la misma marca y con logos
  // distintos, y eso deja a Google sin saber cuál es la entidad real.
  provider: { '@id': 'https://www.fielty.app/#organization' },
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingClient />
    </>
  )
}
