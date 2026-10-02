import { theme } from '@/lib/theme'
import { s } from '../para/estilos'

export const metadata = {
  title: 'Guía completa de Fielty | Cómo fidelizar clientes sin app',
  description: 'Guía completa de Fielty: cómo armar tu programa de puntos, registrar clientes por QR y configurar premios, niveles y referidos. Negocios en Argentina.',
  alternates: { canonical: '/guia' },
  openGraph: {
    title: 'Guía completa de Fielty',
    description: 'Cómo se arma el programa de puntos, cómo se usa la caja y qué ve el cliente en su tarjeta, paso a paso.',
    url: '/guia',
    siteName: 'Fielty',
    locale: 'es_AR',
    type: 'article',
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Fielty', item: 'https://www.fielty.app' },
    { '@type': 'ListItem', position: 2, name: 'Guía completa', item: 'https://www.fielty.app/guia' },
  ],
}

// Las cuatro partes de la guía. El índice de arriba y los títulos de cada
// parte salen de acá, para que no se desalineen.
const PARTES = [
  { id: 'dueno', numero: '1', titulo: 'Flujo del dueño de negocio' },
  { id: 'caja', numero: '2', titulo: 'Flujo del empleado — La caja' },
  { id: 'cliente', numero: '3', titulo: 'Flujo del cliente' },
  { id: 'urls', numero: '4', titulo: 'Todas las URLs del sistema' },
]

