export default function Privacidad() {
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <div style={s.logo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>fielty</span>
        </div>

        <h1 style={s.titulo}>Política de Privacidad</h1>
        <p style={s.fecha}>Última actualización: abril 2026</p>

        <p style={s.intro}>
          En Fielty nos tomamos muy en serio la privacidad de tus datos. Esta política describe qué información recopilamos, cómo la usamos y cómo la protegemos, en cumplimiento de la Ley 25.326 de Protección de Datos Personales de la República Argentina.
        </p>

        <Seccion titulo="1. Responsable del tratamiento">
          Fielty (en adelante, "nosotros" o "Fielty") es responsable del tratamiento de los datos personales de los dueños de negocios registrados en la plataforma. Para consultas, podés contactarnos en <a href="mailto:eric.bohl10@gmail.com" style={{color:'#e0001b'}}>eric.bohl10@gmail.com</a>.
        </Seccion>

        <Seccion titulo="2. Datos que recopilamos">
          <strong style={{color:'#0e0e0e'}}>De los dueños de negocios:</strong>
          <ul style={s.lista}>
            <li>Nombre completo</li>
            <li>Dirección de email</li>
            <li>Número de teléfono</li>
            <li>Nombre y datos del negocio</li>
            <li>Datos de pago procesados por Mercado Pago (no almacenamos datos de tarjetas)</li>
          </ul>
          <br />
          <strong style={{color:'#0e0e0e'}}>De los clientes de los negocios (gestionados por el dueño del negocio):</strong>
          <ul style={s.lista}>
            <li>Nombre completo</li>
            <li>DNI</li>
            <li>Número de teléfono</li>
            <li>Email (opcional)</li>
            <li>Fecha de nacimiento (opcional)</li>
            <li>Historial de puntos y canjes</li>
          </ul>
        </Seccion>

        <Seccion titulo="3. Cómo usamos tus datos">
          Utilizamos los datos recopilados para:
          <ul style={s.lista}>
            <li>Proveer y mejorar el servicio de Fielty.</li>
            <li>Procesar pagos de suscripciones mediante Mercado Pago.</li>
            <li>Enviarte comunicaciones relacionadas con tu cuenta (cambios en el servicio, novedades importantes).</li>
            <li>Cumplir con obligaciones legales.</li>
          </ul>
          No vendemos ni compartimos tus datos personales con terceros para fines comerciales.
        </Seccion>

        <Seccion titulo="4. Datos de clientes de negocios">
          Los datos de los clientes finales (personas que participan en el programa de puntos) son responsabilidad del negocio que los registra. Fielty actúa como encargado del tratamiento. El negocio es responsable de:
          <ul style={s.lista}>
            <li>Obtener el consentimiento del cliente antes de registrar sus datos.</li>
            <li>Informar al cliente sobre el uso de sus datos.</li>
            <li>Responder solicitudes de acceso, rectificación o eliminación de datos de sus clientes.</li>
          </ul>
        </Seccion>

        <Seccion titulo="5. Almacenamiento y seguridad">
          Los datos se almacenan en servidores seguros provistos por Supabase (infraestructura en la nube con certificación SOC 2). Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado, pérdida o alteración. Las contraseñas se almacenan encriptadas y nunca en texto plano.
        </Seccion>

        <Seccion titulo="6. Pagos">
          Los pagos son procesados exclusivamente por Mercado Pago. Fielty no almacena datos de tarjetas de crédito ni débito. Para más información sobre el tratamiento de datos de pago, consultá la política de privacidad de Mercado Pago.
        </Seccion>

        <Seccion titulo="7. Cookies">
          Fielty utiliza cookies de sesión necesarias para el funcionamiento del servicio (autenticación). No utilizamos cookies de seguimiento ni publicidad de terceros.
        </Seccion>

        <Seccion titulo="8. Tus derechos">
          De acuerdo con la Ley 25.326, tenés derecho a:
          <ul style={s.lista}>
            <li><strong>Acceso:</strong> solicitar qué datos tenemos sobre vos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Eliminación:</strong> solicitar la eliminación de tus datos.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos.</li>
          </ul>
          Para ejercer estos derechos, escribinos a <a href="mailto:eric.bohl10@gmail.com" style={{color:'#e0001b'}}>eric.bohl10@gmail.com</a>. Responderemos en un plazo máximo de 10 días hábiles.
        </Seccion>

        <Seccion titulo="9. Retención de datos">
          Conservamos tus datos mientras tu cuenta esté activa. Si eliminás tu cuenta, tus datos serán eliminados en un plazo de 30 días, excepto aquellos que debamos conservar por obligaciones legales o fiscales.
        </Seccion>

        <Seccion titulo="10. Menores de edad">
          Fielty no está dirigido a menores de 18 años. No recopilamos datos de menores de forma intencional. Si creés que tenemos datos de un menor, contactanos para eliminarlos.
        </Seccion>

        <Seccion titulo="11. Cambios en esta política">
          Podemos actualizar esta política en cualquier momento. Te notificaremos por email ante cambios importantes. El uso continuado del servicio implica la aceptación de la política actualizada.
        </Seccion>

        <Seccion titulo="12. Contacto">
          Para cualquier consulta sobre privacidad o ejercicio de derechos, contactanos en <a href="mailto:eric.bohl10@gmail.com" style={{color:'#e0001b'}}>eric.bohl10@gmail.com</a>.
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
