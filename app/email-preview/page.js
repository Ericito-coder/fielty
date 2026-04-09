export default function EmailPreview() {
  const appUrl = 'https://www.fielty.app'
  const negocio = { nombre: 'Pet Point', slug: 'pet-point' }
  const registroUrl = `${appUrl}/registro/${negocio.slug}`
  const dashboardUrl = `${appUrl}/dashboard`

  return (
    <div style={{ background: '#e8eaf0', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: '#555', color: 'white', borderRadius: '8px 8px 0 0', padding: '10px 16px', fontSize: 13, display: 'flex', gap: 16 }}>
          <span>De: Fielty &lt;onboarding@resend.dev&gt;</span>
          <span>·</span>
          <span>Asunto: ¡Bienvenido a Fielty, {negocio.nombre}! 🎉</span>
        </div>
        <div style={{ background: 'white', borderRadius: '0 0 8px 8px', padding: '32px 24px' }}>

          <div style={{ marginBottom: 32 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#0e0e0e', letterSpacing: -0.5 }}>● fielty</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0e0e0e', marginBottom: 8 }}>
            ¡Tu programa de fidelización está listo! 🎉
          </h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
            <strong>{negocio.nombre}</strong> ya está activo en Fielty. Tus clientes pueden empezar a acumular puntos y canjear recompensas hoy mismo.
          </p>

          <div style={{ background: '#f5f6fa', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', margin: '0 0 8px' }}>Link de registro para tus clientes</p>
            <p style={{ fontSize: 14, color: '#0e0e0e', fontFamily: 'monospace', wordBreak: 'break-all', margin: '0 0 12px' }}>{registroUrl}</p>
            <a href={registroUrl} style={{ display: 'inline-block', background: '#0e0e0e', color: 'white', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Ver página de registro
            </a>
          </div>

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0e0e0e', marginBottom: 14 }}>3 pasos para empezar:</p>
            {[
              `Imprimí el QR y poné en el mostrador — tus clientes escanean para registrarse.`,
              `Usá la caja (fielty.app/c/${negocio.slug}) para acreditar puntos en cada compra.`,
              `Seguí las métricas desde tu panel y ajustá las recompensas cuando quieras.`,
            ].map((paso, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e0001b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: paso }} />
              </div>
            ))}
          </div>

          <a href={dashboardUrl} style={{ display: 'inline-block', background: '#e0001b', color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none', marginBottom: 40 }}>
            Ir a mi panel →
          </a>

          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 4 }}>
            ¿Tenés alguna duda? Respondé este email y te ayudamos.
          </p>
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 24, paddingTop: 24, borderTop: '1px solid #e8eaf0' }}>
            Fielty · <a href={appUrl} style={{ color: '#aaa', textDecoration: 'none' }}>fielty.app</a> ·{' '}
            <a href={`${appUrl}/terminos`} style={{ color: '#aaa', textDecoration: 'none' }}>Términos</a> ·{' '}
            <a href={`${appUrl}/privacidad`} style={{ color: '#aaa', textDecoration: 'none' }}>Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  )
}
