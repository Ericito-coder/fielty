import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para panaderías | Fielty',
  description: 'Sistema de fidelización para panaderías: tus clientes escanean un QR, suman puntos en cada compra de pan y eligen tu mostrador todos los días. Sin app. Empezá gratis.',
  alternates: { canonical: '/para/panaderias' },
  openGraph: {
    title: 'Programa de puntos para panaderías | Fielty',
    description: 'El pan se compra casi todos los días. Que esa costumbre sea con vos. Programa de puntos con QR para panaderías, sin app.',
    url: '/para/panaderias',
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
    { '@type': 'ListItem', position: 2, name: 'Panaderías', item: 'https://www.fielty.app/para/panaderias' },
  ],
}

export default function ParaPanaderias() {
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
          <div style={s.badge}>Para panaderías</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu panadería.</span>
          </h1>
          <p style={s.heroSub}>
            El pan se compra casi todos los días, y hay una panadería a cada par de cuadras. Fielty hace que esa costumbre diaria sea con vos y no con la de la esquina, sin que el cliente instale ninguna app.
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
          <h2 style={s.h2}>Por qué funciona en una panadería</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Es la compra más frecuente que hay</div>
              <p style={s.cardText}>
                Nadie compra pan una vez al mes. Pasa casi todos los días, muchas veces sin pensarlo, así que los puntos se acumulan rápido y el cliente lo nota enseguida.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>El ticket es parejo</div>
              <p style={s.cardText}>
                A diferencia de un restaurante, la mayoría de las compras rondan un valor parecido: pan, facturas, algún bizcochito. Eso hace fácil replicar la lógica de la vieja tarjeta de sellos: cada compra suma un punto.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>La de la otra cuadra es igual de fácil</div>
              <p style={s.cardText}>
                Para el cliente, dos panaderías cerca son casi intercambiables. Tener puntos acumulados con vos es la razón concreta para no cambiar de vereda.
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
                <p style={s.stepText}>Te lo generamos listo para imprimir. El cliente lo escanea con la cámara mientras espera que lo atiendan y se registra en 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <div style={s.stepTitle}>Definís la regla de puntos</div>
                <p style={s.stepText}>
                  Si la mayoría de tus ventas rondan un valor parecido, conviene poner el precio típico de una compra como regla: así cada visita suma un punto, igual que la tarjetita de siempre. Si también vendés tortas o pastelería de mayor valor, podés ir por monto en vez de por visita.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <div style={s.stepTitle}>Cargás la venta y listo</div>
                <p style={s.stepText}>Buscás al cliente por nombre o DNI desde la caja, o escaneás el código de su tarjeta. Es rápido a propósito: no tiene que atrasar la fila de la mañana.</p>
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
              <div style={s.cardTitle}>Un premio que se alcanza rápido</div>
              <p style={s.cardText}>
                Como se compra casi a diario, conviene un premio a pocas visitas de distancia — por ejemplo cada diez compras, algo gratis. El cliente ve el circuito completo (sumar y canjear) en cuestión de semanas, y eso es lo que hace que vuelva.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Puntos de cumpleaños</div>
              <p style={s.cardText}>
                El día del cumpleaños le entran puntos de regalo automáticamente. Es una buena excusa para que la torta la encargue con vos.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Varios mostradores, varias sucursales</div>
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
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu panadería</h2>
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
          <a href="/para/restaurantes" style={s.otrosLink}>restaurantes</a> o{' '}
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
