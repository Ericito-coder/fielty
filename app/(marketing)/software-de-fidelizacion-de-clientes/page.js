import { theme } from '@/lib/theme'
import { s } from '../para/estilos'

// Página para quien busca "software", "plataforma" o "sistema de
// fidelización de clientes": alguien que ya decidió que quiere una
// herramienta y está comparando qué trae cada una y cuánto sale. Por eso
// es la única de estas páginas que muestra los planes.
//
// Los precios también están en la home, /faq y /guia: si cambian, se
// cambian en los cuatro lados.

export const metadata = {
  title: 'Software de fidelización de clientes | Fielty',
  description: 'Software de fidelización de clientes para negocios con local: puntos, niveles, referidos y panel de clientes. Listo en 5 minutos. Gratis hasta 30 clientes.',
  alternates: { canonical: '/software-de-fidelizacion-de-clientes' },
  openGraph: {
    title: 'Software de fidelización de clientes | Fielty',
    description: 'Sistema de puntos para negocios con local, con precios a la vista y sin instalación.',
    url: '/software-de-fidelizacion-de-clientes',
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
    { '@type': 'ListItem', position: 2, name: 'Software de fidelización de clientes', item: 'https://www.fielty.app/software-de-fidelizacion-de-clientes' },
  ],
}

const PLANES = [
  {
    nombre: 'Gratis',
    precio: '$0',
    detalle: 'Hasta 30 clientes',
    incluye: ['1 sucursal', 'Puntos, niveles y referidos', 'Puntos de cumpleaños', 'Tarjeta del cliente en Google Wallet'],
  },
  {
    nombre: 'Pro',
    precio: '$20.000',
    detalle: 'por mes, clientes ilimitados',
    incluye: ['Hasta 3 sucursales', 'Campañas de email a clientes inactivos', 'Tu logo en la tarjeta y en Wallet', 'Exportar clientes a CSV'],
  },
  {
    nombre: 'Business',
    precio: '$35.000',
    detalle: 'por mes, todo lo de Pro',
    incluye: ['Sucursales ilimitadas', 'Soporte prioritario'],
  },
]

