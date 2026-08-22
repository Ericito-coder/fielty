import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para gimnasios | Fielty',
  description: 'Programa de puntos para gimnasios sin app: el socio acumula mes a mes y lo pierde si se va. Premiá la renovación. Gratis hasta 50 socios.',
  alternates: { canonical: '/para/gimnasios' },
  openGraph: {
    title: 'Programa de puntos para gimnasios | Fielty',
    description: 'El problema no es que no vengan una vez, es que dejen de renovar. Programa de puntos con QR para gimnasios, sin app.',
    url: '/para/gimnasios',
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
    { '@type': 'ListItem', position: 2, name: 'Gimnasios', item: 'https://www.fielty.app/para/gimnasios' },
  ],
}

const FAQS_RUBRO = [
  {
    q: '¿Los puntos se cargan por asistencia o por el pago de la cuota?',
    a: 'Por el pago. Fielty no cuenta asistencias por sí solo, así que el programa se arma alrededor de la renovación y del consumo de mostrador.',
  },
  {
    q: '¿Sirve para planes trimestrales o anuales, no solo mensuales?',
    a: 'Sí. Cualquier pago que cargues desde la caja suma puntos según el monto, sin importar la duración del plan.',
  },
  {
    q: '¿Qué pasa si un socio se da de baja y vuelve más adelante?',
    a: 'Los puntos quedan en su cuenta esperándolo: no se pierden por una baja temporal.',
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

export default function ParaGimnasios() {
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
          <div style={s.badge}>Para gimnasios</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu gimnasio.</span>
          </h1>
          <p style={s.heroSub}>
            En un gimnasio el problema no es que no vuelvan una vez: es que dejen de renovar. Fielty le da al socio algo que acumula mes a mes, y que perdería si se va a otro lado.
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
          <h2 style={s.h2}>Por qué funciona en un gimnasio</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Lo que duele es la baja</h3>
              <p style={s.cardText}>
                Un socio que se va no vuelve a los tres meses como en otros rubros: se anota en otro lado y lo perdiste. Que tenga puntos acumulados y un premio a mitad de camino le agrega un costo concreto a irse.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Además de la cuota hay mostrador</h3>
              <p style={s.cardText}>
                Bebidas, suplementos, indumentaria. Son ventas que hoy no dejan ningún registro y son la parte más fácil de premiar: el socio compra la proteína con vos en lugar de encargarla por internet.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>La antigüedad hoy no se reconoce</h3>
              <p style={s.cardText}>
                El socio de tres años y el que se anotó el mes pasado pagan lo mismo y reciben lo mismo. Los niveles te dan una forma simple de tratarlos distinto sin armar una lista aparte.
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
            Los puntos se cargan cuando hay un pago: la cuota del mes o una compra en el mostrador. Fielty no cuenta asistencias por sí solo, así que el programa se arma alrededor de la renovación y del consumo, no del ingreso al salón.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <h3 style={s.stepTitle}>Ponés el QR en recepción</h3>
                <p style={s.stepText}>Te lo generamos listo para imprimir. El socio lo escanea con la cámara cuando pasa por el mostrador y se registra en 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <h3 style={s.stepTitle}>Definís la regla de puntos</h3>
                <p style={s.stepText}>
                  Elegís cada cuántos pesos se suman puntos y aplica parejo: la cuota mensual suma su parte y las compras del mostrador suman la suya. Así el socio que renueva sin faltar un mes acumula solo, sin que tengas que hacer nada.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <h3 style={s.stepTitle}>Cargás el pago y listo</h3>
                <p style={s.stepText}>Buscás al socio por nombre o DNI desde la caja, o escaneás el código de su tarjeta. Cuando llega al premio, te muestra un código que validás antes de entregarlo.</p>
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
              <h3 style={s.cardTitle}>Niveles de lealtad</h3>
              <p style={s.cardText}>
                Bronce, Plata y Oro según los puntos acumulados en total. En un gimnasio es lo que más se nota, porque premia la continuidad: al año de renovar sin cortes, el socio está en otro nivel que el nuevo.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Ver quién dejó de pagar</h3>
              <p style={s.cardText}>
                El panel te lista a los socios inactivos, que en este rubro son los que están a un paso de la baja. En los planes Pro y Business podés mandarles un mail para intentar recuperarlos antes de que se anoten en otro lado.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Referidos</h3>
              <p style={s.cardText}>
                Al gimnasio se suele entrar de a dos: alguien arrastra a un amigo o a la pareja. Cada socio tiene su propio link, y si la otra persona se registra desde ahí, los dos suman puntos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ RUBRO */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre gimnasios</h2>
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
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu gimnasio</h2>
          <p style={{ ...s.sectionSub, marginBottom: 32 }}>
            El plan gratis te sirve hasta 50 socios, sin tarjeta de crédito. Se configura en cinco minutos.
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
          <a href="/para/peluquerias" style={s.otrosLink}>peluquerías</a>,{' '}
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
