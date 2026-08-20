'use client'
import { theme } from '@/lib/theme'
import { useEffect, useState } from 'react'
import Icono from '@/app/components/Iconos'

// `prueba` llega del server component ya contada, redondeada y filtrada por el
// piso: acá es null o strings listos para pintar. A propósito no se importa
// nada de lib/metricas, que arrastra la service role key.
export default function LandingClient({ prueba }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      window.location.href = '/reset-password' + hash
      return
    }
    const handleScroll = () => setScrolled(window.scrollY > 40)
    // Se llama una vez además de suscribirse: si alguien recarga con la página
    // ya scrolleada, el nav arrancaba transparente hasta el primer scroll.
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={s.page}>

      {/* Único bloque de CSS de la página. El resto sigue en estilos inline
          como todo el archivo, pero el nav y el hero necesitan media queries
          y eso inline no existe: era la razón de fondo por la que el nav se
          resolvía con JS y por la que el hero no podía comprimirse en celular. */}
      <style>{`
        .fl-nav-inner { padding: 20px 32px; }
        .fl-nav-desktop { display: flex; align-items: center; gap: 28px; }
        .fl-nav-mobile { display: none; }
        .fl-menu-panel { display: none; }

        .fl-icono-caja { margin-bottom: 16px; }
        .fl-bento { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
        .fl-bento > article { grid-column: span 2; }
        .fl-bento > article.ancha { grid-column: span 4; }
        .fl-bento > article.banda { grid-column: span 6; display: flex; align-items: center; gap: 24px; }
        .fl-bento > article.banda .fl-bento-txt { flex: 1; }
        .fl-bento > article.banda .fl-icono-caja { margin-bottom: 0; }

        .fl-hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 32px 80px; }
        .fl-hero-badge { margin-bottom: 32px; }
        .fl-hero-h1 { margin-bottom: 24px; letter-spacing: -0.03em; }
        .fl-hero-def { font-size: 15px; margin: 0 auto 16px; }
        .fl-hero-sub { font-size: 20px; margin: 0 auto 40px; }
        .fl-hero-ctas { margin-bottom: 60px; }

        @media (max-width: 767px) {
          .fl-nav-desktop { display: none; }
          .fl-nav-mobile { display: flex; align-items: center; gap: 10px; }
          .fl-nav-inner { padding: 14px 20px; }

          .fl-menu-panel {
            display: flex; flex-direction: column;
            position: absolute; top: 100%; left: 0; right: 0;
            background: rgba(10,10,10,0.98); backdrop-filter: blur(12px);
            border-top: 1px solid #1e1e1e; border-bottom: 1px solid #1e1e1e;
            padding: 4px 20px 12px;
          }
          .fl-menu-panel a {
            padding: 15px 2px; font-size: 15px; font-weight: 500;
            color: ${theme.darkText}; text-decoration: none;
            border-bottom: 1px solid #1a1a1a;
          }
          .fl-menu-panel a:last-child { border-bottom: none; }

          /* El CTA del hero arrancaba en el pixel 640: abajo del fold de
             cualquier celular chico. Esto es todo lo que hace falta para
             subirlo, sin tocar el copy ni sacar la definición que necesita GEO. */
          .fl-hero { min-height: auto; padding: 86px 20px 56px; }
          .fl-hero-badge { margin-bottom: 18px; }
          .fl-hero-h1 { margin-bottom: 14px; }
          .fl-hero-def { font-size: 14px; margin: 0 auto 10px; }
          .fl-hero-sub { font-size: 17px; margin: 0 auto 28px; }
          .fl-hero-ctas { margin-bottom: 40px; }
        }

        @media (max-width: 900px) {
          .fl-bento { grid-template-columns: repeat(2, 1fr); }
          .fl-bento > article { grid-column: span 1; }
          /* La grande pasa a ocupar la fila entera: con 5 cards en 2 columnas,
             si no, queda una sola card colgada al lado de un hueco. */
          .fl-bento > article.ancha { grid-column: span 2; }
          .fl-bento > article.banda { grid-column: span 2; }
        }

        @media (max-width: 600px) {
          .fl-bento { grid-template-columns: 1fr; gap: 16px; }
          .fl-bento > article, .fl-bento > article.ancha, .fl-bento > article.banda { grid-column: span 1; }
          .fl-bento > article.banda { display: block; }
          .fl-bento > article.banda .fl-icono-caja { margin-bottom: 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{...s.nav, background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none'}}>
        <div className="fl-nav-inner" style={s.navInner}>
          <div style={s.navLogo}>
            <div style={s.logoDot} />
            <span style={s.logoText}>fielty</span>
          </div>

          {/* Las dos versiones van siempre en el HTML y las cambia el CSS.
              Antes esto era un ternario sobre estado de JS, así que el HTML del
              servidor siempre mandaba la versión de escritorio: en un celular
              se pintaba el nav ancho y recién después saltaba al compacto. */}
          <div className="fl-nav-desktop">
            <a href="#como-funciona" style={s.navLink}>Cómo funciona</a>
            <a href="#precios" style={s.navLink}>Precios</a>
            <a href="/para" style={s.navLink}>Por rubro</a>
            <a href="/faq" style={s.navLink}>FAQ</a>
            <a href="/login" style={s.navLink}>Ingresar</a>
            <a href="/onboarding/registro" style={s.navCta}>Empezá gratis</a>
          </div>

          <div className="fl-nav-mobile">
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              style={s.menuBoton}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                {menuAbierto ? (
                  <>
                    <line x1="5" y1="5" x2="15" y2="15" />
                    <line x1="15" y1="5" x2="5" y2="15" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="17" y2="6" />
                    <line x1="3" y1="10" x2="17" y2="10" />
                    <line x1="3" y1="14" x2="17" y2="14" />
                  </>
                )}
              </svg>
            </button>
            <a href="/onboarding/registro" style={s.navCtaMobile}>Empezá gratis</a>
          </div>

          {menuAbierto && (
            <div className="fl-menu-panel">
              {[
                ['#como-funciona', 'Cómo funciona'],
                ['#precios', 'Precios'],
                ['/para', 'Por rubro'],
                ['/faq', 'FAQ'],
                ['/login', 'Ingresar'],
              ].map(([href, texto]) => (
                <a key={href} href={href} onClick={() => setMenuAbierto(false)}>{texto}</a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="fl-hero" style={s.hero}>
        <div style={s.heroInner}>
          <div className="fl-hero-badge" style={s.heroBadge}>✦ Para negocios con local, no para e-commerce</div>
          <h1 className="fl-hero-h1" style={s.heroTitle}>
            Fidelizá clientes.<br/>
            <span style={s.heroGradient}>Hacelos volver.</span>
          </h1>
          <p className="fl-hero-def" style={s.heroDefinicion}>
            Fielty es un programa de fidelización de clientes con puntos por QR, sin app, para negocios físicos en Argentina.
          </p>
          <p className="fl-hero-sub" style={s.heroSub}>
            Mostrás un QR en el mostrador. Cada cliente que compra escanea, suma puntos y los ve en el celular sin instalar nada. Vos elegís cuánto vale cada compra y qué se puede canjear.
          </p>
          <div className="fl-hero-ctas" style={s.heroCtas}>
            <a href="/onboarding/registro" style={s.ctaPrimary}>Empezá gratis</a>
            <a href="#como-funciona" style={s.ctaSecondary}>Ver cómo funciona</a>
          </div>
          <div style={s.heroStats}>
            <div style={s.stat}><span style={s.statNum}>5 min</span><span style={s.statLabel}>para configurarlo</span></div>
            <div style={s.statDivider} />
            <div style={s.stat}><span style={s.statNum}>0</span><span style={s.statLabel}>apps para descargar</span></div>
            <div style={s.statDivider} />
            <div style={s.stat}><span style={s.statNum}>100%</span><span style={s.statLabel}>desde el celular</span></div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionBadge}>Cómo funciona</div>
          <h2 style={s.sectionTitle}>Tres pasos y listo</h2>
          <p style={s.sectionSub}>Nada de instalar terminales ni capacitar a nadie. Si sabés usar WhatsApp, sabés usar Fielty.</p>
          <div style={s.stepsGrid}>
            {[
              { num:'01', icono:'ajustes', title:'Configurá tu negocio', desc:'Ponés el nombre y el color de tu marca, y definís la regla: por ejemplo, 1 punto cada $100. Elegís qué premios das, desde un café gratis hasta un descuento del 20%.' },
              { num:'02', icono:'qr', title:'Compartí el QR', desc:'Te generamos un QR para imprimir y pegar en la caja o el mostrador. El cliente lo escanea con la cámara, carga nombre y DNI, y ya tiene su tarjeta digital.' },
              { num:'03', icono:'ticket', title:'Cargás cada venta', desc:'En cada compra, buscás al cliente por nombre o DNI desde la caja y cargás el monto. Cuando junta suficientes puntos, canjea el premio con un código que vos validás antes de entregarlo.' },
            ].map((step, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <div className="fl-icono-caja" style={s.iconoCaja}><Icono nombre={step.icono} /></div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <div style={s.stepDesc}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{...s.section, background:'#0a0a0a'}}>
        <div style={s.sectionInner}>
          <div style={s.sectionBadge}>Features</div>
          <h2 style={s.sectionTitle}>Todo lo que hace que vuelvan</h2>

          {/* Bento en vez de seis cards idénticas: el mecanismo central manda,
              los referidos cierran la sección con una banda, y el resto son
              secundarias. Seis cards iguales no dicen cuál importa más. */}
          <div className="fl-bento">
            {[
              { forma:'ancha', icono:'estrella', title:'Puntos por compra', desc:'Vos definís cada cuántos pesos se suman puntos: cada $100, cada $500, o lo que tenga sentido para lo que gasta un cliente tuyo.' },
              { icono:'medalla', title:'Niveles de lealtad', desc:'Bronce, Plata y Oro. Vos definís cuántos puntos hacen falta para subir de nivel y qué beneficio extra da cada uno.' },
              { icono:'calendario', title:'Puntos de cumpleaños', desc:'El día del cumpleaños de un cliente le acreditamos puntos extra de forma automática. Vos no tenés que acordarte.' },
              { icono:'local', title:'Multi-sucursal', desc:'Cada sucursal tiene su propia caja con PIN propio, pero el cliente suma puntos sin importar en qué local compre.' },
              { icono:'grafico', title:'Métricas en tiempo real', desc:'Cuántos clientes tenés, quiénes son los más activos y qué sucursal vende más, todo desde el panel.' },
              { forma:'banda', icono:'personas', title:'Sistema de referidos', desc:'Cuando un cliente invita a un amigo y ese amigo se registra, los dos suman puntos. Clientes nuevos sin gastar en publicidad.' },
            ].map((f) => (
              <article key={f.title} className={f.forma} style={s.featureCard}>
                <div className="fl-icono-caja" style={s.iconoCaja}><Icono nombre={f.icono} /></div>
                <div className="fl-bento-txt">
                  <h3 style={f.forma === 'ancha' ? s.featureTitleGrande : s.featureTitle}>{f.title}</h3>
                  <div style={s.featureDesc}>{f.desc}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRUEBA SOCIAL — va justo antes de precios a propósito: primero se
          muestra que otros ya lo usan y recién después se pide la plata.
          Solo aparece si los números dan (ver PISO_NEGOCIOS en lib/metricas). */}
      {prueba && (
        <section style={{padding:'0 32px', textAlign:'center'}}>
          <p style={s.pruebaSocial}>
            <strong style={s.pruebaNum}>{prueba.negocios}</strong> negocios ya armaron su programa de puntos con Fielty
            {prueba.clientes && <>, y <strong style={s.pruebaNum}>{prueba.clientes}</strong> clientes suman desde el celular</>}
          </p>
        </section>
      )}

      {/* PRECIOS */}
      <section id="precios" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionBadge}>Precios</div>
          <h2 style={s.sectionTitle}>Simple y transparente</h2>
          <p style={s.sectionSub}>Empezá gratis y crecé cuando lo necesites.</p>
          <div style={s.pricingGrid}>
            {[
              {
                nombre: 'Gratis',
                precio: '$0',
                periodo: 'siempre',
                color: theme.darkMuted,
                colorTexto: theme.darkMuted,
                features: ['Hasta 50 clientes', '1 sucursal', 'Puntos, niveles y referidos', 'Caja con escáner QR', 'Tarjeta digital sin app', 'Tarjeta de cliente en Google Wallet'],
                cta: 'Empezá gratis',
                href: '/onboarding/registro',
                destacado: false,
              },
              {
                nombre: 'Pro',
                precio: '$20.000',
                periodo: 'por mes',
                color: theme.red,
                colorTexto: theme.redOnDark,  // el rojo pleno sobre la card da 3.5:1: para texto va el claro
                features: ['Clientes ilimitados', 'Hasta 3 sucursales', 'Campañas de email a inactivos', 'Tu logo en la tarjeta del cliente y en Wallet', 'Exportar clientes a CSV', 'Soporte por WhatsApp'],
                cta: 'Empezá con Pro',
                href: '/onboarding/registro?plan=pro',
                destacado: true,
              },
              {
                nombre: 'Business',
                precio: '$35.000',
                periodo: 'por mes',
                color: theme.gold,
                colorTexto: theme.gold,
                features: ['Todo lo de Pro', 'Sucursales ilimitadas', 'WhatsApp automático (próximamente)', 'Soporte prioritario'],
                cta: 'Empezá con Business',
                href: '/onboarding/registro?plan=business',
                destacado: false,
              },
            ].map((plan, i) => (
              // El borde va del mismo grosor en las tres: cambia el color, no el
              // ancho. Con 1px contra 2px los botones quedaban 1px desalineados.
              <div key={i} style={{...s.planCard, border: `2px solid ${plan.destacado ? plan.color : '#1e1e1e'}`}}>
                {plan.destacado && <div style={{...s.planBadge, background: plan.color}}>Más popular</div>}
                <h3 style={{fontSize:18, fontWeight:800, color:'white', margin:'0 0 8px'}}>{plan.nombre}</h3>
                <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:4}}>
                  <span style={{fontSize:36, fontWeight:900, color:'white', fontFamily:'monospace'}}>{plan.precio}</span>
                </div>
                <div style={{fontSize:13, color:theme.darkMuted, marginBottom:24}}>{plan.periodo}</div>
                <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:28}}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{display:'flex', alignItems:'center', gap:8, fontSize:14, color:theme.darkText}}>
                      <span style={{color: plan.colorTexto, fontWeight:700}}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <a href={plan.href} style={{...s.planCta, background: plan.destacado ? plan.color : '#1e1e1e', color:'white'}}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:32, fontSize:14, color:theme.darkMuted}}>
            Sin permanencia ni costo de instalación: cancelás cuando quieras. <a href="/onboarding/registro" style={{color:theme.redOnDark, fontWeight:700}}>Empezá gratis</a>
          </div>
        </div>
      </section>

      {/* POR RUBRO */}
      <section style={{padding:'0 32px 40px', textAlign:'center'}}>
        <div style={{fontSize:15, color:theme.darkText, marginBottom:12}}>Mirá cómo funciona en tu rubro</div>
        <div style={{display:'flex', gap:'12px 20px', justifyContent:'center', flexWrap:'wrap'}}>
          {[
            ['/para/barberias', 'Barberías'],
            ['/para/cafeterias', 'Cafeterías'],
            ['/para/peluquerias', 'Peluquerías'],
            ['/para/veterinarias', 'Veterinarias y pet shops'],
            ['/para/gimnasios', 'Gimnasios'],
            ['/para/restaurantes', 'Restaurantes'],
            ['/para/panaderias', 'Panaderías'],
            ['/para/kioscos', 'Kioscos y despensas'],
          ].map(([href, nombre]) => (
            <a key={href} href={href} style={{color:theme.redOnDark, fontWeight:700, textDecoration:'none', fontSize:15}}>
              {nombre}
            </a>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{...s.section, background:'#0a0a0a', textAlign:'center'}}>
        <div style={{...s.sectionInner, maxWidth:600}}>
          <div style={s.logoDot2} />
          <h2 style={{...s.sectionTitle, fontSize: 36}}>¿Listo para fidelizar?</h2>
          <p style={{...s.sectionSub, maxWidth:480, margin:'0 auto 32px'}}>
            Configurá tu programa de puntos en 5 minutos y empezá a retener clientes desde hoy. Sin tarjeta de crédito.
          </p>
          <a href="/onboarding/registro" style={{...s.ctaPrimary, fontSize:18, padding:'18px 40px'}}>
            Empezá gratis
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.navLogo}>
            <div style={s.logoDot} />
            <span style={s.logoText}>fielty</span>
          </div>
          <div style={{fontSize:13, color: theme.darkMuted}}>© 2026 Fielty. Todos los derechos reservados.</div>
          <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
            <a href="/terminos" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Términos y condiciones</a>
            <a href="/privacidad" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Política de privacidad</a>
            <a href="/faq" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>FAQ</a>
            <a href="/guia" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Guía completa</a>
            <a href="/como-armar-un-programa-de-puntos" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Cómo armar un programa de puntos</a>
            <a href="/para" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Por rubro</a>
            <a href="https://www.instagram.com/fieltyapp" target="_blank" rel="noreferrer me" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Instagram</a>
            <a href="/login" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Ingresar</a>
            <a href="/onboarding/registro" style={{fontSize:13, color: theme.darkMuted, textDecoration:'none'}}>Empezá gratis</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:theme.black, color:'white', fontFamily:'inherit' },
  nav: { position:'fixed', top:0, left:0, right:0, zIndex:100, transition:'background 0.3s, backdrop-filter 0.3s' }, // lo único que cambia al scrollear
  navInner: { maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' },
  navLogo: { display:'flex', alignItems:'center', gap:8 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:theme.red, boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:20, fontWeight:800, color:'white', letterSpacing:-0.5 },
  navLinks: { display:'flex', alignItems:'center', gap:28 },
  navLink: { fontSize:14, color:theme.darkText, textDecoration:'none', fontWeight:500 },
  menuBoton: { background:'transparent', border:'none', padding:8, margin:'0 -4px 0 0', color:theme.darkText, cursor:'pointer', display:'flex', alignItems:'center', borderRadius:8 },
  navCtaMobile: { fontSize:13, color:'white', textDecoration:'none', fontWeight:700, background:theme.red, padding:'9px 16px', borderRadius:10, whiteSpace:'nowrap' },
  navCta: { fontSize:14, color:'white', textDecoration:'none', fontWeight:700, background:theme.red, padding:'10px 20px', borderRadius:10 },
  hero: { position:'relative' }, // el layout va en .fl-hero, que necesita media query
  heroInner: { maxWidth:800, textAlign:'center' },
  heroBadge: { display:'inline-block', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:100, padding:'8px 20px', fontSize:13, color:theme.darkMuted, fontWeight:500 },
  heroTitle: { fontSize:'clamp(36px, 8vw, 72px)', fontWeight:900, lineHeight:1.05, color:'white' },
  heroGradient: { background:'linear-gradient(135deg, #e0001b, #f0a500)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  heroDefinicion: { color:theme.darkText, lineHeight:1.6, maxWidth:520 },
  heroSub: { color:theme.darkText, lineHeight:1.7, maxWidth:580 },
  heroCtas: { display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' },
  ctaPrimary: { background:theme.red, color:'white', textDecoration:'none', padding:'16px 32px', borderRadius:14, fontSize:16, fontWeight:800 },
  ctaSecondary: { background:'#1a1a1a', color:'white', textDecoration:'none', padding:'16px 32px', borderRadius:14, fontSize:16, fontWeight:600, border:'1px solid #2a2a2a' },
  heroStats: { display:'flex', alignItems:'center', justifyContent:'center', gap:32, flexWrap:'wrap' },
  stat: { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  statNum: { fontSize:28, fontWeight:900, color:'white', fontFamily:'monospace' },
  statLabel: { fontSize:12, color:theme.darkMuted },
  statDivider: { width:1, height:40, background:'#2a2a2a' },
  section: { padding:'100px 32px' },
  sectionInner: { maxWidth:1100, margin:'0 auto' },
  sectionBadge: { display:'inline-block', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:100, padding:'6px 16px', fontSize:12, color:theme.darkMuted, marginBottom:20, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' },
  sectionTitle: { fontSize:'clamp(28px, 5vw, 48px)', fontWeight:900, color:'white', marginBottom:16, letterSpacing:-1 },
  sectionSub: { fontSize:18, color:theme.darkText, lineHeight:1.7, marginBottom:60 },
  stepsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 },
  stepCard: { background:'#1a1a1a', borderRadius:24, padding:32, border:'1px solid #2a2a2a' },
  stepNum: { fontSize:11, fontWeight:700, color: theme.darkMuted, letterSpacing:'0.1em', marginBottom:16 },
  iconoCaja: { width:40, height:40, borderRadius:11, background:'#1f1f1f', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', color:theme.darkText, flexShrink:0 },
  stepTitle: { fontSize:20, fontWeight:800, color:'white', margin:'0 0 10px' },
  stepDesc: { fontSize:14, color:theme.darkText, lineHeight:1.7 },
  featureCard: { background:'#1a1a1a', borderRadius:20, padding:28, border:'1px solid #1e1e1e' },
  featureTitle: { fontSize:17, fontWeight:800, color:'white', margin:'0 0 8px' },
  featureTitleGrande: { fontSize:22, fontWeight:800, color:'white', margin:'0 0 10px' },
  featureDesc: { fontSize:14, color:theme.darkText, lineHeight:1.7 },
  pricingGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 },
  planCard: { background:'#1a1a1a', borderRadius:24, padding:32, position:'relative', display:'flex', flexDirection:'column' },
  planBadge: { position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', padding:'4px 16px', borderRadius:100, fontSize:11, fontWeight:700, color:'white', whiteSpace:'nowrap' },
  pruebaSocial: { maxWidth:640, margin:'0 auto', fontSize:16, lineHeight:1.7, color:theme.darkText },
  pruebaNum: { color:'white', fontWeight:800 },
  planCta: { display:'block', textAlign:'center', padding:'14px 24px', borderRadius:12, fontSize:15, fontWeight:700, textDecoration:'none', marginTop:'auto' }, // pega los tres botones abajo, ahora que las cards miden lo mismo
  footer: { borderTop:'1px solid #1a1a1a', padding:'32px' },
  footerInner: { maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 },
  logoDot2: { width:12, height:12, borderRadius:'50%', background:theme.red, boxShadow:'0 0 14px #e0001b', margin:'0 auto 24px' },
}
