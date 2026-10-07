import { s } from '../para/estilos'

// Página para quien busca "tarjeta de fidelización", "tarjeta de fidelidad
// digital" o "tarjeta de sellos digital". Son las búsquedas con más volumen
// de todo el rubro en Argentina (Planificador de Google Ads, 06/10/2026) y
// hasta acá ninguna página del sitio hablaba de la tarjeta en sí: todas
// hablan del programa de puntos visto desde el dueño.

export const metadata = {
  title: 'Tarjeta de fidelización digital para tu negocio | Fielty',
  description: 'Tarjeta de fidelización digital con puntos: tus clientes la abren desde un QR, sin instalar nada, y la guardan en Google Wallet. Gratis hasta 30 clientes.',
  alternates: { canonical: '/tarjeta-de-fidelizacion-digital' },
  openGraph: {
    title: 'Tarjeta de fidelización digital para tu negocio | Fielty',
    description: 'La tarjeta de puntos de tu negocio en el celular del cliente. Sin cartón y sin app.',
    url: '/tarjeta-de-fidelizacion-digital',
    siteName: 'Fielty',
    locale: 'es_AR',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Fielty', item: 'https://www.fielty.app' },
    { '@type': 'ListItem', position: 2, name: 'Tarjeta de fidelización digital', item: 'https://www.fielty.app/tarjeta-de-fidelizacion-digital' },
  ],
}

