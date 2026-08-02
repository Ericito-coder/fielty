export const metadata = {
  title: 'Términos y condiciones | Fielty',
  description: 'Términos y condiciones de uso de Fielty, la plataforma de fidelización de clientes para negocios.',
  alternates: { canonical: '/terminos' },
}

export default function Terminos() {
  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', fontFamily: 'inherit' }}>

      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0001b', boxShadow: '0 0 8px #e0001b' }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>fielty</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/login" style={{ fontSize: 13, color: '#666', textDecoration: 'none', fontWeight: 500 }}>Ingresar</a>
          <a href="/onboarding/registro" style={{ fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 700, background: '#e0001b', padding: '9px 16px', borderRadius: 10 }}>Empezá →</a>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0001b', marginBottom: 16 }}>Legal</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: -1, lineHeight: 1.1 }}>Términos y condiciones</h1>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>Última actualización: mayo de 2026</p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>

        <Section title="1. Aceptación de los términos">
          Al registrarte y usar Fielty, aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de ellos, no debés usar el servicio. Fielty se reserva el derecho de modificar estos términos en cualquier momento, notificando los cambios por email o mediante un aviso en la plataforma.
        </Section>

        <Section title="2. Descripción del servicio">
          Fielty es una plataforma de fidelización de clientes para negocios. Permite a los dueños de negocios crear programas de puntos digitales, y a sus clientes acumular y canjear recompensas sin necesidad de descargar una aplicación. El servicio se presta a través del sitio web fielty.app.
        </Section>

        <Section title="3. Cuentas de negocios">
          Para usar Fielty como negocio, debés registrarte con información verídica y completa. Sos responsable de mantener la confidencialidad de tu contraseña y del PIN de caja de tu negocio. Cualquier actividad realizada desde tu cuenta es tu responsabilidad. Fielty puede suspender o cancelar cuentas que violen estos términos, sin previo aviso.
        </Section>

        <Section title="4. Planes y pagos">
          Fielty ofrece un plan gratuito con hasta 50 clientes, y planes de pago con funcionalidades adicionales. Los planes de pago se facturan mensualmente a través de Mercado Pago. Podés cancelar tu suscripción en cualquier momento directamente desde Mercado Pago; el servicio continuará activo hasta el fin del período ya abonado. No se realizan reembolsos por períodos parciales.
        </Section>

        <Section title="5. Uso aceptable">
          Te comprometés a usar Fielty únicamente para fines lícitos y en conformidad con estos términos. Queda expresamente prohibido: usar el servicio para actividades fraudulentas o ilegales, intentar acceder sin autorización a cuentas de otros usuarios, realizar ingeniería inversa sobre la plataforma, o utilizar el servicio de forma que pueda dañar, sobrecargar o deteriorar la infraestructura de Fielty.
        </Section>

        <Section title="6. Datos de clientes finales">
          Como negocio que usa Fielty, sos responsable de obtener el consentimiento informado de tus clientes para recopilar y tratar sus datos personales dentro de la plataforma, en cumplimiento de la Ley 25.326 de Protección de Datos Personales de la República Argentina. Fielty actúa como encargado del tratamiento de esos datos en tu nombre y conforme a tus instrucciones.
        </Section>

        <Section title="7. Propiedad intelectual">
          Todo el contenido, diseño, código fuente y marca de Fielty son propiedad exclusiva de sus creadores. No podés reproducir, distribuir ni crear obras derivadas sin autorización expresa y por escrito. El contenido que cargás en la plataforma (nombre de negocio, logo, recompensas) es de tu propiedad; al subirlo nos otorgás una licencia limitada, no exclusiva y revocable para mostrarlo dentro del servicio.
        </Section>

        <Section title="8. Limitación de responsabilidad">
          Fielty se provee en el estado en que se encuentra, sin garantías de disponibilidad ininterrumpida ni libre de errores. No somos responsables por pérdida de datos, lucro cesante, daños indirectos o consecuentes derivados del uso o imposibilidad de uso del servicio. En ningún caso nuestra responsabilidad total hacia vos superará el monto efectivamente pagado por el servicio en los últimos tres (3) meses.
        </Section>

        <Section title="9. Cancelación y eliminación de cuenta">
          Podés solicitar la cancelación de tu cuenta en cualquier momento escribiéndonos a hola@fielty.app. Ante la cancelación, los datos de clientes asociados a tu negocio serán eliminados de nuestros sistemas en un plazo de 30 días hábiles, salvo obligación legal de retención.
        </Section>

        <Section title="10. Ley aplicable y jurisdicción">
          Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Cualquier controversia que surja en relación con el servicio será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando las partes a cualquier otro fuero que pudiera corresponder.
        </Section>

        <Section title="11. Contacto">
          Para consultas, reclamos o cualquier comunicación relacionada con estos términos, escribinos a{' '}
          <a href="mailto:hola@fielty.app" style={{ color: '#e0001b', textDecoration: 'none', fontWeight: 600 }}>hola@fielty.app</a>.
        </Section>

      </div>

      <div style={{ borderTop: '1px solid #1a1a1a', textAlign: 'center', padding: '24px 20px 40px', fontSize: 13, color: '#444' }}>
        <a href="/terminos" style={{ color: '#666', textDecoration: 'none', marginRight: 20 }}>Términos</a>
        <a href="/privacidad" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Privacidad</a>
        <a href="/" style={{ color: '#444', textDecoration: 'none' }}>fielty.app</a>
      </div>

    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 12 }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.9 }}>{children}</p>
    </div>
  )
}
