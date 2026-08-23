import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para barberías | Fielty',
  description: 'Programa de puntos para barberías sin app: escanean un QR y suman en cada corte. Que la vuelta de cada mes sea con vos. Gratis hasta 50 clientes.',
  alternates: { canonical: '/para/barberias' },
  openGraph: {
    title: 'Programa de puntos para barberías | Fielty',
    description: 'Que tus clientes vuelvan cada mes, no cuando se acuerdan. Programa de puntos con QR para barberías, sin app.',
    url: '/para/barberias',
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
    { '@type': 'ListItem', position: 2, name: 'Barberías', item: 'https://www.fielty.app/para/barberias' },
  ],
}

// La primera define la entidad completa -- qué es Fielty, en qué país y a qué
// precio -- para que la página se sostenga sola como respuesta.
const FAQS_RUBRO = [
  {
    q: '¿Qué es Fielty y cuánto cuesta para una barbería?',
    a: 'Fielty es un programa de fidelización con puntos por QR para negocios físicos en Argentina. En una barbería, el cliente escanea el QR del mostrador, se registra en 30 segundos y ve su tarjeta de puntos desde el navegador, sin instalar ninguna app. El plan gratis cubre hasta 50 clientes y los planes pagos arrancan en $20.000 por mes con clientes ilimitados.',
  },
  {
    q: '¿Puedo sumar puntos también por productos, no solo por el corte?',
    a: 'Sí. La regla de puntos aplica a cualquier venta que cargues desde la caja, así que la barba, los productos y el combo suman igual que el corte.',
  },
  {
    q: '¿Qué regla de puntos conviene si quiero replicar la tarjeta de sellos?',
    a: 'Poné el precio de un corte como el valor que da un punto, y el premio en diez: queda igual que la tarjetita de cartón de siempre, pero sin que se pierda.',
  },
  {
    q: '¿Sirve si tengo varios sillones o varios barberos?',
    a: 'Sí. Todos cargan desde la misma caja del negocio: no hace falta un usuario por barbero, alcanza con que cada uno cargue el corte cuando cobra.',
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

export default function ParaBarberias() {
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
          <div style={s.badge}>Para barberías</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu barbería.</span>
          </h1>
          <p style={s.heroSub}>
            Tus clientes ya vuelven cada tres o cuatro semanas. Fielty hace que ese ritmo no dependa de que se acuerden de vos: suman puntos en cada corte y los ven en el celular, sin instalar ninguna app.
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
          <h2 style={s.h2}>Por qué funciona en una barbería</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>El cliente ya es recurrente</h3>
              <p style={s.cardText}>
                El pelo crece igual para todos: quien se corta con vos vuelve cada tres o cuatro semanas. No tenés que crear el hábito, solo asegurarte de que esa vuelta sea con vos y no con el que le queda más cerca ese día.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Cada visita vale bastante</h3>
              <p style={s.cardText}>
                Un corte no es una compra chica: cuando alguien deja de venir, se nota en la caja del mes. Recuperar a un cliente que se estaba yendo justifica de sobra el premio que le des.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Ya tenés la relación</h3>
              <p style={s.cardText}>
                Los conocés por el nombre y sabés cómo les gusta el corte. Un programa de puntos le pone números a algo que ya hacés: reconocer al que siempre vuelve.
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
            La tarjetita de cartón con sellos ya hacía esto. Fielty es el mismo programa de puntos, pero vive en el celular del cliente y no se pierde.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <h3 style={s.stepTitle}>Ponés el QR en el mostrador</h3>
                <p style={s.stepText}>Te lo generamos listo para imprimir. El cliente lo escanea con la cámara mientras te paga y se registra en 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <h3 style={s.stepTitle}>Definís la regla de puntos</h3>
                <p style={s.stepText}>
                  Si querés replicar la lógica de la tarjeta de sellos, poné el precio de un corte como regla: así cada corte suma un punto y ponés el premio en diez. Si preferís algo más fino, configurás puntos proporcionales al monto y también suman la barba, los productos o el combo.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <h3 style={s.stepTitle}>Cargás el corte y listo</h3>
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
              <h3 style={s.cardTitle}>Referidos</h3>
              <p style={s.cardText}>
                Una barbería crece porque alguien le pregunta a un amigo dónde se corta. Cada cliente tiene su propio link para pasarle: si el amigo se registra desde ahí, los dos suman puntos.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Puntos de cumpleaños</h3>
              <p style={s.cardText}>
                El día del cumpleaños le entran puntos de regalo automáticamente. Es una excusa para que aparezca sin que vos tengas que acordarte de nada.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Varios sillones, varias sucursales</h3>
              <p style={s.cardText}>
                Si tenés más de un local, cada uno entra con su propio PIN, pero el cliente suma puntos en cualquiera de los dos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ RUBRO */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre barberías</h2>
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
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu barbería</h2>
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
          <a href="/para/peluquerias" style={s.otrosLink}>peluquerías</a>,{' '}
          <a href="/para/cafeterias" style={s.otrosLink}>cafeterías</a> o{' '}
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