export default function Guia() {
  return (
    <div style={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* NAV */}
      <nav style={s.nav}>
        <a href="/" style={s.navLogo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>fielty</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/login" style={s.navLink}>Ingresar</a>
          <a href="/onboarding/registro" style={s.navCta}>Empezá gratis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.heroWrap}>
        <div style={s.hero}>
          <div style={s.badge}>Guía</div>
          <h1 style={s.h1}>
            Guía completa<br />
            <span style={s.gradient}>de Fielty.</span>
          </h1>
          <p style={{ ...s.heroSub, marginBottom: 0 }}>
            Cómo se arma el programa de puntos, cómo se usa la caja y qué ve el cliente en su tarjeta. Todo el recorrido, paso a paso.
          </p>
        </div>
      </section>

      <article className="guia" style={g.wrap}>

        {/* Resumen */}
        <div style={g.resumen}>
          <div style={g.etiqueta}>Resumen</div>
          <P style={{ marginBottom: 0 }}>
            Fielty es un programa de fidelización de clientes con puntos por QR, sin app, para negocios físicos en Argentina (peluquerías, barberías, cafeterías, veterinarias, gimnasios y más). Hay un plan gratis para hasta 30 clientes y planes pagos desde $20.000/mes con clientes ilimitados. El cliente no instala nada: escanea el QR del negocio, ve su tarjeta digital desde el navegador y suma puntos en cada compra.
          </P>
        </div>

        {/* Índice */}
        <div style={g.etiqueta}>En esta guía</div>
        <div style={g.indice}>
          {PARTES.map((p) => (
            <a key={p.id} href={`#${p.id}`} style={g.indiceLink}>
              <span style={g.indiceNum}>{p.numero}</span>
              {p.titulo}
            </a>
          ))}
        </div>

        {/* Intro */}
        <Section title="¿Qué es Fielty?">
          <P>Fielty es un sistema de fidelización de clientes para negocios físicos argentinos. Permite que tus clientes acumulen puntos en cada compra y los canjeen por premios que vos definís.</P>
          <Highlight>Sin app. Sin descarga. Todo desde el navegador del celular.</Highlight>
          <P>Ideal para: peluquerías, barberías, cafeterías, veterinarias, pet shops, gimnasios, restaurantes, tiendas de ropa, farmacias y cualquier negocio que quiera hacer volver a sus clientes.</P>
          <P>
            Si querés ver cómo se aplica a un rubro puntual, hay guías específicas para{' '}
            <A href="/para/barberias">barberías</A>,{' '}
            <A href="/para/cafeterias">cafeterías</A>,{' '}
            <A href="/para/peluquerias">peluquerías</A>,{' '}
            <A href="/para/veterinarias">veterinarias</A>,{' '}
            <A href="/para/gimnasios">gimnasios</A>,{' '}
            <A href="/para/restaurantes">restaurantes</A>,{' '}
            <A href="/para/panaderias">panaderías</A> y{' '}
            <A href="/para/kioscos">kioscos</A>.
          </P>
        </Section>

        {/* Planes */}
        <Section title="Planes disponibles">
          <Tabla minWidth={460}>
            <thead>
              <tr>
                <th style={g.th}></th>
                <th style={{ ...g.th, textAlign: 'center' }}>Gratis</th>
                <th style={{ ...g.th, textAlign: 'center' }}>Pro</th>
                <th style={{ ...g.th, textAlign: 'center' }}>Business</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Clientes', 'Hasta 30', 'Ilimitados', 'Ilimitados'],
                ['Sucursales', '1', 'Hasta 3', 'Ilimitadas'],
                ['Campañas de email', '✗', '✓', '✓'],
                ['Logo personalizado', '✗', '✓', '✓'],
                ['Exportación CSV', '✗', '✓', '✓'],
                ['Google Wallet', '✓', '✓', '✓'],
                ['Precio', '$0', '$20.000/mes', '$35.000/mes'],
              ].map(([label, ...vals], i) => (
                <tr key={i}>
                  <td style={{ ...g.td, ...g.tdFuerte }}>{label}</td>
                  {vals.map((v, j) => (
                    <td key={j} style={{ ...g.td, textAlign: 'center', whiteSpace: 'nowrap', color: v === '✓' ? theme.green : v === '✗' ? theme.darkMuted : 'white' }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Tabla>
          <P style={g.nota}>Suscripción mensual por Mercado Pago, sin permanencia. Se cancela cuando quieras.</P>
        </Section>

        {/* PARTE 1 */}
        <PartTitle parte={PARTES[0]} />

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
          <P>Fielty genera automáticamente un <strong>slug único</strong> para el negocio (ej: <Code>pet-point</Code>) que se usa en todas las URLs.</P>

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

          <SubTitle>Inicio</SubTitle>
          <P><strong>Métricas:</strong> clientes totales, activos en los últimos 30 días, puntos en circulación, canjes realizados, referidos y tasa de retorno.</P>
          <P><strong>Links del negocio:</strong> link de registro de clientes y link de caja con botones para copiar y ver el QR.</P>
          <P><strong>Últimas transacciones:</strong> las últimas 10 en tiempo real con ícono, descripción, fecha y puntos.</P>
          <P><strong>Top clientes:</strong> ranking de los 5 clientes con más puntos históricos, con nombre y nivel.</P>
          <P><strong>Métricas por sucursal:</strong> clientes, puntos y canjes por sucursal con barra comparativa.</P>
          <P><strong>Guía de primeros pasos:</strong> checklist con 5 pasos que se tachan automáticamente. Al completar todo desaparece. Se puede cerrar manualmente (pide confirmación).</P>

          <SubTitle>Clientes</SubTitle>
          <P>Lista completa con nombre, DNI, puntos, nivel (🥉 Bronce / 🥈 Plata / 🥇 Oro), última visita y fecha de registro. Filtros: todos, activos, inactivos, referidos. Buscador por nombre o DNI.</P>
          <P><strong>Exportación CSV</strong> (Pro y Business): descarga todos los clientes filtrados, compatible con Excel.</P>

          <SubTitle>Recompensas</SubTitle>
          <P>El dueño crea recompensas con nombre, descripción y puntos necesarios. Puede activarlas, desactivarlas o eliminarlas en cualquier momento.</P>

          <SubTitle>Campañas (Pro y Business)</SubTitle>
          <P>Reactivación de clientes por email. El dueño elige un segmento (inactivos hace 30 o 60 días, o todos), escribe el asunto y el mensaje con variables como <Code>{'{nombre}'}</Code>, <Code>{'{puntos}'}</Code> y <Code>{'{negocio}'}</Code>, y confirma el envío.</P>
          <List items={[
            'Tiene límites de envío pensados para evitar spam y cuidar la reputación del email del negocio',
            'Cada email incluye un link para darse de baja',
            'El dashboard muestra cuántos clientes volvieron después de una campaña',
          ]} />

          <SubTitle>Sucursales</SubTitle>
          <P>Cada sucursal tiene su URL de caja propia y PIN de acceso para empleados. Límites: 1 (Gratis), 3 (Pro), ilimitadas (Business).</P>
          <P>El PIN es alfanumérico, de longitud libre (mínimo 4 caracteres) y no puede ser uno de los PINs débiles más habituales. La caja queda bloqueada hasta que se configura un PIN — no hay PIN por defecto. Si el PIN no está configurado o es débil, el dashboard muestra un aviso.</P>

          <SubTitle>Configuración</SubTitle>
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
          <Tabla minWidth={480}>
            <thead>
              <tr>
                <th style={g.th}>Evento</th>
                <th style={g.th}>Asunto del email</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Termina el onboarding', '¡Bienvenido a Fielty, [negocio]! 🎉'],
                ['Llega a 25 clientes (plan Gratis)', '📊 Te quedan 5 clientes para el límite'],
                ['Llega a 30 clientes (plan Gratis)', '⚠️ Llegaste al límite de clientes en Fielty'],
              ].map(([evento, asunto], i) => (
                <tr key={i}>
                  <td style={{ ...g.td, ...g.tdFuerte }}>{evento}</td>
                  <td style={g.td}>{asunto}</td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Section>

        {/* PARTE 2 */}
        <PartTitle parte={PARTES[1]} />

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

        {/* PARTE 3 */}
        <PartTitle parte={PARTES[2]} />

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
          <P style={g.nota}>Si en cambio lo registra un empleado desde la caja, los campos pedidos son distintos — ver "Registrar un cliente nuevo desde la caja" en la Parte 2.</P>

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

          <SubTitle>Agregar a Google Wallet</SubTitle>
          <P>En todos los planes, incluido el gratis, la tarjeta tiene un botón para agregarla a Google Wallet como un pase más. El pase muestra los puntos, el nivel y cuánto le falta para la próxima recompensa, y se actualiza solo cada vez que acredita puntos o canjea un premio.</P>
          <P>La diferencia entre planes es la marca: en el plan gratis el pase lleva el ícono de Fielty, y con Pro o Business lleva el logo del negocio. El nombre del negocio, sus colores y sus recompensas aparecen igual en todos los planes.</P>

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
          <Tabla>
            <thead>
              <tr>
                <th style={g.th}>Nivel</th>
                <th style={g.th}>Puntos históricos</th>
              </tr>
            </thead>
            <tbody>
              {[['🥉 Bronce', '0 — 999'], ['🥈 Plata', '1.000 — 4.999'], ['🥇 Oro', '5.000+']].map(([n, p], i) => (
                <tr key={i}>
                  <td style={{ ...g.td, ...g.tdFuerte }}>{n}</td>
                  <td style={g.td}>{p}</td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Section>

        <Section title="Sistema de referidos" level={3}>
          <P>Cada cliente tiene un link único: <Code>fielty.app/registro/[slug]?ref=[id]</Code></P>
          <P>Cuando alguien se registra con ese link, ambos reciben puntos (configurable por el dueño). La transacción queda registrada en el historial de ambos con el ícono 🤝.</P>
        </Section>

        <Section title="Cumpleaños automático" level={3}>
          <P>Si el cliente cargó su fecha de nacimiento, el día de su cumpleaños recibe puntos extra automáticamente. La transacción aparece con el ícono 🎂.</P>
        </Section>

        {/* PARTE 4 */}
        <PartTitle parte={PARTES[3]} />

        <Tabla minWidth={600}>
          <thead>
            <tr>
              <th style={g.th}>Página</th>
              <th style={g.th}>URL</th>
              <th style={g.th}>Para quién</th>
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
              <tr key={i}>
                <td style={{ ...g.td, ...g.tdFuerte }}>{nombre}</td>
                <td style={{ ...g.td, fontFamily: 'monospace', fontSize: 13 }}>{url}</td>
                <td style={{ ...g.td, whiteSpace: 'nowrap' }}>{para}</td>
              </tr>
            ))}
          </tbody>
        </Tabla>

        <P style={{ ...g.nota, marginTop: 32, marginBottom: 0 }}>
          ¿Te quedó alguna duda? Mirá las <A href="/faq">preguntas frecuentes</A> o escribinos a{' '}
          <A href="mailto:hola@fielty.app">hola@fielty.app</A>.
        </P>
      </article>

      {/* CTA FINAL */}
      <section style={{ ...s.section, background: '#0a0a0a', textAlign: 'center' }}>
        <div style={{ ...s.inner, maxWidth: 600 }}>
          <h2 style={{ ...s.h2, marginBottom: 16 }}>Empezá con tu negocio</h2>
          <p style={{ ...s.sectionSub, marginBottom: 32 }}>
            El plan gratis te sirve hasta 30 clientes, sin tarjeta de crédito. Se configura en cinco minutos.
          </p>
          <a href="/onboarding/registro" style={{ ...s.ctaPrimary, fontSize: 17, padding: '17px 38px' }}>
            Empezá gratis
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <a href="/terminos" style={s.footerLink}>Términos</a>
        <a href="/privacidad" style={s.footerLink}>Privacidad</a>
        <a href="/faq" style={s.footerLink}>FAQ</a>
        <a href="/para" style={s.footerLink}>Por rubro</a>
        <a href="/como-armar-un-programa-de-puntos" style={s.footerLink}>Cómo armar un programa de puntos</a>
        <a href="/" style={s.footerLink}>fielty.app</a>
      </footer>

      {/* Los <strong> del texto van en blanco para que resalten sobre el gris del cuerpo. */}
      <style>{`.guia strong { color: #fff; font-weight: 700; }`}</style>
    </div>
  )
}

// Estilos propios de la guía. Nav, hero, CTA y footer salen de los
// estilos compartidos de /para para que se vea igual que esas páginas.
const g = {
  // Más angosto que las landings: es texto largo para leer.
  wrap: { maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' },

  resumen: { background: '#141414', border: '1px solid #222', borderRadius: 20, padding: '24px 28px', marginBottom: 40 },
  etiqueta: { fontSize: 11, fontWeight: 800, color: theme.darkMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 },

  indice: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 64 },
  indiceLink: { display: 'flex', alignItems: 'center', gap: 12, background: '#1a1a1a', border: '1px solid #222', borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none' },
  indiceNum: { width: 26, height: 26, borderRadius: '50%', background: theme.red, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 },

  parte: { display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid #1a1a1a', paddingTop: 56, margin: '64px 0 40px', scrollMarginTop: 16 },
  parteTitulo: { ...s.h2, margin: 0 },

  seccion: { marginBottom: 48 },
  h2: { fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 900, color: 'white', margin: '0 0 20px', letterSpacing: -0.6, lineHeight: 1.25 },
  h3: { fontSize: 21, fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: -0.3, lineHeight: 1.3 },
  h4: { fontSize: 16, fontWeight: 700, color: 'white', margin: '28px 0 10px', lineHeight: 1.5 },

  p: { fontSize: 16, color: theme.darkText, lineHeight: 1.8, margin: '0 0 16px' },
  nota: { fontSize: 14, color: theme.darkMuted },
  link: { color: theme.redOnDark, fontWeight: 700, textDecoration: 'none' },
  // listStyle explícito: el reset global deja las listas sin viñeta.
  lista: { paddingLeft: 22, margin: '0 0 20px', listStyle: 'disc' },
  item: { fontSize: 15, color: theme.darkText, lineHeight: 1.75, marginBottom: 8 },
  destacado: { borderLeft: `3px solid ${theme.red}`, background: '#141414', borderRadius: '0 12px 12px 0', padding: '16px 20px', margin: '20px 0', fontSize: 15, color: theme.darkText, lineHeight: 1.75 },
  code: { background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '2px 7px', borderRadius: 6, fontSize: 13, fontFamily: 'monospace', color: '#e5e5e5', fontWeight: 400, overflowWrap: 'anywhere' },

  // Las tablas scrollean de costado en el celular en vez de aplastar las columnas.
  tablaWrap: { border: '1px solid #222', borderRadius: 14, overflowX: 'auto', marginBottom: 16 },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: theme.darkMuted, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#1a1a1a' },
  td: { padding: '12px 16px', fontSize: 14, color: theme.darkText, borderTop: '1px solid #1a1a1a', lineHeight: 1.5 },
  tdFuerte: { color: 'white', fontWeight: 600 },
}

// Componentes auxiliares
const P = ({ children, style }) => <p style={{ ...g.p, ...style }}>{children}</p>
const A = ({ href, children }) => <a href={href} style={g.link}>{children}</a>
const SubTitle = ({ children }) => <h4 style={g.h4}>{children}</h4>
const Highlight = ({ children }) => <div style={g.destacado}>{children}</div>
const Code = ({ children }) => <code style={g.code}>{children}</code>
const List = ({ items }) => (
  <ul style={g.lista}>
    {items.map((item, i) => <li key={i} style={g.item}>{item}</li>)}
  </ul>
)
const Tabla = ({ children, minWidth }) => (
  <div style={g.tablaWrap}>
    <table style={{ ...g.tabla, minWidth }}>{children}</table>
  </div>
)
const PartTitle = ({ parte }) => (
  <div id={parte.id} style={g.parte}>
    <div style={s.stepNum}>{parte.numero}</div>
    <h2 style={g.parteTitulo}>{parte.titulo}</h2>
  </div>
)
const Section = ({ title, children, level = 2 }) => {
  const Heading = level === 3 ? 'h3' : 'h2'
  return (
    <div style={g.seccion}>
      <Heading style={level === 3 ? g.h3 : g.h2}>{title}</Heading>
      {children}
    </div>
  )
}
