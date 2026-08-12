import { theme } from '@/lib/theme'

export const metadata = {
  title: 'Cómo armar un programa de puntos para tu negocio | Fielty',
  description: 'Guía práctica: qué premio ofrecer, cuánto tiene que costarte, cada cuántas visitas conviene que se alcance, cómo explicarlo en el mostrador y qué medir el primer mes.',
  alternates: { canonical: '/como-armar-un-programa-de-puntos' },
  openGraph: {
    title: 'Cómo armar un programa de puntos para tu negocio',
    description: 'Qué premio ofrecer, cuántos puntos dar y cada cuánto tiene que alcanzarse. Guía práctica para comercios.',
    url: '/como-armar-un-programa-de-puntos',
    siteName: 'Fielty',
    locale: 'es_AR',
    type: 'article',
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Fielty', item: 'https://www.fielty.app' },
    { '@type': 'ListItem', position: 2, name: 'Cómo armar un programa de puntos', item: 'https://www.fielty.app/como-armar-un-programa-de-puntos' },
  ],
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Cómo armar un programa de puntos para tu negocio',
  description: 'Guía práctica sobre qué premio ofrecer, cuánto tiene que costarte, cada cuántas visitas conviene que se alcance, cómo explicarlo en el mostrador y qué medir el primer mes.',
  inLanguage: 'es-AR',
  author: { '@type': 'Organization', name: 'Fielty', url: 'https://www.fielty.app' },
  publisher: {
    '@type': 'Organization',
    name: 'Fielty',
    url: 'https://www.fielty.app',
    logo: { '@type': 'ImageObject', url: 'https://www.fielty.app/icons/icon-1024.png', width: 1024, height: 1024 },
  },
  mainEntityOfPage: 'https://www.fielty.app/como-armar-un-programa-de-puntos',
}

