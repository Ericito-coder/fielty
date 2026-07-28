export const metadata = {
  title: 'Guía completa de Fielty | Cómo fidelizar clientes sin app',
  description: 'Guía de producto de Fielty: cómo crear tu programa de puntos, registrar clientes por QR, configurar recompensas, niveles de lealtad, referidos, campañas de reactivación por email y Google Wallet para negocios físicos en Argentina.',
  alternates: { canonical: '/guia' },
}

export default function Guia() {
  return (
    <div style={{ fontFamily: 'inherit', maxWidth: 800, margin: '0 auto', padding: '60px 40px', color: '#0e0e0e', lineHeight: 1.7 }}>

      {/* Portada */}
      <div style={{ textAlign: 'center', marginBottom: 80, paddingBottom: 60, borderBottom: '3px solid #e0001b' }}>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, marginBottom: 8 }}>● fielty</div>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: '#555', marginBottom: 24 }}>Guía completa de Fielty</h1>
        <div style={{ display: 'inline-block', background: '#f5f5f5', borderRadius: 12, padding: '10px 24px', fontSize: 14, color: '#888' }}>
          Actualizada · Julio 2026 · fielty.app
        </div>
      </div>

      {/* Intro */}
      <Section title="¿Qué es Fielty?">
        <P>Fielty es un sistema de fidelización de clientes para negocios físicos argentinos. Permite que tus clientes acumulen puntos en cada compra y los canjeen por premios que vos definís.</P>
        <Highlight>Sin app. Sin descarga. Todo desde el navegador del celular.</Highlight>
        <P>Ideal para: peluquerías, cafeterías, veterinarias, restaurantes, tiendas de ropa, farmacias y cualquier negocio que quiera hacer volver a sus clientes.</P>
      </Section>

      {/* Planes */}
      <Section title="Planes disponibles">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#0e0e0e', color: 'white' }}>
              <th style={th}></th>
              <th style={th}>Gratis</th>
              <th style={th}>Pro</th>
              <th style={th}>Business</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Clientes', 'Hasta 50', 'Ilimitados', 'Ilimitados'],
              ['Sucursales', '1', 'Hasta 3', 'Ilimitadas'],
              ['Campañas de email', '✗', '✓', '✓'],
              ['Logo personalizado', '✗', '✓', '✓'],
              ['Exportación CSV', '✗', '✓', '✓'],
              ['Google Wallet', '✗', '✗', '✓'],
              ['Precio', '$0', '$10.000/mes*', '$35.000/mes'],
            ].map(([label, ...vals], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ ...td, fontWeight: 700 }}>{label}</td>
                {vals.map((v, j) => <td key={j} style={{ ...td, textAlign: 'center', color: v === '✓' ? '#00b96b' : v === '✗' ? '#ccc' : '#0e0e0e' }}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <P style={{ fontSize: 12, color: '#888' }}>* Precio especial para los primeros 100 negocios. Precio regular: $20.000/mes.</P>
      </Section>

      <PageBreak />

      {/* PARTE 1 */}
      <PartTitle number="1" title="Flujo del dueño de negocio" />

      <Section title="Paso 1 — Registro del negocio" level={3}>
        <SubTitle>1.1 Elegir plan</SubTitle>
        <P>El dueño entra a <strong>fielty.app</strong> y elige su plan. Si elige Gratis va directo al onboarding. Si elige Pro o Business, al final del onboarding es redirigido a Mercado Pago.</P>

        <SubTitle>1.2 Crear cuenta — <Code>fielty.app/onboarding/registro</Code></SubTitle>
        <List items={['Email', 'Contraseña (mínimo 8 caracteres)', 'Nombre del dueño o responsable', 'Teléfono de contacto']} />

        <SubTitle>1.3 Configurar el negocio — <Code>fielty.app/onboarding/negocio</Code></SubTitle>
        <List items={[
          'Nombre del negocio (ej: "Pet Point")',
          'Color de marca — aparece en la tarjeta del cliente',
          'Regla de puntos (ej: 1 punto cada $100)',
          'Puntos por cumpleaños (default: 50)',
          'Puntos por referir amigos, para quien invita y para quien se suma (default: 100 y 50)',
        ]} />
        <P>Fielty genera automáticamente un <strong>slug único</strong> para el negocio (ej: <code>pet-point</code>) que se usa en todas las URLs.</P>

        <SubTitle>1.4 Crear tus recompensas — <Code>fielty.app/onboarding/recompensa</Code></SubTitle>
        <P>Hace falta cargar al menos una recompensa (nombre y puntos necesarios, ej: "Café gratis" por 200 puntos) para poder continuar. Se pueden agregar más adelante desde el panel.</P>

        <SubTitle>1.5 Pantalla "¡Todo listo!" — <Code>fielty.app/onboarding/listo</Code></SubTitle>
        <List items={[
          'Link de registro para clientes: fielty.app/registro/[slug]',
          'QR para imprimir y poner en el mostrador',
          'Próximos pasos: imprimir el QR, pedirles a los empleados que usen la caja para acreditar puntos, y mirar las métricas desde el panel',
        ]} />
        <Highlight>Email de bienvenida automático: se envía al email del dueño con el link de registro, los primeros pasos y el acceso al panel.</Highlight>
      </Section>

      <Section title="Paso 2 — El panel del dueño" level={3}>
        <P>URL: <Code>fielty.app/dashboard</Code> — disponible en mobile y desktop.</P>

        <SubTitle>📊 Inicio</SubTitle>
        <P><strong>Métricas:</strong> clientes totales, activos en los últimos 30 días, puntos en circulación, canjes realizados, referidos y tasa de retorno.</P>
        <P><strong>Links del negocio:</strong> link de registro de clientes y link de caja con botones para copiar y ver el QR.</P>
        <P><strong>Últimas transacciones:</strong> las últimas 10 en tiempo real con ícono, descripción, fecha y puntos.</P>
        <P><strong>Top clientes:</strong> ranking de los 5 clientes con más puntos históricos, con nombre y nivel.</P>
        <P><strong>Métricas por sucursal:</strong> clientes, puntos y canjes por sucursal con barra comparativa.</P>
        <P><strong>Guía de primeros pasos:</strong> checklist con 5 pasos que se tachan automáticamente. Al completar todo desaparece. Se puede cerrar manualmente (pide confirmación).</P>

        <SubTitle>👥 Clientes</SubTitle>
        <P>Lista completa con nombre, DNI, puntos, nivel (🥉 Bronce / 🥈 Plata / 🥇 Oro), última visita y fecha de registro. Filtros: todos, activos, inactivos, referidos. Buscador por nombre o DNI.</P>
        <P><strong>Exportación CSV</strong> (Pro y Business): descarga todos los clientes filtrados, compatible con Excel.</P>

        <SubTitle>🎁 Recompensas</SubTitle>
        <P>El dueño crea recompensas con nombre, descripción y puntos necesarios. Puede activarlas, desactivarlas o eliminarlas en cualquier momento.</P>

        <SubTitle>📣 Campañas (Pro y Business)</SubTitle>
        <P>Reactivación de clientes por email. El dueño elige un segmento (inactivos hace 30 o 60 días, o todos), escribe el asunto y el mensaje con variables como <Code>{'{nombre}'}</Code>, <Code>{'{puntos}'}</Code> y <Code>{'{negocio}'}</Code>, y confirma el envío.</P>
        <List items={[
          'Tiene límites de envío pensados para evitar spam y cuidar la reputación del email del negocio',
          'Cada email incluye un link para darse de baja',
          'El dashboard muestra cuántos clientes volvieron después de una campaña',
        ]} />

        <SubTitle>🏪 Sucursales</SubTitle>
        <P>Cada sucursal tiene su URL de caja propia y PIN de acceso para empleados. Límites: 1 (Gratis), 3 (Pro), ilimitadas (Business).</P>
        <P>El PIN es alfanumérico, de longitud libre (mínimo 4 caracteres) y no puede ser uno de los PINs débiles más habituales. La caja queda bloqueada hasta que se configura un PIN — no hay PIN por defecto. Si el PIN no está configurado o es débil, el dashboard muestra un aviso.</P>

        <SubTitle>⚙️ Configuración</SubTitle>
        <List items={[
          'Nombre del negocio',
          'Color de marca',
          'Logo personalizado (Pro y Business — PNG, JPG, WebP, máx 2MB)',
          'Regla de puntos: pesos por punto y puntos por tramo. El cálculo es proporcional al monto exacto de la compra, redondeado al entero más cercano',
          'Puntos de bienvenida al registrarse de forma orgánica (default: 10)',
          'Puntos por referido para el que invita (default: 100)',
          'Puntos por referido para el nuevo cliente (default: 50)',
        ]} />
      </Section>

      <Section title="Paso 3 — Pagos y suscripción" level={3}>
        <P>URL: <Code>fielty.app/dashboard/upgrade</Code></P>
        <List items={[
          'El dueño elige el plan y es redirigido a Mercado Pago',
          'Al confirmar el pago, el plan se actualiza automáticamente',
          'El dueño ve un banner de confirmación en el panel',
          'Para cancelar: desde Mercado Pago. Al cancelar vuelve a Gratis automáticamente',
        ]} />
      </Section>

      <Section title="Notificaciones automáticas al dueño" level={3}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#0e0e0e', color: 'white' }}>
              <th style={th}>Evento</th>
              <th style={th}>Asunto del email</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Termina el onboarding', '¡Bienvenido a Fielty, [negocio]! 🎉'],
              ['Llega a 45 clientes (plan Gratis)', '📊 Te quedan 5 clientes para el límite'],
              ['Llega a 50 clientes (plan Gratis)', '⚠️ Llegaste al límite de clientes en Fielty'],
            ].map(([evento, asunto], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={td}>{evento}</td>
                <td style={td}>{asunto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <PageBreak />

      {/* PARTE 2 */}
      <PartTitle number="2" title="Flujo del empleado — La caja" />

      <Section title="La caja" level={3}>
        <P>URL: <Code>fielty.app/c/[slug]</Code> (sin sucursal) o <Code>fielty.app/c/[slug]/[sucursal]</Code> (con sucursal)</P>
        <P>Pantalla que usan los empleados en el punto de venta. Protegida por PIN.</P>

        <SubTitle>Buscar o escanear al cliente</SubTitle>
        <List items={[
          'Buscarlo por nombre o DNI, o',
          'Escanear su tarjeta con la cámara del celular (botón "Escanear tarjeta") — sirve tanto el código de la tarjeta web como el del pase de Google Wallet',
        ]} />

        <SubTitle>Registrar un cliente nuevo desde la caja</SubTitle>
        <P>El empleado puede registrar a un cliente en el momento sin que use su propio celular: solo pide nombre y DNI (email y teléfono son opcionales) e ingresa el PIN de la caja. Fielty crea la cuenta con una contraseña provisoria y, la primera vez que el cliente entra a ver su tarjeta, tiene que elegir una contraseña propia.</P>

        <SubTitle>Acreditar puntos</SubTitle>
        <List items={[
          'Seleccionar al cliente — ve nombre, DNI, puntos actuales y nivel',
          'Ingresar el monto de la compra (botones rápidos o manual)',
          'Ver preview de cuántos puntos va a recibir',
          'Confirmar — puntos acreditados al instante',
          'Botón "Avisarle por WhatsApp" para mandarle un mensaje prearmado desde el WhatsApp del empleado',
        ]} />

        <SubTitle>Validar canje de recompensa</SubTitle>
        <List items={[
          'El cliente muestra su código generado desde la tarjeta (válido 24hs)',
          'El empleado ingresa el código en "Validar canje"',
          'Ve qué recompensa es y a nombre de quién',
          'Confirma que entregó el premio — el canje queda marcado como usado',
        ]} />

        <SubTitle>Ayuda para clientes</SubTitle>
        <P>Botón "❓ ¿El cliente no sabe cómo ver su tarjeta?" — al tocarlo muestra el link <Code>fielty.app/mi-tarjeta</Code> con opción de copiarlo.</P>
      </Section>

      <PageBreak />

      {/* PARTE 3 */}
      <PartTitle number="3" title="Flujo del cliente" />

      <Section title="Paso 1 — Registro del cliente" level={3}>
        <P>URL: <Code>fielty.app/registro/[slug-del-negocio]</Code></P>
        <P>El cliente llega escaneando el QR del negocio o con el link que le compartieron.</P>

        <SubTitle>Campos del formulario</SubTitle>
        <List items={[
          'Nombre — obligatorio',
          'DNI — obligatorio',
          'Email — obligatorio (para recuperar contraseña)',
          'Contraseña — obligatorio (mínimo 8 caracteres)',
          'WhatsApp — opcional',
          'Fecha de nacimiento — opcional (recibe puntos extra en su cumpleaños)',
        ]} />
        <P style={{ fontSize: 13, color: '#888' }}>Si en cambio lo registra un empleado desde la caja, los campos pedidos son distintos — ver "Registrar un cliente nuevo desde la caja" en la Parte 2.</P>

        <SubTitle>Al registrarse recibe automáticamente</SubTitle>
        <List items={[
          'Puntos de bienvenida si se registró de forma orgánica (configurable por el dueño, default: 10)',
          'Puntos de referido si se registró con el link de otro cliente — en ese caso NO recibe puntos de bienvenida',
        ]} />

        <Highlight>Si el negocio tiene logo (plan Pro o Business), aparece el logo en la página de registro en lugar de las iniciales.</Highlight>
      </Section>

      <Section title="Paso 2 — La tarjeta digital" level={3}>
        <P>URL: <Code>fielty.app/tarjeta/[id-del-cliente]</Code></P>

        <SubTitle>Lo que ve el cliente</SubTitle>
        <List items={[
          'Logo o iniciales del negocio con su color de marca',
          'Sus puntos actuales (número grande al centro)',
          'Nivel: 🥉 Bronce / 🥈 Plata / 🥇 Oro',
          'Barra de progreso hacia la próxima recompensa',
          'Cuántos puntos le faltan para el próximo nivel',
          'Canje activo con código y cuenta regresiva de 24hs (si tiene uno)',
          'Lista de recompensas disponibles con botón para canjear',
          'Botón para compartir su link de referido',
          'Botón "Mostrar mi código" para que el empleado lo escanee en la caja en vez de buscarlo por nombre o DNI',
          'Historial de las últimas 20 transacciones',
        ]} />

        <SubTitle>Agregar a Google Wallet (negocios Business)</SubTitle>
        <P>Si el negocio está en el plan Business, la tarjeta tiene un botón para agregarla a Google Wallet como un pase más. El pase muestra los puntos, el nivel y cuánto le falta para la próxima recompensa, y se actualiza solo cada vez que acredita puntos o canjea un premio.</P>

        <SubTitle>Instalar la tarjeta en la pantalla de inicio</SubTitle>
        <P>Aparece un banner para agregar la tarjeta a la pantalla de inicio del celular (Android o iOS), con instrucciones según el navegador. Una vez agregada, se abre como si fuera una app, sin pasar por ninguna tienda de aplicaciones.</P>
      </Section>

      <Section title="Paso 3 — Cómo vuelve el cliente a su tarjeta" level={3}>
        <P>El cliente entra a <Code>fielty.app/mi-tarjeta</Code>. El navegador recuerda su tarjeta, así que la mayoría de las veces no tiene que volver a loguearse:</P>
        <List items={[
          'Si ya tiene una tarjeta guardada en ese celular → entra directo, sin pedir DNI ni contraseña',
          'Si tiene tarjetas guardadas de varios negocios → elige cuál ver',
          'Si es la primera vez en ese dispositivo → ingresa con su DNI y contraseña',
          'Botón "No soy yo" para borrar la tarjeta guardada y volver a loguearse con otro usuario',
        ]} />

        <SubTitle>Si olvidó la contraseña</SubTitle>
        <List items={[
          'Hace click en "¿Olvidaste tu contraseña?"',
          'Ingresa su email',
          'Recibe un link por email para resetear (válido 1 hora)',
          'Crea una nueva contraseña e ingresa normalmente',
        ]} />
      </Section>

      <Section title="Sistema de niveles" level={3}>
        <P>Los niveles se calculan en base a <strong>puntos históricos</strong> (todos los puntos que ganó, incluso los ya canjeados):</P>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#0e0e0e', color: 'white' }}>
              <th style={th}>Nivel</th>
              <th style={th}>Puntos históricos</th>
            </tr>
          </thead>
          <tbody>
            {[['🥉 Bronce', '0 — 999'], ['🥈 Plata', '1.000 — 4.999'], ['🥇 Oro', '5.000+']].map(([n, p], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ ...td, fontWeight: 700 }}>{n}</td>
                <td style={{ ...td, textAlign: 'center' }}>{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Sistema de referidos" level={3}>
        <P>Cada cliente tiene un link único: <Code>fielty.app/registro/[slug]?ref=[id]</Code></P>
        <P>Cuando alguien se registra con ese link, ambos reciben puntos (configurable por el dueño). La transacción queda registrada en el historial de ambos con el ícono 🤝.</P>
      </Section>

      <Section title="Cumpleaños automático" level={3}>
        <P>Si el cliente cargó su fecha de nacimiento, el día de su cumpleaños recibe puntos extra automáticamente. La transacción aparece con el ícono 🎂.</P>
      </Section>

      <PageBreak />

      {/* PARTE 4 */}
      <PartTitle number="4" title="Todas las URLs del sistema" />

      <Section title="">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#0e0e0e', color: 'white' }}>
              <th style={th}>Página</th>
              <th style={th}>URL</th>
              <th style={th}>Para quién</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Landing / Precios', 'fielty.app', 'Dueños de negocio'],
              ['Registro negocio (paso 1 de 3)', 'fielty.app/onboarding/registro', 'Dueños de negocio'],
              ['Configurar negocio (paso 2 de 3)', 'fielty.app/onboarding/negocio', 'Dueños de negocio'],
              ['Crear recompensas (paso 3 de 3)', 'fielty.app/onboarding/recompensa', 'Dueños de negocio'],
              ['Pantalla "¡Todo listo!"', 'fielty.app/onboarding/listo', 'Dueños de negocio'],
              ['Ingresar', 'fielty.app/login', 'Dueños de negocio'],
              ['Panel del dueño', 'fielty.app/dashboard', 'Dueños de negocio'],
              ['Upgrade de plan', 'fielty.app/dashboard/upgrade', 'Dueños de negocio'],
              ['Caja (sin sucursal)', 'fielty.app/c/[slug]', 'Empleados'],
              ['Caja (con sucursal)', 'fielty.app/c/[slug]/[sucursal]', 'Empleados'],
              ['Registro cliente', 'fielty.app/registro/[slug]', 'Clientes'],
              ['Tarjeta del cliente', 'fielty.app/tarjeta/[id]', 'Clientes'],
              ['Ver mi tarjeta', 'fielty.app/mi-tarjeta', 'Clientes'],
              ['Recuperar contraseña', 'fielty.app/mi-tarjeta/reset', 'Clientes'],
              ['Elegir contraseña (primer login)', 'fielty.app/mi-tarjeta/nueva-password', 'Clientes'],
              ['Restablecer contraseña', 'fielty.app/reset-password', 'Dueños de negocio'],
              ['QR del negocio', 'fielty.app/qr/[slug]', 'Dueños de negocio'],
              ['QR de mi tarjeta', 'fielty.app/qr/mi-tarjeta', 'Clientes'],
              ['Preguntas frecuentes', 'fielty.app/faq', 'Todos'],
              ['Guía completa', 'fielty.app/guia', 'Todos'],
              ['Términos y condiciones', 'fielty.app/terminos', 'Todos'],
              ['Política de privacidad', 'fielty.app/privacidad', 'Todos'],
            ].map(([nombre, url, para], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={td}>{nombre}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{url}</td>
                <td style={td}>{para}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Footer */}
      <div style={{ marginTop: 80, paddingTop: 32, borderTop: '2px solid #e0001b', textAlign: 'center', color: '#888', fontSize: 13 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0e0e0e', marginBottom: 8 }}>● fielty</div>
        <div>fielty.app · hola@fielty.app · Julio 2026</div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          @page { margin: 20mm 15mm; size: A4; }
        }
      `}</style>
    </div>
  )
}

// Componentes auxiliares
const P = ({ children, style }) => <p style={{ fontSize: 15, marginBottom: 12, ...style }}>{children}</p>
const SubTitle = ({ children }) => <h4 style={{ fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 8, color: '#0e0e0e' }}>{children}</h4>
const Highlight = ({ children }) => (
  <div style={{ background: '#fff8e6', borderLeft: '4px solid #f0a500', padding: '12px 16px', borderRadius: '0 10px 10px 0', marginBottom: 16, fontSize: 14, color: '#555' }}>
    {children}
  </div>
)
const Code = ({ children }) => <code style={{ background: '#f0f2f7', padding: '2px 6px', borderRadius: 5, fontSize: 13, fontFamily: 'monospace' }}>{children}</code>
const List = ({ items }) => (
  <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
    {items.map((item, i) => <li key={i} style={{ fontSize: 14, marginBottom: 6, color: '#333' }}>{item}</li>)}
  </ul>
)
const PageBreak = () => <div style={{ pageBreakAfter: 'always', marginTop: 60, marginBottom: 60, borderBottom: '1px solid #e8eaf0' }} />
const PartTitle = ({ number, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0001b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, flexShrink: 0 }}>{number}</div>
    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0e0e0e', margin: 0 }}>{title}</h2>
  </div>
)
const Section = ({ title, children, level = 2 }) => {
  const Heading = level === 3 ? 'h3' : 'h2'
  return (
    <div style={{ marginBottom: 40 }}>
      {title && <Heading style={{ fontSize: 20, fontWeight: 800, color: '#0e0e0e', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid #f0f2f7' }}>{title}</Heading>}
      {children}
    </div>
  )
}
const th = { padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 700 }
const td = { padding: '10px 14px', fontSize: 13, borderBottom: '1px solid #f0f2f7' }
