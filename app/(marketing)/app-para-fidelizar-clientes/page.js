import { s } from '../para/estilos'

// El sitio dice "sin app" en todos lados y la gente busca justamente "app
// para fidelizar clientes" (Search Console, septiembre 2026; Planificador
// de Google Ads, 06/10/2026). Esta página responde esa búsqueda con sus
// palabras: es una app, solo que se usa desde el navegador.

export const metadata = {
  title: 'App para fidelizar clientes, sin descargas | Fielty',
  description: 'App para fidelizar clientes desde el navegador: cargás cada compra con el celular y tus clientes ven sus puntos con un QR. Gratis hasta 30 clientes.',
  alternates: { canonical: '/app-para-fidelizar-clientes' },
  openGraph: {
    title: 'App para fidelizar clientes, sin descargas | Fielty',
    description: 'Fidelizá con puntos desde el celular. Ni vos ni tus clientes tienen que instalar nada.',
    url: '/app-para-fidelizar-clientes',
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
    { '@type': 'ListItem', position: 2, name: 'App para fidelizar clientes', item: 'https://www.fielty.app/app-para-fidelizar-clientes' },
  ],
}

// La primera define la entidad completa (qué es, en qué país y a qué
// precio) para que la página se sostenga sola como respuesta.
const FAQS = [
  {
    q: '¿Qué es Fielty y cuánto cuesta?',
    a: 'Fielty es una app web para fidelizar clientes con puntos, pensada para negocios físicos en Argentina. Vos cargás cada compra desde el celular y tus clientes juntan puntos y canjean premios desde su tarjeta digital, que abren con un QR. El plan gratis cubre hasta 30 clientes y los planes pagos arrancan en $20.000 por mes con clientes ilimitados.',
  },
  {
    q: '¿Hay que bajar la app de Fielty de Play Store o App Store?',
    a: 'No. Fielty se usa desde el navegador, entrando a fielty.app, tanto en el celular como en una tablet o una computadora. No ocupa lugar en el teléfono y no hay que actualizarla.',
  },
  {
    q: '¿Mis clientes tienen que instalar algo?',
    a: 'Tampoco. Escanean el QR de tu mostrador con la cámara, se registran en menos de un minuto y ven su tarjeta, sus puntos y sus premios en el navegador. Si quieren, la pueden guardar en Google Wallet.',
  },
  {
    q: '¿Hay una app gratis para fidelizar clientes?',
    a: 'El plan gratis de Fielty incluye puntos, niveles, referidos, puntos de cumpleaños y la tarjeta del cliente en Google Wallet, para hasta 30 clientes y una sucursal. No pide tarjeta de crédito. Cuando necesitás más clientes pasás a un plan pago.',
  },
  {
    q: '¿Puedo manejar todo desde el celular?',
    a: 'Sí. El panel donde configurás el programa y la caja donde cargás las compras están pensados para usarse desde el celular. No hace falta una computadora ni ningún lector o terminal.',
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

export default function AppParaFidelizarClientes() {
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
          <div style={s.badge}>App para fidelizar clientes</div>
          <h1 style={s.h1}>
            La app para fidelizar<br />
            <span style={s.gradient}>que nadie tiene que bajar.</span>
          </h1>
          <p style={s.heroSub}>
            Fielty es una app de fidelización que se usa desde el navegador. Vos manejás tu programa de puntos desde el celular y tus clientes ven su tarjeta escaneando un QR, sin pasar por la tienda de aplicaciones.
          </p>
          <div style={s.ctaRow}>
            <a href="/onboarding/registro" style={s.ctaPrimary}>Empezá gratis</a>
            <a href="/faq" style={s.ctaSecondary}>Ver preguntas frecuentes</a>
          </div>
        </div>
      </section>

      {/* POR QUÉ SIN DESCARGA */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Por qué conviene que no haya que descargarla</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>En la caja nadie baja una app</h3>
              <p style={s.cardText}>
                Pedirle a alguien que busque una aplicación, la instale y se cree un usuario mientras hay gente esperando es pedir demasiado. Escanear un QR con la cámara lo hace mientras paga.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Funciona en cualquier celular</h3>
              <p style={s.cardText}>
                Al abrirse en el navegador, da lo mismo la marca del teléfono o si le queda poco espacio. Si puede entrar a una página web, puede tener su tarjeta.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Vos tampoco instalás nada</h3>
              <p style={s.cardText}>
                El panel y la caja se abren desde el celular, la tablet o la computadora que ya tenés en el negocio. No hay que comprar ningún lector ni terminal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO */}
      <section style={{ ...s.section, background: '#0a0a0a' }}>
        <div style={s.inner}>
          <h2 style={s.h2}>Cómo se usa en el día a día</h2>
          <p style={s.sectionSub}>
            Si sabés usar WhatsApp, sabés usar Fielty. Se configura una vez y después es cargar cada venta.
          </p>

          <div style={s.steps}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <div>
                <h3 style={s.stepTitle}>Armás tu programa en cinco minutos</h3>
                <p style={s.stepText}>Ponés el nombre y el color de tu negocio, definís la regla de puntos y elegís los premios. Por ejemplo, un punto cada $100 y un premio que se alcance en cuatro o cinco compras.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <h3 style={s.stepTitle}>Dejás el QR a la vista</h3>
                <p style={s.stepText}>Te lo generamos listo para imprimir. Cada cliente lo escanea, se registra y ya tiene su tarjeta. El primero lo podés cargar vos mismo desde la caja para probar.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <h3 style={s.stepTitle}>Cargás cada compra desde el celular</h3>
                <p style={s.stepText}>Buscás al cliente por nombre o DNI, ponés el monto y los puntos se acreditan al instante. Cuando quiere canjear, te muestra un código y lo validás antes de darle el premio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUÉ RESUELVE */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Lo que hace para que vuelvan</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Les da una razón para elegirte</h3>
              <p style={s.cardText}>
                El cliente ve en su tarjeta cuántos puntos tiene y cuánto le falta para el premio. Con niveles y puntos de cumpleaños, los que más vienen reciben más.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Te muestra quién dejó de venir</h3>
              <p style={s.cardText}>
                Desde el panel ves quiénes son tus clientes más activos y quiénes hace tiempo que no aparecen. En los planes pagos les podés mandar una campaña por email para invitarlos a volver.
              </p>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Trae clientes nuevos</h3>
              <p style={s.cardText}>
                Cada cliente tiene un link para invitar amigos. Cuando alguien se registra desde ahí, suman puntos los dos, así que tus propios clientes te recomiendan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre la app</h2>
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
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probala hoy desde tu celular</h2>
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
