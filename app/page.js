'use client'
import { useEffect, useState } from 'react'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      window.location.href = '/reset-password' + hash
      return
    }
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={{...s.nav, background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none'}}>
        <div style={s.navInner}>
          <div style={s.navLogo}>
            <div style={s.logoDot} />
            <span style={s.logoText}>fielty</span>
          </div>
          {isMobile ? (
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <a href="/login" style={{fontSize:13, color:'#888', textDecoration:'none', fontWeight:500, padding:'8px 12px'}}>Ingresar</a>
              <a href="/onboarding/registro" style={{fontSize:13, color:'white', textDecoration:'none', fontWeight:700, background:'#e0001b', padding:'9px 16px', borderRadius:10}}>Empezá →</a>
            </div>
          ) : (
            <div style={{display:'flex', alignItems:'center', gap:28}}>
              <a href="#como-funciona" style={s.navLink}>Cómo funciona</a>
              <a href="#precios" style={s.navLink}>Precios</a>
              <a href="/login" style={s.navLink}>Ingresar</a>
              <a href="/onboarding/registro" style={s.navCta}>Empezá gratis →</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>✦ Sin app. Sin complicaciones.</div>
          <h1 style={s.heroTitle}>
            Fidelizá clientes.<br/>
            <span style={s.heroGradient}>Hacelos volver.</span>
          </h1>
          <p style={s.heroSub}>
            Fielty es el programa de puntos más simple para tu negocio. Tus clientes escanean un QR, acumulan puntos y vuelven por más — sin descargar nada.
          </p>
          <div style={s.heroCtas}>
            <a href="/onboarding/registro" style={s.ctaPrimary}>Empezá gratis →</a>
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
          <p style={s.sectionSub}>Configurá tu programa de fidelización en minutos y empezá a retener clientes desde hoy.</p>
          <div style={s.stepsGrid}>
            {[
              { num:'01', icon:'⚙️', title:'Configurá tu negocio', desc:'Elegí el nombre, colores y regla de puntos. Definí las recompensas que querés ofrecer.' },
              { num:'02', icon:'📲', title:'Compartí el QR', desc:'Imprimí el código QR y ponelo en el mostrador. Tus clientes lo escanean y se registran en 30 segundos.' },
              { num:'03', icon:'🎁', title:'Tus clientes vuelven', desc:'Cada compra suma puntos. Cuando acumulan suficiente, canjean sus premios directamente desde el celular.' },
            ].map((step, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <div style={s.stepIcon}>{step.icon}</div>
                <div style={s.stepTitle}>{step.title}</div>
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
          <h2 style={s.sectionTitle}>Todo lo que necesitás</h2>
          <div style={s.featuresGrid}>
            {[
              { icon:'⭐', title:'Puntos por compra', desc:'Configurá cuánto vale cada compra en puntos. Simple y flexible.' },
              { icon:'🎂', title:'Puntos de cumpleaños', desc:'Tus clientes reciben puntos de regalo automáticamente el día de su cumpleaños.' },
              { icon:'🤝', title:'Sistema de referidos', desc:'Tus clientes invitan amigos y los dos ganan puntos. Crecimiento orgánico garantizado.' },
              { icon:'🥇', title:'Niveles de lealtad', desc:'Bronce, Plata y Oro. Cuanto más compran, más beneficios tienen.' },
              { icon:'🏪', title:'Multi-sucursal', desc:'Cada sucursal tiene su propia caja con PIN. Los clientes acumulan puntos en cualquier local.' },
              { icon:'📊', title:'Métricas en tiempo real', desc:'Ves cuántos clientes tenés, cuáles son los más activos y qué sucursal genera más.' },
            ].map((f, i) => (
              <div key={i} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                color: '#333',
                features: ['Hasta 50 clientes', '1 sucursal', 'Puntos y canjes', 'QR de registro', 'Tarjeta digital'],
                cta: 'Empezar gratis',
                href: '/onboarding/registro',
                destacado: false,
              },
              {
                nombre: 'Pro',
                precio: '$10.000',
                precioOriginal: '$20.000',
                periodo: 'por mes · primer año',
                color: '#e0001b',
                features: ['Clientes ilimitados', 'Hasta 3 sucursales', 'Métricas por sucursal', 'Puntos de cumpleaños', 'Sistema de referidos', 'Soporte por WhatsApp'],
                cta: 'Empezar con Pro',
                href: '/onboarding/registro?plan=pro_early',
                destacado: true,
                oferta: true,
              },
              {
                nombre: 'Business',
                precio: '$35.000',
                periodo: 'por mes',
                color: '#f0a500',
                features: ['Todo lo de Pro', 'Sucursales ilimitadas', 'Logo personalizado en tarjeta', 'Exportar clientes a CSV', 'Soporte prioritario'],
                cta: 'Empezar con Business',
                href: '/onboarding/registro?plan=business',
                destacado: false,
              },
            ].map((plan, i) => (
              <div key={i} style={{...s.planCard, border: plan.destacado ? `2px solid ${plan.color}` : '1px solid #1e1e1e', transform: plan.destacado ? 'scale(1.04)' : 'scale(1)'}}>
                {plan.destacado && <div style={{...s.planBadge, background: plan.color}}>Más popular</div>}
                <div style={{fontSize:18, fontWeight:800, color:'white', marginBottom:8}}>{plan.nombre}</div>
                {plan.precioOriginal && (
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                    <span style={{fontSize:16, color:'#555', fontFamily:'monospace', textDecoration:'line-through'}}>{plan.precioOriginal}</span>
                    <span style={{background:'#e0001b', color:'white', fontSize:11, fontWeight:800, padding:'3px 8px', borderRadius:100}}>50% OFF</span>
                  </div>
                )}
                <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:4}}>
                  <span style={{fontSize:36, fontWeight:900, color:'white', fontFamily:'monospace'}}>{plan.precio}</span>
                </div>
                <div style={{fontSize:13, color:'#555', marginBottom:24}}>{plan.periodo}</div>
                <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:28}}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{display:'flex', alignItems:'center', gap:8, fontSize:14, color:'#888'}}>
                      <span style={{color: plan.color, fontWeight:700}}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <a href={plan.href} style={{...s.planCta, background: plan.destacado ? plan.color : '#1e1e1e', color:'white'}}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:32, fontSize:14, color:'#555'}}>
            🎁 <strong style={{color:'#888'}}>Por ser de los primeros:</strong> 50% de descuento en el plan Pro por un año. <a href="/onboarding/registro" style={{color:'#e0001b', fontWeight:700}}>Registrate ahora →</a>
          </div>
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
            Empezá gratis →
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
          <div style={{fontSize:13, color:'#333'}}>© 2026 Fielty. Todos los derechos reservados.</div>
          <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
            <a href="/terminos" style={{fontSize:13, color:'#333', textDecoration:'none'}}>Términos y condiciones</a>
            <a href="/privacidad" style={{fontSize:13, color:'#333', textDecoration:'none'}}>Política de privacidad</a>
            <a href="/login" style={{fontSize:13, color:'#333', textDecoration:'none'}}>Ingresar</a>
            <a href="/onboarding/registro" style={{fontSize:13, color:'#333', textDecoration:'none'}}>Registrarse</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'#0e0e0e', color:'white', fontFamily:'inherit' },
  nav: { position:'fixed', top:0, left:0, right:0, zIndex:100, transition:'all 0.3s' },
  navInner: { maxWidth:1100, margin:'0 auto', padding:'20px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  navLogo: { display:'flex', alignItems:'center', gap:8 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:20, fontWeight:800, color:'white', letterSpacing:-0.5 },
  navLinks: { display:'flex', alignItems:'center', gap:28 },
  navLink: { fontSize:14, color:'#888', textDecoration:'none', fontWeight:500 },
  navCta: { fontSize:14, color:'white', textDecoration:'none', fontWeight:700, background:'#e0001b', padding:'10px 20px', borderRadius:10 },
  hero: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 32px 80px', position:'relative' },
  heroInner: { maxWidth:800, textAlign:'center' },
  heroBadge: { display:'inline-block', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:100, padding:'8px 20px', fontSize:13, color:'#888', marginBottom:32, fontWeight:500 },
  heroTitle: { fontSize:'clamp(36px, 8vw, 72px)', fontWeight:900, lineHeight:1.05, letterSpacing:-2, marginBottom:24, color:'white' },
  heroGradient: { background:'linear-gradient(135deg, #e0001b, #f0a500)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  heroSub: { fontSize:20, color:'#666', lineHeight:1.7, marginBottom:40, maxWidth:580, margin:'0 auto 40px' },
  heroCtas: { display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginBottom:60 },
  ctaPrimary: { background:'#e0001b', color:'white', textDecoration:'none', padding:'16px 32px', borderRadius:14, fontSize:16, fontWeight:800 },
  ctaSecondary: { background:'#1a1a1a', color:'white', textDecoration:'none', padding:'16px 32px', borderRadius:14, fontSize:16, fontWeight:600, border:'1px solid #2a2a2a' },
  heroStats: { display:'flex', alignItems:'center', justifyContent:'center', gap:32, flexWrap:'wrap' },
  stat: { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  statNum: { fontSize:28, fontWeight:900, color:'white', fontFamily:'monospace' },
  statLabel: { fontSize:12, color:'#555' },
  statDivider: { width:1, height:40, background:'#2a2a2a' },
  section: { padding:'100px 32px' },
  sectionInner: { maxWidth:1100, margin:'0 auto' },
  sectionBadge: { display:'inline-block', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:100, padding:'6px 16px', fontSize:12, color:'#888', marginBottom:20, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' },
  sectionTitle: { fontSize:'clamp(28px, 5vw, 48px)', fontWeight:900, color:'white', marginBottom:16, letterSpacing:-1 },
  sectionSub: { fontSize:18, color:'#555', lineHeight:1.7, marginBottom:60 },
  stepsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 },
  stepCard: { background:'#1a1a1a', borderRadius:24, padding:32, border:'1px solid #2a2a2a' },
  stepNum: { fontSize:11, fontWeight:700, color:'#333', letterSpacing:'0.1em', marginBottom:16 },
  stepIcon: { fontSize:36, marginBottom:16 },
  stepTitle: { fontSize:20, fontWeight:800, color:'white', marginBottom:10 },
  stepDesc: { fontSize:14, color:'#666', lineHeight:1.7 },
  featuresGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:20 },
  featureCard: { background:'#1a1a1a', borderRadius:20, padding:28, border:'1px solid #1e1e1e' },
  featureIcon: { fontSize:32, marginBottom:14 },
  featureTitle: { fontSize:17, fontWeight:800, color:'white', marginBottom:8 },
  featureDesc: { fontSize:14, color:'#555', lineHeight:1.7 },
  pricingGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24, alignItems:'center' },
  planCard: { background:'#1a1a1a', borderRadius:24, padding:32, position:'relative' },
  planBadge: { position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', padding:'4px 16px', borderRadius:100, fontSize:11, fontWeight:700, color:'white', whiteSpace:'nowrap' },
  planCta: { display:'block', textAlign:'center', padding:'14px 24px', borderRadius:12, fontSize:15, fontWeight:700, textDecoration:'none' },
  footer: { borderTop:'1px solid #1a1a1a', padding:'32px' },
  footerInner: { maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 },
  logoDot2: { width:12, height:12, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 14px #e0001b', margin:'0 auto 24px' },
}