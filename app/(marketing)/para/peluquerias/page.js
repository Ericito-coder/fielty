import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para peluquerías y salones | Fielty',
  description: 'Sistema de fidelización para peluquerías: tus clientas escanean un QR, suman puntos según lo que gastan y vuelven por el color con vos. Sin app. Empezá gratis.',
  alternates: { canonical: '/para/peluquerias' },
  openGraph: {
    title: 'Programa de puntos para peluquerías y salones | Fielty',
    description: 'Premiá a quien deja más en tu salón, no solo a quien vuelve. Programa de puntos con QR para peluquerías, sin app.',
    url: '/para/peluquerias',
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
    { '@type': 'ListItem', position: 2, name: 'Peluquerías', item: 'https://www.fielty.app/para/peluquerias' },
  ],
}

export default function ParaPeluquerias() {
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
          <div style={s.badge}>Para peluquerías y salones</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu peluquería.</span>
          </h1>
          <p style={s.heroSub}>
            En un salón no todas las visitas valen lo mismo: entre un brushing y un color hay una diferencia enorme en cuánto deja cada uno. Fielty premia según lo que cada clienta realmente gasta, sin que tengas que llevar ninguna cuenta aparte.
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
          <h2 style={s.h2}>Por qué funciona en una peluquería</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>No todos los servicios valen lo mismo</div>
              <p style={s.cardText}>
                Un corte, un color, un tratamiento y un peinado para un evento no se parecen en nada en lo que dejan. Los puntos por monto reconocen sola esa diferencia: la clienta que se hace color suma mucho más que la que pasa por las puntas.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Los intervalos son largos</div>
              <p style={s.cardText}>
                Entre un color y el siguiente pueden pasar dos meses, y en el medio aparece una promoción de otro salón. Tener puntos acumulados es lo que hace que esperen en vez de probar suerte en otro lado.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Vienen por la persona</div>
              <p style={s.cardText}>
                La clienta no elige el local, elige a quien la atiende: ya hay confianza y ya sabés qué le gusta. El programa le pone algo concreto encima de una relación que ya existe.
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
            La tarjetita de cartón con sellos ya hacía esto. Fielty es lo mismo, pero vive en el celular de la clienta.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <div style={s.stepTitle}>Ponés el QR en recepción</div>
                <p style={s.stepText}>Te lo generamos listo para imprimir. Se escanea con la cámara mientras esperan el turno o mientras pagan, y el registro toma 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <div style={s.stepTitle}>Definís la regla de puntos</div>
                <p style={s.stepText}>
                  Acá conviene puntos por monto y no por visita, justamente porque los servicios son tan distintos entre sí. Elegís cada cuántos pesos se suman puntos y el sistema hace el resto en cada servicio.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <div style={s.stepTitle}>Cargás el servicio y listo</div>
                <p style={s.stepText}>Buscás a la clienta por nombre o DNI desde la caja, o escaneás el código de su tarjeta. Cuando llega al premio, te muestra un código que validás antes de dárselo.</p>
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
              <div style={s.cardTitle}>Premios de distinto valor</div>
              <p style={s.cardText}>
                Podés tener varias recompensas activas al mismo tiempo con distinto costo en puntos: un lavado o un tratamiento de puntas para que se alcancen rápido, y algo más grande para la clienta que hace color todos los meses.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Niveles de lealtad</div>
              <p style={s.cardText}>
                Bronce, Plata y Oro según los puntos que acumuló en total. Sirve para que la clienta de años vea reconocido eso, en vez de recibir lo mismo que alguien que vino una vez.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Referidos</div>
              <p style={s.cardText}>
                Un salón crece por recomendación entre amigas. Cada clienta tiene su propio link para pasar: si la otra persona se registra desde ahí, las dos suman puntos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ ...s.section, background: '#0a0a0a', textAlign: 'center' }}>
        <div style={{ ...s.inner, maxWidth: 600 }}>
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu salón</h2>
          <p style={{ ...s.sectionSub, marginBottom: 32 }}>
            El plan gratis te sirve hasta 50 clientas, sin tarjeta de crédito. Se configura en cinco minutos.
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
          <a href="/para/barberias" style={s.otrosLink}>barberías</a>,{' '}
          <a href="/para/cafeterias" style={s.otrosLink}>cafeterías</a> o{' '}
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