// La primera define la entidad completa (qué es, en qué país y a qué
// precio) para que la página se sostenga sola como respuesta.
const FAQS = [
  {
    q: '¿Qué es Fielty y cuánto cuesta?',
    a: 'Fielty es un software de fidelización de clientes para negocios físicos en Argentina. Arma un programa de puntos con niveles y referidos: el cliente se registra con un QR, suma puntos en cada compra y canjea premios que define el negocio. Tiene un plan gratis hasta 30 clientes, un plan Pro de $20.000 por mes con clientes ilimitados y un plan Business de $35.000 por mes con sucursales ilimitadas.',
  },
  {
    q: '¿Hay que instalarlo o integrarlo con mi sistema de facturación?',
    a: 'No. Funciona desde el navegador y no se conecta con la caja registradora ni con el sistema de facturación: cargás el monto de cada venta a mano, desde el celular o la computadora que ya tenés. Por eso se puede empezar a usar el mismo día.',
  },
  {
    q: '¿Sirve para un negocio con varias sucursales?',
    a: 'Sí. Cada sucursal tiene su propia pantalla de caja con su PIN, y el cliente suma y canjea puntos en cualquiera de tus locales con la misma tarjeta. El plan gratis incluye una sucursal, el Pro hasta tres y el Business sucursales ilimitadas.',
  },
  {
    q: '¿Hay contrato, permanencia o costo de instalación?',
    a: 'No. La suscripción es mensual, se paga con tarjeta de crédito o débito a través de Mercado Pago y se cancela cuando quieras. No hay costo de instalación ni de puesta en marcha.',
  },
  {
    q: '¿Puedo llevarme los datos de mis clientes?',
    a: 'Sí. En los planes pagos podés exportar tu lista de clientes a un archivo CSV cuando quieras, para abrirla en Excel o cargarla en otra herramienta.',
  },
  {
    q: '¿Dónde se guardan los datos de mis clientes?',
    a: 'En una base de datos con encriptación y acceso protegido. Fielty cumple con la Ley 25.326 de Protección de Datos Personales de Argentina.',
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

const p = {
  planNombre: { fontSize: 13, fontWeight: 700, color: theme.darkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 },
  planPrecio: { fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: -1, margin: '10px 0 2px' },
  planDetalle: { fontSize: 14, color: theme.darkText, margin: '0 0 20px' },
  planLista: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  planItem: { fontSize: 14, color: theme.darkText, lineHeight: 1.5, paddingLeft: 16, position: 'relative' },
  planPunto: { position: 'absolute', left: 0, top: 8, width: 5, height: 5, borderRadius: '50%', background: theme.darkMuted },
  planNota: { fontSize: 14, color: theme.darkText, marginTop: 24 },
}

export default function SoftwareDeFidelizacion() {
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
          <div style={s.badge}>Software de fidelización</div>
          <h1 style={s.h1}>
            Software de fidelización<br />
            <span style={s.gradient}>listo en cinco minutos.</span>
          </h1>
          <p style={s.heroSub}>
            Fielty es un sistema de fidelización de clientes para negocios con local. Armás tu programa de puntos, imprimís un QR y empezás el mismo día, sin instalación, sin contrato y con los precios a la vista.
          </p>
          <div style={s.ctaRow}>
            <a href="/onboarding/registro" style={s.ctaPrimary}>Empezá gratis</a>
            <a href="#precios" style={s.ctaSecondary}>Ver planes y precios</a>
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Qué incluye</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Programa de puntos a tu medida</h3>
              <p style={s.cardText}>
                Vos definís cada cuántos pesos se suma un punto y qué premios se canjean. Podés sumar niveles Bronce, Plata y Oro, puntos de cumpleaños y puntos por traer un amigo.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Panel con tus clientes</h3>
              <p style={s.cardText}>
                Cuántos clientes tenés, quiénes son los más activos, quiénes hace tiempo que no vienen y qué sucursal vende más. Es la información que una tarjeta de cartón nunca te da.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Caja para el mostrador</h3>
              <p style={s.cardText}>
                Una pantalla aparte, con su propio PIN, para que quien atiende cargue las compras y valide los canjes sin entrar a tu panel ni ver tu configuración.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO */}
      <section style={{ ...s.section, background: '#0a0a0a' }}>
        <div style={s.inner}>
          <h2 style={s.h2}>Cómo se pone en marcha</h2>
          <p style={s.sectionSub}>
            No hay demo que agendar ni vendedor que esperar. Creás la cuenta y lo dejás andando vos, en el momento.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <h3 style={s.stepTitle}>Creás la cuenta y armás el programa</h3>
                <p style={s.stepText}>Nombre y color de tu negocio, regla de puntos y premios. Lleva unos cinco minutos y no pide tarjeta de crédito.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <h3 style={s.stepTitle}>Imprimís el cartel con el QR</h3>
                <p style={s.stepText}>Te lo generamos listo. Lo dejás donde te pagan y cada cliente se registra solo con la cámara del celular, sin instalar ninguna app.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <h3 style={s.stepTitle}>Cargás las ventas desde la caja</h3>
                <p style={s.stepText}>Buscás al cliente, ponés el monto y los puntos se acreditan al instante. No hace falta ningún lector, terminal ni integración.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Planes y precios</h2>
          <div style={s.grid}>
            {PLANES.map((plan) => (
              <div key={plan.nombre} style={s.card}>
                <h3 style={p.planNombre}>{plan.nombre}</h3>
                <p style={p.planPrecio}>{plan.precio}</p>
                <p style={p.planDetalle}>{plan.detalle}</p>
                <ul style={p.planLista}>
                  {plan.incluye.map((item) => (
                    <li key={item} style={p.planItem}>
                      <span style={p.planPunto} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={p.planNota}>
            Precios en pesos argentinos. Sin permanencia ni costo de instalación: cancelás cuando quieras.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre el software</h2>
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
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo antes de decidir</h2>
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
          <a href="/tarjeta-de-fidelizacion-digital" style={s.otrosLink}>cómo es la tarjeta del cliente</a>,{' '}
          <a href="/app-para-fidelizar-clientes" style={s.otrosLink}>cómo funciona sin app</a> o{' '}
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
