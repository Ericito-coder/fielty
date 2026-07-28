import FaqClient from './FaqClient'
import { FAQS } from './faqData'

export const metadata = {
  title: 'Preguntas frecuentes sobre Fielty | Fidelización de clientes sin app',
  description: 'Cómo funciona Fielty: registro de clientes, acreditación de puntos, canje de premios, planes y precios, seguridad de los datos. Todo lo que necesitás saber antes de empezar.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Preguntas frecuentes sobre Fielty',
    description: 'Cómo funciona el programa de puntos de Fielty: registro, puntos, premios, planes y seguridad.',
    url: '/faq',
    siteName: 'Fielty',
    locale: 'es_AR',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.flatMap((cat) =>
    cat.preguntas.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
  ),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqClient />
    </>
  )
}
