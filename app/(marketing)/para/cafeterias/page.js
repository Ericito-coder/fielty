import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para cafeterías y pastelerías | Fielty',
  description: 'Sistema de fidelización para cafeterías y pastelerías: tus clientes escanean un QR, suman puntos en cada compra y eligen tu mostrador en vez del de la esquina. Sin app. Empezá gratis.',
  alternates: { canonical: '/para/cafeterias' },
  openGraph: {
    title: 'Programa de puntos para cafeterías y pastelerías | Fielty',
    description: 'Que el café de todos los días sea el tuyo. Programa de puntos con QR para cafeterías, sin app.',
    url: '/para/cafeterias',
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
    { '@type': 'ListItem', position: 2, name: 'Cafeterías', item: 'https://www.fielty.app/para/cafeterias' },
  ],
}

const FAQS_RUBRO = [
  {
    q: '¿Puedo tener una regla distinta para la pastelería que para el café de todos los días?',
    a: 'No hace falta una regla separada: al ir por monto, una torta grande suma más puntos que un café solo, sin que tengas que configurar categorías aparte.',
  },
  {
    q: '¿Sirve para pedidos por encargo, como tortas de cumpleaños?',
    a: 'Sí. Cualquier venta que cargues desde la caja suma puntos, sea consumo en el local o un pedido para retirar.',
  },
  {
    q: '¿Cómo evito que se forme cola en el mostrador por cargar puntos?',
    a: 'Buscar al cliente por DNI o nombre toma un par de segundos, y si tiene la tarjeta a mano podés escanear su código directamente, todavía más rápido.',
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

export default function ParaCafeterias() {
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
          <div style={s.badge}>Para cafeterías y pastelerías</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu cafetería.</span>
          </h1>
          <p style={s.heroSub}>
            Nadie piensa mucho dónde toma el café: pasa por el que tiene más a mano. Fielty le da a tu cliente una razón concreta para que ese lugar sea el tuyo, sin que tenga que instalar ninguna app.
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
          <h2 style={s.h2}>Por qué funciona en una cafetería</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>La competencia está a media cuadra</h3>
              <p style={s.cardText}>
                Para el cliente, dos cafeterías parecidas son casi intercambiables. Tener puntos acumulados con vos es lo que lo hace pasar de largo la otra esquina.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Vienen seguido y deciden rápido</h3>
              <p style={s.cardText}>
                No es una compra que se piensa: es un hábito de treinta segundos, muchas veces por semana. Cuantas más veces te compran, más rápido se les acumula y más difícil es que arranquen de cero en otro lado.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>No todos gastan lo mismo</h3>
              <p style={s.cardText}>
                Un café para llevar no es un desayuno para dos, ni una torta encargada. Los puntos van por monto, así el que gasta más suma más sin que tengas que llevar cuentas aparte.
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
                <p style={s.stepText}>Te lo generamos listo para imprimir. El cliente lo escanea con la cámara mientras espera el pedido y se registra en 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <h3 style={s.stepTitle}>Definís la regla de puntos</h3>
                <p style={s.stepText}>
                  Acá conviene que los puntos vayan por monto y no por visita, porque lo que se lleva cada uno cambia mucho. Elegís cada cuántos pesos se suman puntos y listo.
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
                El día del cumpleaños le entran puntos de regalo automáticamente. En una pastelería es el mejor momento posible: justo cuando va a necesitar la torta.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Ver quién dejó de venir</h3>
              <p style={s.cardText}>
                Con mucha gente entrando y saliendo es imposible darte cuenta de que el de todas las mañanas hace tres semanas que no aparece. El panel te lo muestra, y en los planes Pro y Business podés mandarle un mail para invitarlo a volver.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Referidos</h3>
              <p style={s.cardText}>
                Cada cliente tiene su propio link para compartir. Si alguien se registra desde ese link, los dos suman puntos: el que recomendó y el que llega.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ RUBRO */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre cafeterías</h2>
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
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu cafetería</h2>
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
          <a href="/para/barberias" style={s.otrosLink}>barberías</a>,{' '}
          <a href="/para/veterinarias" style={s.otrosLink}>veterinarias</a> o{' '}
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
