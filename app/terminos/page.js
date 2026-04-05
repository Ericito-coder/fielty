export default function Terminos() {
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <div style={s.logo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>fielty</span>
        </div>

        <h1 style={s.titulo}>Términos y Condiciones</h1>
        <p style={s.fecha}>Última actualización: abril 2026</p>

        <p style={s.intro}>
          Al registrarte y utilizar Fielty, aceptás los siguientes términos y condiciones. Si no estás de acuerdo con alguno de ellos, te pedimos que no uses el servicio.
        </p>

        <Seccion titulo="1. Descripción del servicio">
          Fielty es una plataforma de fidelización de clientes que permite a negocios crear y gestionar programas de puntos, recompensas y beneficios para sus clientes. El servicio se presta a través del sitio web fielty.app y sus subdominios.
        </Seccion>

        <Seccion titulo="2. Registro y cuenta">
          Para usar Fielty, el dueño del negocio debe registrarse proporcionando información verídica y actualizada. Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Fielty no se responsabiliza por pérdidas derivadas del uso no autorizado de tu cuenta.
        </Seccion>

        <Seccion titulo="3. Planes y pagos">
          Fielty ofrece un plan gratuito con funcionalidades limitadas y planes pagos (Pro y Business) con funcionalidades adicionales. Los planes pagos se facturan mensualmente mediante Mercado Pago. Los precios están expresados en pesos argentinos (ARS) e incluyen IVA cuando corresponde. Podés cancelar tu suscripción en cualquier momento desde tu cuenta de Mercado Pago. No se realizan reembolsos por períodos parciales ya abonados.
        </Seccion>

        <Seccion titulo="4. Uso aceptable">
          Al usar Fielty te comprometés a:
          <ul style={s.lista}>
            <li>No usar el servicio para fines ilegales o no autorizados.</li>
            <li>No registrar clientes sin su consentimiento expreso.</li>
            <li>No intentar acceder a cuentas de otros usuarios.</li>
            <li>No enviar contenido spam, ofensivo o fraudulento.</li>
            <li>Respetar la privacidad de los datos de tus clientes.</li>
          </ul>
        </Seccion>

        <Seccion titulo="5. Datos de clientes">
          Como dueño del negocio, sos el responsable del tratamiento de los datos personales de tus clientes (nombre, DNI, teléfono, email, fecha de nacimiento). Fielty actúa como encargado del tratamiento en los términos de la Ley 25.326 de Protección de Datos Personales de Argentina. Te comprometés a obtener el consentimiento de tus clientes antes de registrar sus datos en la plataforma.
        </Seccion>

        <Seccion titulo="6. Propiedad intelectual">
          Fielty y todos sus contenidos, logotipos, diseños y software son propiedad de sus creadores. No podés copiar, modificar, distribuir ni usar ningún elemento de Fielty sin autorización expresa.
        </Seccion>

        <Seccion titulo="7. Disponibilidad del servicio">
          Fielty se esfuerza por mantener el servicio disponible de forma continua, pero no garantiza disponibilidad del 100%. Pueden existir interrupciones por mantenimiento, actualizaciones o causas de fuerza mayor. No nos responsabilizamos por pérdidas ocasionadas por la no disponibilidad temporal del servicio.
        </Seccion>

        <Seccion titulo="8. Limitación de responsabilidad">
          Fielty no se responsabiliza por daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso del servicio. La responsabilidad máxima de Fielty en ningún caso superará el monto abonado por el usuario en los últimos 3 meses.
        </Seccion>

        <Seccion titulo="9. Cancelación y suspensión">
          Fielty se reserva el derecho de suspender o cancelar cuentas que violen estos términos, sin previo aviso. En caso de cancelación del servicio por parte de Fielty sin causa imputable al usuario, se reembolsará el proporcional del período no utilizado.
        </Seccion>

        <Seccion titulo="10. Modificaciones">
          Fielty puede modificar estos términos en cualquier momento. Los cambios se notificarán con al menos 15 días de anticipación por email. El uso continuado del servicio después de esa fecha implica la aceptación de los nuevos términos.
        </Seccion>

        <Seccion titulo="11. Ley aplicable">
          Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
        </Seccion>

        <Seccion titulo="12. Contacto">
          Para consultas sobre estos términos, escribinos a <a href="mailto:eric.bohl10@gmail.com" style={{color:'#e0001b'}}>eric.bohl10@gmail.com</a>.
        </Seccion>

        <div style={{marginTop:40, paddingTop:24, borderTop:'1px solid #e8eaf0', textAlign:'center'}}>
          <a href="/" style={{color:'#e0001b', fontWeight:700, textDecoration:'none', fontSize:14}}>← Volver al inicio</a>
        </div>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0e0e0e', marginBottom: 10 }}>{titulo}</h2>
      <div style={{ fontSize: 15, color: '#444', lineHeight: 1.75 }}>{children}</div>
    </div>
  )
}

const s = {
  wrap: { minHeight: '100vh', background: '#f9f9fb', padding: '48px 20px' },
  inner: { maxWidth: 720, margin: '0 auto', background: 'white', borderRadius: 24, padding: '48px 48px', boxShadow: '0 2px 24px rgba(0,0,0,0.07)' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoDot: { width: 10, height: 10, borderRadius: '50%', background: '#e0001b', boxShadow: '0 0 10px #e0001b' },
  logoText: { fontSize: 22, fontWeight: 800, color: '#0e0e0e', letterSpacing: -0.5 },
  titulo: { fontSize: 32, fontWeight: 900, color: '#0e0e0e', marginBottom: 8 },
  fecha: { fontSize: 13, color: '#aaa', marginBottom: 32 },
  intro: { fontSize: 15, color: '#555', lineHeight: 1.75, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid #e8eaf0' },
  lista: { paddingLeft: 20, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 },
}