// La primera define la entidad completa (qué es, en qué país y a qué
// precio) para que la página se sostenga sola como respuesta.
const FAQS = [
  {
    q: '¿Qué es una tarjeta de fidelización digital y cuánto cuesta con Fielty?',
    a: 'Es la tarjeta de puntos de tu negocio, pero en el celular del cliente en vez de en un cartón. Con Fielty, un programa de fidelización para negocios físicos en Argentina, el cliente escanea el QR de tu mostrador, se registra en menos de un minuto y ya tiene su tarjeta con sus puntos y sus premios. El plan gratis cubre hasta 30 clientes y los planes pagos arrancan en $20.000 por mes con clientes ilimitados.',
  },
  {
    q: '¿Mis clientes tienen que descargar una app para tener la tarjeta?',
    a: 'No. La tarjeta se abre desde el navegador del celular, escaneando el QR o entrando al link de tu negocio. Si quieren tenerla más a mano, la pueden guardar en Google Wallet, pero no es obligatorio.',
  },
  {
    q: '¿Qué pasa si el cliente cambia de celular o lo pierde?',
    a: 'No pierde nada. Los puntos están guardados en su cuenta y no en el teléfono. Desde el celular nuevo entra a fielty.app/mi-tarjeta con su DNI y su contraseña y vuelve a ver su tarjeta como siempre.',
  },
  {
    q: '¿La tarjeta puede llevar el nombre y el logo de mi negocio?',
    a: 'El nombre y el color de tu marca van en todos los planes, incluido el gratis. El logo de tu negocio en la tarjeta y en Google Wallet está incluido en los planes pagos.',
  },
  {
    q: '¿En qué se diferencia de la tarjeta de sellos de cartón?',
    a: 'La lógica es la misma: el cliente junta en cada compra y cuando llega canjea un premio. La diferencia es que no se pierde ni queda olvidada en casa, el cliente ve en todo momento cuánto le falta, y vos ves desde tu panel quiénes son tus clientes más fieles y quiénes hace tiempo que no aparecen. Con el cartón esa información no queda en ningún lado.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function TarjetaDeFidelizacionDigital() {
  return (
    <div style={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* NAV */}
      <nav style={s.nav}>
        <a href="/" style={s.navLogo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>fielty</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/login" style={s.navLink}>Ingresar</a>
          <a href="/onboarding/registro" style={s.navCta}>Empezá gratis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.heroWrap}>
        <div style={s.hero}>
          <div style={s.badge}>Tarjeta de fidelización digital</div>
          <h1 style={s.h1}>
            La tarjeta de puntos<br />
            <span style={s.gradient}>que no se pierde.</span>
          </h1>
          <p style={s.heroSub}>
            Fielty reemplaza la tarjeta de cartón por una tarjeta de fidelización digital. Tu cliente escanea un QR en el mostrador y la tiene en el celular, con sus puntos al día y sin instalar ninguna app.
          </p>
          <div style={s.ctaRow}>
            <a href="/onboarding/registro" style={s.ctaPrimary}>Empezá gratis</a>
            <a href="/faq" style={s.ctaSecondary}>Ver preguntas frecuentes</a>
          </div>
        </div>
      </section>

      {/* QUÉ CAMBIA */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Qué cambia frente a la tarjeta de cartón</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Siempre la tienen encima</h3>
              <p style={s.cardText}>
                El cartón queda en otra billetera, en un cajón o se moja. El celular lo tienen en la mano cuando pagan, así que la tarjeta está ahí cada vez que compran.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Ven cuánto les falta</h3>
              <p style={s.cardText}>
                Cada cliente ve sus puntos y los premios que puede canjear en cualquier momento. Saber que le faltan dos compras para el premio es lo que lo hace volver a tu negocio y no a otro.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Vos sabés quién vuelve</h3>
              <p style={s.cardText}>
                Con el cartón no queda registro de nada. Acá ves desde tu panel cuántos clientes tenés, quiénes son los más activos y quiénes hace tiempo que no aparecen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO */}
      <section style={{ ...s.section, background: '#0a0a0a' }}>
        <div style={s.inner}>
          <h2 style={s.h2}>Cómo la recibe tu cliente</h2>
          <p style={s.sectionSub}>
            No hay nada que repartir ni que imprimir por cliente. Imprimís un solo cartel con el QR de tu negocio y cada uno se arma su tarjeta.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <h3 style={s.stepTitle}>Escanea el QR del mostrador</h3>
                <p style={s.stepText}>Con la cámara del celular, mientras paga. Completa sus datos en menos de un minuto y la tarjeta ya es suya. También le podés pasar el link por WhatsApp o ponerlo en tu Instagram.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <h3 style={s.stepTitle}>La abre cuando quiere</h3>
                <p style={s.stepText}>La tarjeta vive en el navegador, con el nombre y el color de tu negocio. Si prefiere tenerla junto a sus otras tarjetas, la guarda en Google Wallet con un toque.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <h3 style={s.stepTitle}>Suma en cada compra y canjea</h3>
                <p style={s.stepText}>Vos cargás el monto desde la caja y los puntos le aparecen al instante. Cuando llega al premio lo pide desde su tarjeta y te muestra un código, que validás antes de entregárselo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUÉ TRAE */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Lo que trae cada tarjeta</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Niveles</h3>
              <p style={s.cardText}>
                Bronce, Plata y Oro. Vos definís cuántos puntos hacen falta para subir y qué beneficio extra da cada nivel, para premiar más a los que más vienen.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Puntos de cumpleaños</h3>
              <p style={s.cardText}>
                El día de su cumpleaños le entran puntos de regalo de forma automática. Vos no tenés que acordarte de nada.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Link para invitar amigos</h3>
              <p style={s.cardText}>
                Cada tarjeta tiene su propio link de referido. Si alguien se registra desde ahí, suman puntos los dos: el que invitó y el que llega.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre la tarjeta digital</h2>
          <div style={s.faqList}>
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 style={s.faqQ}>{f.q}</h3>
                <p style={s.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ ...s.section, background: '#0a0a0a', textAlign: 'center' }}>
        <div style={{ ...s.inner, maxWidth: 600 }}>
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Armá la tarjeta de tu negocio</h2>
          <p style={{ ...s.sectionSub, marginBottom: 32 }}>
            El plan gratis te sirve hasta 30 clientes, sin tarjeta de crédito. Se configura en cinco minutos.
          </p>
          <a href="/onboarding/registro" style={{ ...s.ctaPrimary, fontSize: 17, padding: '17px 38px' }}>
            Empezá gratis
          </a>
        </div>
      </section>

      {/* RELACIONADAS */}
      <section style={s.otros}>
        <div style={s.otrosTexto}>
          También podés ver{' '}
          <a href="/app-para-fidelizar-clientes" style={s.otrosLink}>cómo funciona sin app</a>,{' '}
          <a href="/software-de-fidelizacion-de-clientes" style={s.otrosLink}>qué incluye y cuánto cuesta</a> o{' '}
          <a href="/para" style={s.otrosLink}>cómo se usa en tu rubro</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <a href="/terminos" style={s.footerLink}>Términos</a>
        <a href="/privacidad" style={s.footerLink}>Privacidad</a>
        <a href="/faq" style={s.footerLink}>FAQ</a>
        <a href="/guia" style={s.footerLink}>Guía completa</a>
        <a href="/" style={s.footerLink}>fielty.app</a>
      </footer>
    </div>
  )
}
