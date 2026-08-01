import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para restaurantes | Fielty',
  description: 'Sistema de fidelización para restaurantes: tus clientes escanean un QR, suman puntos en cada mesa y eligen volver en vez de probar otro lugar. Sin app. Empezá gratis.',
  alternates: { canonical: '/para/restaurantes' },
  openGraph: {
    title: 'Programa de puntos para restaurantes | Fielty',
    description: 'Salir a comer es una elección. Dale a tu cliente una razón concreta para elegirte a vos. Programa de puntos con QR para restaurantes, sin app.',
    url: '/para/restaurantes',
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
    { '@type': 'ListItem', position: 2, name: 'Restaurantes', item: 'https://www.fielty.app/para/restaurantes' },
  ],
}

export default function ParaRestaurantes() {
  return (
    <div style={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* NAV */}
      <nav style={s.nav}>
        <a href="/" style={s.navLogo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>fielty</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/login" style={s.navLink}>Ingresar</a>
          <a href="/onboarding/registro" style={s.navCta}>Empezá →</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.heroWrap}>
        <div style={s.hero}>
          <div style={s.badge}>Para restaurantes</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu restaurante.</span>
          </h1>
          <p style={s.heroSub}>
            Salir a comer no es una necesidad como cortarse el pelo: es una elección que se hace de nuevo cada vez. Fielty le da a tu cliente una razón concreta para elegirte a vos otra vez, sin instalar ninguna app.
          </p>
          <div style={s.ctaRow}>
            <a href="/onboarding/registro" style={s.ctaPrimary}>Empezá gratis →</a>
            <a href="/faq" style={s.ctaSecondary}>Ver preguntas frecuentes</a>
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Por qué funciona en un restaurante</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Nadie tiene que volver, por eso vale premiarlo</div>
              <p style={s.cardText}>
                El pelo crece igual para todos, pero salir a comer se decide cada vez desde cero. Que el cliente tenga puntos acumulados con vos inclina esa decisión a tu favor la próxima vez que no sabe dónde ir.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Una mesa no vale lo mismo que otra</div>
              <p style={s.cardText}>
                Un café de paso y una cena para cuatro dejan números muy distintos. Los puntos van por monto, así el que gasta más suma más sin que tengas que llevar cuentas aparte.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Se elige por recomendación</div>
              <p style={s.cardText}>
                Un restaurante nuevo se llena por recomendación tanto como uno de siempre: alguien le dice a un amigo que lo pruebe. Esa recomendación hoy no te deja nada; con un programa de puntos, el que te recomienda también gana algo por hacerlo.
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
                <div style={s.stepTitle}>Ponés el QR en la mesa o en la caja</div>
                <p style={s.stepText}>Te lo generamos listo para imprimir. El cliente lo escanea con la cámara mientras espera la cuenta y se registra en 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <div style={s.stepTitle}>Definís la regla de puntos</div>
                <p style={s.stepText}>
                  Conviene por monto, porque entre una mesa y otra la diferencia puede ser grande. Elegís cada cuántos pesos se suman puntos y aplica igual para toda la cuenta: comida, bebida y postre.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <div style={s.stepTitle}>Cargás la cuenta y listo</div>
                <p style={s.stepText}>Buscás al cliente por nombre o DNI desde la caja, o escaneás el código de su tarjeta. No atrasa el cierre de mesa: cuando llega al premio, te muestra un código que validás antes de dárselo.</p>
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
              <div style={s.cardTitle}>Referidos</div>
              <p style={s.cardText}>
                Cada cliente tiene su propio link para pasarle a un amigo. Si el amigo se registra desde ahí, los dos suman puntos: le pone un beneficio concreto a algo que ya pasaba gratis.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Puntos de cumpleaños</div>
              <p style={s.cardText}>
                El día del cumpleaños le entran puntos de regalo automáticamente. Es una buena excusa para que el festejo sea en tu mesa y no en otro restaurante.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Ver quién dejó de venir</div>
              <p style={s.cardText}>
                Con las mesas rotando todo el servicio es difícil notar que el habitué de los viernes hace un mes que no aparece. El panel te lo lista, y en los planes Pro y Business podés mandarle un mail para invitarlo a volver.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ ...s.section, background: '#0a0a0a', textAlign: 'center' }}>
        <div style={{ ...s.inner, maxWidth: 600 }}>
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu restaurante</h2>
          <p style={{ ...s.sectionSub, marginBottom: 32 }}>
            El plan gratis te sirve hasta 50 clientes, sin tarjeta de crédito. Se configura en cinco minutos.
          </p>
          <a href="/onboarding/registro" style={{ ...s.ctaPrimary, fontSize: 17, padding: '17px 38px' }}>
            Empezá gratis →
          </a>
        </div>
      </section>

      {/* OTROS RUBROS */}
      <section style={s.otros}>
        <div style={s.otrosTexto}>
          ¿Tenés otro tipo de negocio? Mirá cómo funciona en{' '}
          <a href="/para/cafeterias" style={s.otrosLink}>cafeterías</a>,{' '}
          <a href="/para/gimnasios" style={s.otrosLink}>gimnasios</a> o{' '}
          <a href="/para" style={s.otrosLink}>ver todos los rubros →</a>
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
