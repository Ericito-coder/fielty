export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0001b', boxShadow: '0 0 8px #e0001b' }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>fielty</span>
        </div>

        <div style={{ fontSize: 96, fontWeight: 900, color: '#1a1a1a', lineHeight: 1, marginBottom: 8, letterSpacing: -4 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 12 }}>Esta página no existe</h1>
        <p style={{ fontSize: 15, color: '#555', marginBottom: 40, lineHeight: 1.6 }}>
          El link que seguiste puede estar roto o la página fue removida.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ display: 'inline-block', background: '#e0001b', color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Ir al inicio →
          </a>
          <a href="/dashboard" style={{ display: 'inline-block', background: '#1a1a1a', color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Ir al panel
          </a>
        </div>
      </div>
    </div>
  )
}
