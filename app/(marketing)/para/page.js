import { s } from './estilos'

export const metadata = {
  title: 'Programas de fidelización por rubro | Fielty',
  description: 'Cómo se arma un programa de puntos según el tipo de negocio: barberías, cafeterías, peluquerías, veterinarias, gimnasios, restaurantes, panaderías y kioscos. Cada rubro tiene su propia regla de puntos y sus premios.',
  alternates: { canonical: '/para' },
  openGraph: {
    title: 'Programas de fidelización por rubro | Fielty',
    description: 'Guías por rubro: barberías, cafeterías, peluquerías, veterinarias, gimnasios, restaurantes, panaderías y kioscos.',
    url: '/para',
    siteName: 'Fielty',
    locale: 'es_AR',
    type: 'website',
  },
}

const RUBROS = [
  {
    href: '/para/barberias',
    nombre: 'Barberías',
    hook: 'El cliente ya vuelve cada tres o cuatro semanas. Acá conviene replicar la tarjeta de sellos: un corte, un punto.',
  },
  {
    href: '/para/cafeterias',
    nombre: 'Cafeterías y pastelerías',
    hook: 'Hay otra cafetería a media cuadra y para el cliente son intercambiables. Los puntos son la razón para pasar de largo.',
  },
  {
    href: '/para/peluquerias',
    nombre: 'Peluquerías y salones',
    hook: 'Entre un brushing y un color hay una diferencia enorme en cuánto deja cada uno. Los puntos por monto reconocen eso solos.',
  },
  {
    href: '/para/veterinarias',
    nombre: 'Veterinarias y pet shops',
    hook: 'El alimento vuelve todos los meses y es lo que más fácil se te va al pet shop o al supermercado.',
  },
  {
    href: '/para/gimnasios',
    nombre: 'Gimnasios',
    hook: 'El problema no es que no vengan una vez, es que dejen de renovar. Se premia la continuidad y el mostrador.',
  },
  {
    href: '/para/restaurantes',
    nombre: 'Restaurantes',
    hook: 'Salir a comer es una elección, no una necesidad. Los puntos son la razón para que esa elección sea vos.',
  },
  {
    href: '/para/panaderias',
    nombre: 'Panaderías',
    hook: 'El pan se compra casi todos los días. Se premia esa costumbre para que sea con vos y no con la de la esquina.',
  },
  {
    href: '/para/kioscos',
    nombre: 'Kioscos y despensas',
    hook: 'Es el rubro de mayor frecuencia de todos. El premio conviene que se alcance rápido, no a los dos meses.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Fielty', item: 'https://www.fielty.app' },
    { '@type': 'ListItem', position: 2, name: 'Por rubro', item: 'https://www.fielty.app/para' },
  ],
}

export default function PorRubro() {
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
          <div style={s.badge}>Por rubro</div>
          <h1 style={s.h1}>
            Cómo funciona<br />
            <span style={s.gradient}>en tu rubro.</span>
          </h1>
          <p style={s.heroSub}>
            El producto es el mismo, pero la forma de armar el programa cambia bastante según el negocio: no se configura igual una barbería, donde el cliente vuelve siempre a lo mismo, que una veterinaria, donde lo que se repite es la bolsa de alimento.
          </p>
        </div>
      </section>

      {/* LISTADO */}
      <section style={{ ...s.section, paddingTop: 0 }}>
        <div style={s.inner}>
          <div style={{ ...s.grid, marginTop: 0 }}>
            {RUBROS.map((r) => (
              <a key={r.href} href={r.href} style={{ ...s.card, textDecoration: 'none', display: 'block' }}>
                <div style={{ ...s.cardTitle, marginBottom: 10 }}>{r.nombre} →</div>
                <p style={s.cardText}>{r.hook}</p>
              </a>
            ))}
          </div>
          <p style={{ ...s.cardText, marginTop: 32 }}>
            ¿Tu rubro no está en la lista? Fielty funciona igual en cualquier negocio con local a la calle — farmacias, tiendas de ropa, ferreterías. Escribinos a{' '}
            <a href="mailto:hola@fielty.app" style={s.otrosLink}>hola@fielty.app</a> y te ayudamos a armarlo.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ ...s.section, background: '#0a0a0a', textAlign: 'center' }}>
        <div style={{ ...s.inner, maxWidth: 600 }}>
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Empezá con tu negocio</h2>
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
