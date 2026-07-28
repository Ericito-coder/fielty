import LandingClient from './LandingClient'

export const metadata = {
  title: 'Fielty — Programa de fidelización y puntos para negocios sin app',
  description: 'Creá un programa de puntos para tu negocio en 5 minutos. Tus clientes escanean un QR, suman puntos y canjean premios desde el celular, sin instalar nada. Ideal para peluquerías, cafeterías, veterinarias y comercios en Argentina.',
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
    card: 'summary',
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
  url: 'https://fielty.app',
  description: 'Sistema de fidelización de clientes con programa de puntos, niveles y referidos para negocios físicos. Sin app, funciona desde el navegador vía QR.',
  offers: [
    { '@type': 'Offer', name: 'Gratis', price: '0', priceCurrency: 'ARS', description: 'Hasta 50 clientes, 1 sucursal, puntos, niveles y referidos.' },
    { '@type': 'Offer', name: 'Pro', price: '10000', priceCurrency: 'ARS', description: 'Clientes ilimitados, hasta 3 sucursales, campañas de email, logo personalizado.' },
    { '@type': 'Offer', name: 'Business', price: '35000', priceCurrency: 'ARS', description: 'Sucursales ilimitadas, tarjeta en Google Wallet, soporte prioritario.' },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Fielty',
    url: 'https://fielty.app',
    email: 'hola@fielty.app',
  },
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
