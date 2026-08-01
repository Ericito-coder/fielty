// Estilos compartidos por las landings de rubro (/para/*).
export const s = {
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

  faqList: { display: 'flex', flexDirection: 'column', gap: 28 },
  faqQ: { fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 8 },
  faqA: { fontSize: 15, color: '#777', lineHeight: 1.8, margin: 0 },

  otros: { padding: '0 32px 60px', textAlign: 'center' },
  otrosTexto: { fontSize: 15, color: '#666' },
  otrosLink: { color: '#e0001b', fontWeight: 700, textDecoration: 'none' },

  footer: { borderTop: '1px solid #1a1a1a', textAlign: 'center', padding: '28px 20px 44px', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' },
  footerLink: { fontSize: 13, color: '#444', textDecoration: 'none' },
}
