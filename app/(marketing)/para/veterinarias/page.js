import { s } from '../estilos'

export const metadata = {
  title: 'Programa de puntos para veterinarias y pet shops | Fielty',
  description: 'Sistema de fidelización para veterinarias: que el alimento y los antiparasitarios los compren con vos y no en el pet shop. Puntos con QR, sin app. Empezá gratis.',
  alternates: { canonical: '/para/veterinarias' },
  openGraph: {
    title: 'Programa de puntos para veterinarias y pet shops | Fielty',
    description: 'La compra que más se repite es el alimento, y es la que más fácil se te va. Programa de puntos con QR para veterinarias, sin app.',
    url: '/para/veterinarias',
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
    { '@type': 'ListItem', position: 2, name: 'Veterinarias y pet shops', item: 'https://www.fielty.app/para/veterinarias' },
  ],
}

const FAQS_RUBRO = [
  {
    q: '¿Puedo diferenciar puntos entre una consulta veterinaria y la venta de alimento?',
    a: 'No hace falta. Al ir por monto, cada una suma proporcional a lo que sale, sin que armes reglas separadas.',
  },
  {
    q: '¿Sirve para vacunación y controles, que no son ventas de mostrador tradicionales?',
    a: 'Sí. Cualquier cobro que cargues desde la caja suma puntos, sea una consulta, una vacuna o una bolsa de alimento.',
  },
  {
    q: '¿Qué pasa si mi cliente tiene más de una mascota?',
    a: 'Los puntos quedan asociados al cliente, no a la mascota, así que suma todo junto sin importar cuántos animales traiga.',
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

export default function ParaVeterinarias() {
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
          <a href="/onboarding/registro" style={s.navCta}>Empezá →</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.heroWrap}>
        <div style={s.hero}>
          <div style={s.badge}>Para veterinarias y pet shops</div>
          <h1 style={s.h1}>
            Programa de puntos<br />
            <span style={s.gradient}>para tu veterinaria o pet shop.</span>
          </h1>
          <p style={s.heroSub}>
            La compra que más se repite es el alimento, y es justo la que más fácil se te va al pet shop o al supermercado. Fielty le da a tu cliente una razón concreta para comprar todo con vos, sin instalar ninguna app.
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
          <h2 style={s.h2}>Por qué funciona en una veterinaria o pet shop</h2>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>El alimento vuelve todos los meses</div>
              <p style={s.cardText}>
                Una bolsa se termina y hay que reponerla, siempre. Es la compra más previsible que tenés y también la que más competencia tiene: cualquier pet shop o góndola de supermercado te la puede sacar. Los puntos hacen que reponerla con vos tenga un beneficio acumulado.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Hay compras que ya son previsibles</div>
              <p style={s.cardText}>
                En una veterinaria son las vacunas, los antiparasitarios y los controles; en un pet shop, la arena, la piedra sanitaria y la reposición de siempre. En los dos casos ya sabés que va a volver: el programa hace que además se lleve el resto del mismo mostrador.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>La decisión no es solo por precio</div>
              <p style={s.cardText}>
                Con la mascota de por medio pesa la confianza, no únicamente cuánto sale. Un premio bien elegido — un baño, una bolsa de alimento, un accesorio — se valora bastante más que unos pesos de descuento.
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
                <p style={s.stepText}>Te lo generamos listo para imprimir. El cliente lo escanea con la cámara mientras espera o mientras paga, y el registro toma 30 segundos.</p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <div>
                <div style={s.stepTitle}>Definís la regla de puntos</div>
                <p style={s.stepText}>
                  Conviene por monto, porque una bolsa grande de alimento y una consulta no tienen nada que ver entre sí. Elegís cada cuántos pesos se suman puntos y aplica igual a lo que se lleve: alimento, medicación, accesorios o el servicio.
                </p>
              </div>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <div>
                <div style={s.stepTitle}>Cargás la venta y listo</div>
                <p style={s.stepText}>Buscás al cliente por nombre o DNI desde la caja, o escaneás el código de su tarjeta. Cuando llega al premio, te muestra un código que validás antes de entregarlo.</p>
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
              <div style={s.cardTitle}>Ver quién dejó de venir</div>
              <p style={s.cardText}>
                Acá es lo más valioso: si alguien no apareció por la vacuna anual, o hace tres meses que no repone el alimento ni la arena, es plata que estás perdiendo y capaz ya la está comprando en otro lado. El panel te lista los clientes inactivos, y en los planes Pro y Business podés mandarles un mail para que vuelvan.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Premios de distinto valor</div>
              <p style={s.cardText}>
                Podés tener varias recompensas activas a la vez con distinto costo en puntos: algo chico que se alcance seguido, como un corte de uñas, y algo grande para el cliente que compra el alimento siempre con vos.
              </p>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Niveles de lealtad</div>
              <p style={s.cardText}>
                Bronce, Plata y Oro según los puntos acumulados en total. Te deja distinguir al cliente de años del que entró una vez por una urgencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ RUBRO */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.h2}>Preguntas frecuentes sobre veterinarias y pet shops</h2>
          <div style={s.faqList}>
            {FAQS_RUBRO.map((f) => (
              <div key={f.q}>
                <div style={s.faqQ}>{f.q}</div>
                <p style={s.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ ...s.section, background: '#0a0a0a', textAlign: 'center' }}>
        <div style={{ ...s.inner, maxWidth: 600 }}>
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Probalo con tu veterinaria o pet shop</h2>
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
          <a href="/para/peluquerias" style={s.otrosLink}>peluquerías</a> o{' '}
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
