import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para kioscos y despensas | Fielty',
  description: 'Sistema de fidelización para kioscos y despensas: tus clientes escanean un QR, suman puntos en cada compra y eligen tu mostrador todos los días. Sin app. Empezá gratis.',
  alternates: { canonical: '/para/kioscos' },
  openGraph: {
    title: 'Programa de puntos para kioscos y despensas | Fielty',
    description: 'El negocio de más frecuencia de todos. Programa de puntos con QR para kioscos, sin app.',
    url: '/para/kioscos',
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
    { '@type': 'ListItem', position: 2, name: 'Kioscos', item: 'https://www.fielty.app/para/kioscos' },
  ],
}

const FAQS_RUBRO = [
  {
    q: '¿Puedo excluir algunos productos de la regla de puntos, como cigarrillos o recargas de celular?',
    a: 'Sí. Vos decidís qué cargar desde la caja: si una venta no tiene margen suficiente como para sumar puntos, simplemente no la cargás y el resto de la compra sigue sumando normal.',
  },
  {
    q: '¿Sirve si la mayoría de mis clientes gastan poco por visita?',
    a: 'Es justo donde más rinde. Como vienen muy seguido, conviene un premio que se alcance rápido —a las dos o tres semanas, no a los dos meses— para que el punto se sienta ganado y no una meta lejana.',
  },
  {
    q: '¿Necesito caja registradora o algún sistema de facturación conectado?',
    a: 'No. Cargás el monto de la venta a mano, desde el celular o la computadora que ya tenés en el mostrador. No hace falta integrarlo con nada.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS_RUBRO.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function ParaKioscos() {
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
          <div style={s.badge}>Para kioscos y despensas</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu kiosco.</span>
          </h1>
          <p style={s.heroSub}>
            Sos el negocio al que más veces por semana entra el mismo cliente. Fielty le da una razón para que ese mostrador sea siempre el tuyo y no el de la otra esquina, sin que tenga que instalar ninguna app.
          </p>
          <div style={s.ctaRow}>
            <a href="/onboarding/registro" style={s.ctaPrimary}>Empezá gratis</a>
            <a href="/faq" style={s.ctaSecondary}>Ver preguntas frecuentes</a>
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Por qué funciona en un kiosco</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Es el rubro de mayor frecuencia</h3>
              <p style={s.cardText}>
                Un mismo cliente puede pasar varias veces por semana, a veces por día. Eso significa que los puntos se acumulan rápido y el premio llega antes que en cualquier otro rubro.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>La competencia está en la vereda de enfrente</h3>
              <p style={s.cardText}>
                Casi todos los kioscos venden lo mismo. Cuando el producto es idéntico, lo único que hace que alguien elija el tuyo y no el de al lado son los puntos que ya tiene acumulados con vos.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Cada compra es chica, pero se repiten todo el tiempo</h3>
              <p style={s.cardText}>
                Nadie deja de venir por una sola compra perdida. El negocio se pierde de a poco, cuando alguien empieza a comprar del otro lado sin que te des cuenta. Los puntos son la razón para que no arranque a probar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO */}
      <section style={{ ...s.section, background: '#0a0a0a' }}>
        <div style={s.inner}>
          <h2 style={s.h2}>Cómo queda armado</h2>
          <p style={s.sectionSub}>
            La tarjetita de cartón con sellos ya hacía esto. Fielty es lo mismo, pero vive en el celular del cliente.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <h3 style={s.stepTitle}>Ponés el QR en el mostrador</h3>
                <p style={s.stepText}>Te lo generamos listo para imprimir. El cliente lo escanea con la cámara mientras paga y se registra en 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <h3 style={s.stepTitle}>Definís la regla de puntos</h3>
                <p style={s.stepText}>
                  Acá el monto por compra suele ser chico pero la frecuencia es alta, así que conviene un premio que se alcance rápido: por ejemplo, cada $300 un punto y el premio a los 15 puntos, para que en dos o tres semanas ya lo puedan canjear.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <h3 style={s.stepTitle}>Cargás la venta y listo</h3>
                <p style={s.stepText}>Buscás al cliente por nombre o DNI desde la caja, o escaneás el código de su tarjeta. Cuando llega al premio, te muestra un código que validás antes de dárselo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXTRAS */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Lo que más se usa en este rubro</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Puntos de cumpleaños</h3>
              <p style={s.cardText}>
                El día del cumpleaños le entran puntos de regalo automáticamente. Una excusa más para pasar por el mostrador.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Ver quién dejó de venir</h3>
              <p style={s.cardText}>
                Con tanta gente entrando y saliendo todo el día es imposible notar que el de siempre hace dos semanas que no aparece. El panel te lo muestra solo.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Referidos</h3>
              <p style={s.cardText}>
                Cada cliente tiene su propio link para compartir. Si un vecino se registra desde ese link, los dos suman puntos: el que invitó y el que llega.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ RUBRO */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre kioscos</h2>
          <div style={s.faqList}>
            {FAQS_RUBRO.map((f) => (
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
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu kiosco</h2>
          <p style={{ ...s.sectionSub, marginBottom: 32 }}>
            El plan gratis te sirve hasta 50 clientes, sin tarjeta de crédito. Se configura en cinco minutos.
          </p>
          <a href="/onboarding/registro" style={{ ...s.ctaPrimary, fontSize: 17, padding: '17px 38px' }}>
            Empezá gratis
          </a>
        </div>
      </section>

      {/* OTROS RUBROS */}
      <section style={s.otros}>
        <div style={s.otrosTexto}>
          ¿Tenés otro tipo de negocio? Mirá cómo funciona en{' '}
          <a href="/para/cafeterias" style={s.otrosLink}>cafeterías</a>,{' '}
          <a href="/para/panaderias" style={s.otrosLink}>panaderías</a> o{' '}
          <a href="/para" style={s.otrosLink}>ver todos los rubros</a>
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
