export const metadata = {
  title: 'Política de privacidad | Fielty',
  description: 'Cómo trata Fielty los datos personales de dueños de negocios y clientes, de acuerdo a la Ley 25.326 de Protección de Datos Personales de Argentina.',
  alternates: { canonical: '/privacidad' },
}

export default function Privacidad() {
  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', fontFamily: 'inherit' }}>

      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0001b', boxShadow: '0 0 8px #e0001b' }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>fielty</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/login" style={{ fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 500 }}>Ingresar</a>
          <a href="/onboarding/registro" style={{ fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 700, background: '#e0001b', padding: '9px 16px', borderRadius: 10 }}>Empezá →</a>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0001b', marginBottom: 16 }}>Legal</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: -1, lineHeight: 1.1 }}>Política de privacidad</h1>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>Última actualización: julio de 2026</p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>

        <Section title="1. Responsable del tratamiento">
          Fielty (en adelante &quot;nosotros&quot; o &quot;Fielty&quot;) es responsable del tratamiento de los datos personales de los dueños de negocios registrados en la plataforma. Para consultas sobre privacidad, podés contactarnos en <a href="mailto:hola@fielty.app" style={{ color: '#e0001b', textDecoration: 'none', fontWeight: 600 }}>hola@fielty.app</a>.
        </Section>

        <Section title="2. Qué datos recopilamos">
          <strong style={{ color: 'white' }}>De los dueños de negocios:</strong> nombre, email, nombre del negocio, configuración del programa de fidelización y datos de facturación procesados por Mercado Pago (no almacenamos datos de tarjetas de crédito).
          <br /><br />
          <strong style={{ color: 'white' }}>De los clientes de los negocios:</strong> nombre, DNI, email, número de WhatsApp (opcional) y fecha de nacimiento (opcional). Estos datos son cargados por los propios clientes al registrarse en el programa de un negocio.
          <br /><br />
          <strong style={{ color: 'white' }}>Datos de uso:</strong> actividad dentro de la plataforma (puntos acreditados, canjes, visitas) para el correcto funcionamiento del servicio.
        </Section>

        <Section title="3. Para qué usamos los datos">
          Los datos se utilizan exclusivamente para: prestar el servicio de fidelización, enviar notificaciones transaccionales relacionadas con el programa de puntos (acreditación de puntos, recupero de contraseña, cumpleaños), enviar campañas de reactivación por email en nombre del negocio a clientes inactivos (planes Pro y Business, con link de baja en cada envío), gestionar la suscripción y el cobro del servicio, y mejorar la plataforma. No vendemos ni cedemos datos personales a terceros con fines comerciales.
        </Section>

        <Section title="4. Almacenamiento y seguridad">
          Los datos se almacenan en Supabase (infraestructura PostgreSQL en la nube) con cifrado en tránsito (HTTPS/TLS) y en reposo. Las contraseñas se guardan hasheadas con bcrypt y nunca en texto plano. Aplicamos medidas técnicas razonables para proteger la información contra accesos no autorizados.
        </Section>

        <Section title="5. Servicios de terceros">
          Fielty utiliza los siguientes servicios de terceros para operar: Supabase (base de datos y autenticación), Vercel (hosting), Resend (envío de emails transaccionales), Mercado Pago (procesamiento de pagos) y Google Wallet (para los negocios en plan Business que ofrecen la tarjeta como pase de Google Wallet, se comparten los puntos y el nivel del cliente con la API de Google). Cada uno de estos servicios cuenta con su propia política de privacidad.
        </Section>

        <Section title="6. Retención de datos">
          Los datos de clientes se conservan mientras el negocio tenga una cuenta activa en Fielty. Al cancelar la cuenta, los datos se eliminan en un plazo de 30 días hábiles. Los dueños de negocios pueden solicitar la eliminación de su cuenta y datos en cualquier momento escribiendo a hola@fielty.app.
        </Section>

        <Section title="7. Derechos del titular de los datos">
          De acuerdo con la Ley 25.326 de Protección de Datos Personales de la República Argentina, tenés derecho a: acceder a tus datos personales, rectificarlos si son inexactos, solicitar su eliminación (derecho al olvido) y oponerte a su tratamiento. Para ejercer cualquiera de estos derechos, escribinos a <a href="mailto:hola@fielty.app" style={{ color: '#e0001b', textDecoration: 'none', fontWeight: 600 }}>hola@fielty.app</a> y te respondemos dentro de los 5 días hábiles.
        </Section>

        <Section title="8. Cookies">
          Fielty utiliza almacenamiento local del navegador (localStorage) para mantener tu sesión activa y guardar preferencias básicas. No utilizamos cookies de seguimiento ni publicidad de terceros.
        </Section>

        <Section title="9. Cambios en esta política">
          Podemos actualizar esta política ocasionalmente. Te notificaremos por email ante cambios significativos. El uso continuado del servicio tras la notificación implica la aceptación de la política actualizada.
        </Section>

        <Section title="10. Contacto">
          Para cualquier consulta relacionada con el tratamiento de tus datos personales, escribinos a{' '}
          <a href="mailto:hola@fielty.app" style={{ color: '#e0001b', textDecoration: 'none', fontWeight: 600 }}>hola@fielty.app</a>.
        </Section>

      </div>

      <div style={{ borderTop: '1px solid #1a1a1a', textAlign: 'center', padding: '24px 20px 40px', fontSize: 13, color: '#444' }}>
        <a href="/terminos" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Términos</a>
        <a href="/privacidad" style={{ color: '#888', textDecoration: 'none', marginRight: 20 }}>Privacidad</a>
        <a href="/" style={{ color: '#444', textDecoration: 'none' }}>fielty.app</a>
      </div>

    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 12 }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#888', lineHeight: 1.9 }}>{children}</p>
    </div>
  )
}