export default function ComoArmarUnProgramaDePuntos() {
  return (
    <div style={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

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

      <article style={s.wrap}>
        <div style={s.badge}>Guía</div>
        <h1 style={s.h1}>Cómo armar un programa de puntos para tu negocio</h1>
        <p style={s.bajada}>
          Un programa de puntos es fácil de arrancar y fácil de arruinar. La mayoría
          de las decisiones que importan se toman antes de repartir el primer punto,
          y casi todas son de números, no de tecnología. Esta guía va sobre esas
          decisiones: sirve igual si vas a usar una tarjetita de cartón o un sistema.
        </p>

        {/* 1 */}
        <h2 style={s.h2}>1. Elegí el premio antes que los puntos</h2>
        <p style={s.p}>
          Casi todos arrancan al revés: primero deciden "1 punto cada $100" y después
          ven qué regalar. El problema es que los puntos por sí solos no significan
          nada. Lo que hace volver al cliente es el premio; los puntos son apenas la
          forma de contar cuánto falta.
        </p>
        <p style={s.p}>
          El mejor premio es <strong style={s.fuerte}>algo que ya vendés</strong>. Un corte, un café, un
          baño para el perro, una docena de facturas. Te cuesta lo que te cuesta
          producirlo, no lo que sale en la lista, y para el cliente vale el precio
          completo. Esa diferencia es toda tu ganancia como negocio.
        </p>
        <p style={s.p}>
          Dos cosas que conviene evitar. Los <strong style={s.fuerte}>descuentos en porcentaje</strong> como premio
          ("10% off en tu próxima compra") se sienten flojos y son difíciles de tener
          en la cabeza: nadie se acuerda de que le falta poco para un 10%. Y los
          <strong style={s.fuerte}> regalos ajenos al negocio</strong>, tipo una taza o un llavero, te cuestan plata
          de verdad y no hacen que vuelva a comprarte lo que vendés.
        </p>

        {/* 2 */}
        <h2 style={s.h2}>2. Calculá cuánto te tiene que costar</h2>
        <p style={s.p}>
          Acá hay una cuenta que casi nadie hace y que define si el programa es
          rentable o si estás regalando margen.
        </p>
        <p style={s.p}>
          El premio no te cuesta lo que sale: te cuesta lo que te cuesta a vos
          producirlo. Un café que vendés a $4.000 quizás te cuesta $1.200 entre
          insumos y tiempo. Ese es el número que tenés que usar.
        </p>
        <p style={s.p}>
          Ahora pensalo como un descuento repartido. Si el cliente tiene que gastar
          $40.000 para ganarse ese café que te cuesta $1.200, estás dando un 3% de
          descuento. Comparalo con lo que te costaría una promo directa: un 10% off
          todo el mes es más caro y además se lo llevan también los que iban a
          comprar igual.
        </p>
        <div style={s.destacado}>
          <p style={{ ...s.p, margin: 0 }}>
            Esa es la ventaja real de un programa de puntos frente a un descuento:
            el descuento se lo lleva todo el mundo, el premio solo lo cobra el que
            volvió muchas veces. Pagás por la lealtad, no por la venta suelta.
          </p>
        </div>
        <p style={s.p}>
          Si al hacer la cuenta te da más de un 5% o 6%, probablemente estés dando
          un premio demasiado grande o pidiendo muy pocas compras.
        </p>

        {/* 3 */}
        <h2 style={s.h2}>3. Definí cada cuántas visitas se alcanza</h2>
        <p style={s.p}>
          Este es el número más importante de todos, y depende de algo que no tiene
          que ver con la plata: <strong style={s.fuerte}>cada cuánto vuelve naturalmente tu cliente</strong>.
        </p>
        <p style={s.p}>
          La tarjeta de sellos clásica pide diez compras, y funciona bien en negocios
          de mucha frecuencia. En una cafetería que ve al mismo cliente tres veces por
          semana, diez cafés son tres semanas: se alcanza rápido, la persona ve que
          avanza y se engancha.
        </p>
        <p style={s.p}>
          En una barbería, en cambio, el mismo cliente vuelve cada tres o cuatro
          semanas. Diez cortes son casi un año. Nadie sostiene la motivación tanto
          tiempo, y la mayoría abandona mucho antes de llegar. Ahí conviene que el
          premio esté a seis o siete visitas.
        </p>
        <div style={s.destacado}>
          <p style={{ ...s.p, margin: 0 }}>
            Una regla simple: <strong style={s.fuerte}>apuntá a que el primer premio se alcance en uno o dos
            meses</strong> de comportamiento normal del cliente. Si tarda más, la mayoría se
            cae en el camino. Si tarda mucho menos, estás regalando margen a gente
            que iba a volver igual.
          </p>
        </div>
        <p style={s.p}>
          Contá cada cuánto viene tu cliente típico, multiplicá por la cantidad de
          visitas que le vas a pedir, y fijate cuánto tiempo da. Ese número te dice
          más que cualquier fórmula.
        </p>

        {/* 4 */}
        <h2 style={s.h2}>4. Resolvé cómo se explica en el mostrador</h2>
        <p style={s.p}>
          Es la parte que más se subestima. Un programa de puntos no funciona solo
          porque exista: funciona si alguien lo menciona cuando el cliente está
          pagando. Sin esa frase, el cartel del mostrador lo ve todo el mundo y no lo
          registra nadie.
        </p>
        <p style={s.p}>
          La frase tiene que ser corta y mencionar <strong style={s.fuerte}>el premio, no el mecanismo</strong>.
          Comparalo:
        </p>
        <div style={s.comparacion}>
          <div style={s.mal}>
            <div style={s.etiquetaMal}>No funciona</div>
            <p style={s.cita}>"Tenemos un sistema de fidelización con puntos, ¿querés registrarte?"</p>
          </div>
          <div style={s.bien}>
            <div style={s.etiquetaBien}>Funciona</div>
            <p style={s.cita}>"¿Sabías que al séptimo corte te regalamos uno? Escaneá acá y ya quedás anotado."</p>
          </div>
        </div>
        <p style={s.p}>
          La primera obliga al cliente a entender un concepto abstracto mientras saca
          la billetera. La segunda le dice qué se gana y qué tiene que hacer, en ese
          orden.
        </p>
        <p style={s.p}>
          Si tenés empleados, esto es lo único que hay que entrenar. No necesitan
          saber cómo funciona el sistema por dentro: necesitan decir esa frase en cada
          cobro durante las primeras semanas, hasta que los clientes ya lo sepan.
        </p>

        {/* 5 */}
        <h2 style={s.h2}>5. Mirá los números correctos el primer mes</h2>
        <p style={s.p}>
          Es fácil mirar la métrica equivocada y sacar la conclusión equivocada.
        </p>
        <p style={s.p}>
          Cuánta gente se registró es la más visible y la menos útil. Alguien que se
          anota una vez y no vuelve no te dice nada: registrarse es gratis y no cuesta
          nada hacerlo por curiosidad.
        </p>
        <div style={s.destacado}>
          <p style={{ ...s.p, margin: 0 }}>
            El número que importa es <strong style={s.fuerte}>cuántos sumaron puntos por segunda vez</strong>. Esa
            es la primera vez que el programa hizo algo: alguien volvió y se acordó de
            usarlo. Si de veinte que se registraron volvieron doce, va bien. Si
            volvieron dos, el problema no es el premio, es que nadie se enteró de que
            existe.
          </p>
        </div>
        <p style={s.p}>
          El tercero es cuántos llegaron al premio. Ese tarda más en aparecer, y
          cuando aparece te dice si calibraste bien el punto 3. Si al segundo mes
          nadie llegó, está demasiado lejos.
        </p>

        {/* CIERRE */}
        <h2 style={s.h2}>En resumen</h2>
        <ul style={s.lista}>
          <li style={s.item}>Elegí primero el premio, y que sea algo que ya vendés.</li>
          <li style={s.item}>Calculá cuánto te cuesta de verdad: si supera el 5% o 6% de lo que gastó el cliente, achicalo.</li>
          <li style={s.item}>Que el primer premio se alcance en uno o dos meses de visitas normales.</li>
          <li style={s.item}>Preparate una frase corta para el mostrador que nombre el premio.</li>
          <li style={s.item}>Al mes, mirá cuántos volvieron a sumar, no cuántos se registraron.</li>
        </ul>

        <div style={s.cta}>
          <div style={s.ctaTitulo}>Si querés armarlo sin tarjetitas de cartón</div>
          <p style={{ ...s.p, marginBottom: 24 }}>
            Fielty hace esto desde el celular del cliente: escanea un QR en tu
            mostrador, suma puntos en cada compra y ve cuánto le falta para el premio,
            sin instalar ninguna app. Vos definís la regla y las recompensas, y el
            panel te muestra justamente cuántos volvieron a sumar.
          </p>
          <a href="/onboarding/registro" style={s.ctaBoton}>Empezá gratis →</a>
          <div style={s.ctaNota}>Plan gratis hasta 50 clientes, sin tarjeta de crédito.</div>
        </div>

        <div style={s.relacionados}>
          <div style={s.relacionadosTitulo}>Seguir leyendo</div>
          <a href="/para" style={s.relacionadoLink}>Cómo funciona según tu rubro →</a>
          <a href="/faq" style={s.relacionadoLink}>Preguntas frecuentes →</a>
          <a href="/guia" style={s.relacionadoLink}>Guía completa de Fielty →</a>
        </div>
      </article>

      <footer style={s.footer}>
        <a href="/terminos" style={s.footerLink}>Términos</a>
        <a href="/privacidad" style={s.footerLink}>Privacidad</a>
        <a href="/faq" style={s.footerLink}>FAQ</a>
        <a href="/para" style={s.footerLink}>Por rubro</a>
        <a href="/" style={s.footerLink}>fielty.app</a>
      </footer>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: theme.black, color: 'white', fontFamily: 'inherit' },
  nav: { borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoDot: { width: 8, height: 8, borderRadius: '50%', background: theme.red, boxShadow: '0 0 8px #e0001b' },
  logoText: { fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: -0.5 },
  navLink: { fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 500 },
  navCta: { fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 700, background: theme.red, padding: '9px 16px', borderRadius: 10 },

  // Ancho angosto a propósito: es texto largo para leer, no una landing.
  wrap: { maxWidth: 680, margin: '0 auto', padding: '64px 24px 40px' },
  badge: { display: 'inline-block', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 100, padding: '6px 16px', fontSize: 11, color: '#888', marginBottom: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' },
  h1: { fontSize: 'clamp(30px, 5.5vw, 44px)', fontWeight: 900, lineHeight: 1.12, letterSpacing: -1.2, marginBottom: 24, color: 'white' },
  bajada: { fontSize: 18, color: '#999', lineHeight: 1.8, marginBottom: 56 },

  h2: { fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 900, color: 'white', margin: '56px 0 20px', letterSpacing: -0.6, lineHeight: 1.25 },
  p: { fontSize: 16, color: '#999', lineHeight: 1.85, marginBottom: 20 },
  fuerte: { color: 'white', fontWeight: 700 },

  destacado: { borderLeft: `3px solid ${theme.red}`, background: '#141414', borderRadius: '0 12px 12px 0', padding: '20px 24px', margin: '28px 0' },

  comparacion: { display: 'flex', flexDirection: 'column', gap: 12, margin: '24px 0 28px' },
  mal: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '18px 20px' },
  bien: { background: '#1a1a1a', border: `1px solid ${theme.red}`, borderRadius: 14, padding: '18px 20px' },
  etiquetaMal: { fontSize: 10, fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 },
  etiquetaBien: { fontSize: 10, fontWeight: 800, color: theme.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 },
  cita: { fontSize: 16, color: 'white', lineHeight: 1.6, margin: 0, fontStyle: 'italic' },

  lista: { paddingLeft: 22, margin: '0 0 48px' },
  item: { fontSize: 16, color: '#999', lineHeight: 1.85, marginBottom: 12 },

  cta: { background: '#141414', border: '1px solid #222', borderRadius: 20, padding: '32px 28px', margin: '56px 0 40px' },
  ctaTitulo: { fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 12 },
  ctaBoton: { display: 'inline-block', background: theme.red, color: 'white', textDecoration: 'none', padding: '14px 28px', borderRadius: 14, fontSize: 15, fontWeight: 800 },
  ctaNota: { fontSize: 12, color: '#666', marginTop: 14 },

  relacionados: { borderTop: '1px solid #1a1a1a', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 12 },
  relacionadosTitulo: { fontSize: 11, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 },
  relacionadoLink: { fontSize: 15, color: theme.red, fontWeight: 700, textDecoration: 'none' },

  footer: { borderTop: '1px solid #1a1a1a', textAlign: 'center', padding: '28px 20px 44px', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' },
  footerLink: { fontSize: 13, color: '#444', textDecoration: 'none' },
}
