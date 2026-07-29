export const metadata = {
  title: 'Programa de puntos para barberías | Fielty',
  description: 'Sistema de fidelización para barberías: tus clientes escanean un QR, suman puntos en cada corte y vuelven más seguido. Sin app y sin tarjetitas que se pierden. Empezá gratis.',
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
    { '@type': 'ListItem', position: 1, name: 'Fielty', item: 'https://fielty.app' },
    { '@type': 'ListItem', position: 2, name: 'Barberías', item: 'https://fielty.app/para/barberias' },
  ],
}

export default function ParaBarberias() {
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
          <div style={s.badge}>Para barberías</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu barbería.</span>
          </h1>
          <p style={s.heroSub}>
            Tus clientes ya vuelven cada tres o cuatro semanas. Fielty hace que ese ritmo no dependa de que se acuerden de vos: suman puntos en cada corte y los ven en el celular, sin instalar ninguna app.
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
          <h2 style={s.h2}>Por qué funciona en una barbería</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>El cliente ya es recurrente</div>
              <p style={s.cardText}>
                El pelo crece igual para todos: quien se corta con vos vuelve cada tres o cuatro semanas. No tenés que crear el hábito, solo asegurarte de que esa vuelta sea con vos y no con el que le queda más cerca ese día.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Cada visita vale bastante</div>
              <p style={s.cardText}>
                Un corte no es una compra chica: cuando alguien deja de venir, se nota en la caja del mes. Recuperar a un cliente que se estaba yendo justifica de sobra el premio que le des.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Ya tenés la relación</div>
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
            La tarjetita de cartón con sellos ya hacía esto. Fielty es lo mismo, pero vive en el celular del cliente.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <div style={s.stepTitle}>Ponés el QR en el mostrador</div>
                <p style={s.stepText}>Te lo generamos listo para imprimir. El cliente lo escanea con la cámara mientras te paga y se registra en 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <div style={s.stepTitle}>Definís la regla de puntos</div>
                <p style={s.stepText}>
                  Si querés replicar la lógica de la tarjeta de sellos, poné el precio de un corte como regla: así cada corte suma un punto y ponés el premio en diez. Si preferís algo más fino, configurás puntos proporcionales al monto y también suman la barba, los productos o el combo.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <div style={s.stepTitle}>Cargás el corte y listo</div>
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
              <div style={s.cardTitle}>Referidos</div>
              <p style={s.cardText}>
                Una barbería crece porque alguien le pregunta a un amigo dónde se corta. Cada cliente tiene un link propio: cuando el amigo se registra, los dos suman puntos.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Puntos de cumpleaños</div>
              <p style={s.cardText}>
                El día del cumpleaños le entran puntos de regalo automáticamente. Es una excusa para que aparezca sin que vos tengas que acordarte de nada.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Varios sillones, varias sucursales</div>
              <p style={s.cardText}>
                Si tenés más de un local, cada uno entra con su propio PIN, pero el cliente suma puntos en cualquiera de los dos.
              </p>
            </div>
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
            Empezá gratis →
          </a>
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

const s = {
  page: { minHeight: '100vh', background: '#0e0e0e', color: 'white', fontFamily: 'inherit' },
  nav: { borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoDot: { width: 8, height: 8, borderRadius: '50%', background: '#e0001b', boxShadow: '0 0 8px #e0001b' },
  logoText: { fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: -0.5 },
  navLink: { fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 500 },
  navCta: { fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 700, background: '#e0001b', padding: '9px 16px', borderRadius: 10 },

  heroWrap: { padding: '80px 32px 60px' },
  hero: { maxWidth: 760, margin: '0 auto', textAlign: 'center' },
  badge: { display: 'inline-block', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 100, padding: '7px 18px', fontSize: 12, color: '#888', marginBottom: 28, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' },
  h1: { fontSize: 'clamp(34px, 6.5vw, 60px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 24, color: 'white' },
  gradient: { background: 'linear-gradient(135deg, #e0001b, #f0a500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: 18, color: '#777', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 36px' },
  ctaRow: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' },
  ctaPrimary: { background: '#e0001b', color: 'white', textDecoration: 'none', padding: '15px 30px', borderRadius: 14, fontSize: 16, fontWeight: 800, display: 'inline-block' },
  ctaSecondary: { background: '#1a1a1a', color: 'white', textDecoration: 'none', padding: '15px 30px', borderRadius: 14, fontSize: 16, fontWeight: 600, border: '1px solid #2a2a2a', display: 'inline-block' },

  section: { padding: '80px 32px' },
  inner: { maxWidth: 1000, margin: '0 auto' },
  h2: { fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: 'white', marginBottom: 20, letterSpacing: -0.8 },
  sectionSub: { fontSize: 17, color: '#666', lineHeight: 1.75, maxWidth: 680, marginBottom: 48 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 40 },
  card: { background: '#1a1a1a', borderRadius: 20, padding: 28, border: '1px solid #222' },
  cardTitle: { fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 10 },
  cardText: { fontSize: 14, color: '#777', lineHeight: 1.8, margin: 0 },

  steps: { display: 'flex', flexDirection: 'column', gap: 28 },
  step: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  stepNum: { width: 38, height: 38, borderRadius: '50%', background: '#e0001b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, flexShrink: 0 },
  stepTitle: { fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 },
  stepText: { fontSize: 15, color: '#777', lineHeight: 1.8, margin: 0 },

  footer: { borderTop: '1px solid #1a1a1a', textAlign: 'center', padding: '28px 20px 44px', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' },
  footerLink: { fontSize: 13, color: '#444', textDecoration: 'none' },
}
