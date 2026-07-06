# Fielty — Lista completa de funcionalidades

**Actualizado:** Julio 2026 · Para tener a mano cuando te pregunten qué hace la plataforma.

**El pitch de una línea:** *Programa de puntos para tu negocio, listo en 5 minutos. Tus clientes acumulan y canjean sin bajarse ninguna app — y vos los hacés volver.*

---

## 🏪 Para el dueño del negocio (el panel)

### Arranque
- **Onboarding self-service en minutos**: crea la cuenta, configura el negocio (nombre, rubro, color de marca) y su primera recompensa. Sale con el QR de registro listo para imprimir y el link de la caja. Sin demos, sin vendedores, sin requisitos técnicos.
- **Precios públicos** y plan gratis para arrancar (hasta 50 clientes).

### Panel de inicio
- Métricas en vivo: clientes totales, nuevos del mes, activos (últimos 30 días), puntos en circulación, canjes realizados, tasa de retorno, referidos.
- Links del negocio con un click: registro de clientes (con **QR imprimible**), acceso a tarjetas (con **cartel para el mostrador** imprimible) y caja.
- Últimas transacciones en tiempo real, top clientes, resumen de canjes.
- Métricas comparativas por sucursal (si tiene más de una).
- Checklist de primeros pasos que se tacha sola con datos reales.

### Clientes
- Lista completa: nombre, DNI, nivel, puntos, visitas, última visita.
- Filtros: todos / activos / inactivos / referidos. Buscador por nombre o DNI.
- **Botón de WhatsApp por cliente** con mensaje prearmado inteligente: a los inactivos les propone volver ("tenés X puntos esperándote"), a los activos les recuerda su saldo. Sale del WhatsApp del propio negocio, gratis.
- **Exportar a CSV** (Pro+): toda la base descargable, compatible con Excel.

### 📣 Campañas (Pro+)
- Email masivo a un segmento: **inactivos +30 días, inactivos +60, o todos**.
- Mensaje personalizable con variables ({nombre}, {puntos}, {negocio}) y el estilo del negocio.
- **Métrica "volvieron"**: cuántos de los contactados volvieron a comprar después del envío — el ROI de la campaña, medido.
- Protecciones automáticas: ningún cliente recibe más de 1 campaña cada 30 días, link de baja legal en cada email, tope de 100 envíos por campaña.

### Recompensas
- Crear, editar, activar/desactivar y eliminar premios. Cada uno con su costo en puntos.

### Sucursales
- Cada sucursal con su propia URL de caja, su propio PIN y sus métricas separadas.
- Límites por plan: 1 (Gratis) / 3 (Pro) / ilimitadas (Business).

### Configuración
- Color de marca (aparece en la tarjeta del cliente y el pase de Wallet).
- **Logo propio** (Pro+) en tarjeta, página de registro y pase de Wallet.
- Regla de puntos configurable: "cada $X de compra, Y puntos".
- Puntos de bienvenida, puntos de cumpleaños y puntos de referidos (para el que invita y el invitado), todos configurables.
- PIN de caja.

### Pagos
- Suscripción mensual por **Mercado Pago**. Alta y baja automáticas (webhook). Cancelás cuando quieras y volvés a Gratis.

---

## 💵 Para el empleado (la caja)

- **Acceso con PIN** (por negocio o por sucursal) y botón de bloqueo. No ve nada del panel del dueño.
- **Buscar cliente** por nombre o DNI.
- **📷 Escanear la tarjeta del cliente**: el cliente muestra el QR de su tarjeta o de su pase de Google Wallet, el empleado lo escanea con la cámara y el cliente queda seleccionado al instante — sin tipear nada. Rechaza tarjetas de otros negocios.
- **Acreditar puntos**: ingresa el monto (con botones rápidos), ve el preview de puntos antes de confirmar.
- **Avisar por WhatsApp**: después de acreditar, un botón abre WhatsApp con el mensaje listo ("Sumaste X puntos, ya tenés Y") y el link directo a la tarjeta del cliente.
- **Registrar cliente nuevo desde la caja** en segundos (la contraseña inicial es su DNI), con consumo inicial opcional.
- **Validar canjes**: ingresa (o el cliente muestra) el código de canje, ve qué premio es y de quién, y confirma la entrega. Un código no puede usarse dos veces, ni en dos cajas a la vez.
- Funciona en celular, tablet o computadora. Es una página web: no hay nada que instalar.

---

## 📱 Para el cliente final

- **Registro sin app**: escanea el QR del mostrador o entra al link, completa sus datos y ya tiene su tarjeta con puntos de bienvenida. Todo en el navegador.
- **Tarjeta digital** con la identidad del negocio: puntos, **nivel (🥉 Bronce / 🥈 Plata / 🥇 Oro)** según puntos históricos, barra de progreso hacia el próximo premio.
- **Canjes self-service**: cuando le alcanzan los puntos, canjea desde la tarjeta y recibe un código válido por 24 horas con cuenta regresiva. Si vence, los puntos se devuelven solos.
- **"Mostrar mi código"**: QR grande para que lo escaneen en la caja.
- **👛 Google Wallet** (negocios Business): la tarjeta como pase en la billetera del teléfono — puntos, nivel y "te faltan X pts para tu premio" **que se actualizan solos** con cada compra. Como Starbucks.
- **App instalable (PWA)**: la tarjeta queda como ícono en el inicio del celular y **funciona sin conexión**.
- **Historial** de movimientos con detalle (compras, cumpleaños, referidos, canjes, sucursal).
- **Referidos**: comparte su link único; cuando un amigo se registra, ambos ganan puntos.
- **Cumpleaños**: puntos de regalo automáticos el día de su cumpleaños.
- **Acceso desde cualquier lado**: `fielty.app/mi-tarjeta` con DNI y contraseña. Si está en varios negocios, elige a cuál entrar. Recuperación de contraseña por email.
- **Emails automáticos**: bienvenida al registrarse, aviso cada vez que suma puntos (con su saldo y link a la tarjeta).

---

## ⚙️ Automatizaciones (funcionan solas, nadie las opera)

- 🎂 **Cumpleaños**: todos los días acredita los puntos de regalo a quienes cumplen años.
- ⏱ **Canjes vencidos**: expira los códigos de más de 24hs y devuelve los puntos al cliente.
- 📧 **Alertas de límite**: al dueño en plan Gratis le avisa cuando llega a 45 y 50 clientes.
- 💳 **Suscripciones**: el pago de Mercado Pago activa el plan solo; la cancelación lo baja a Gratis sola.
- 👛 **Wallet siempre al día**: cada acreditación o canje actualiza el pase en la billetera del cliente.

---

## 🔒 Seguridad e infraestructura (si preguntan los técnicos)

- Sin app que mantener: todo web, hosteado en Vercel con base de datos Supabase (PostgreSQL).
- Datos protegidos con Row Level Security: cada dueño ve solo su negocio; nada sensible viaja al navegador.
- El PIN de caja se valida en el servidor; las operaciones de puntos son atómicas (dos cajas no se pisan); protección contra fuerza bruta y spam.
- Los clientes acceden con contraseña hasheada y recuperación por email con token de 1 hora.

---

## 💰 Planes

| | **Gratis** | **Pro** $20.000/mes* | **Business** $35.000/mes |
|---|---|---|---|
| Clientes | Hasta 50 | Ilimitados | Ilimitados |
| Sucursales | 1 | Hasta 3 | Ilimitadas |
| Puntos, niveles, referidos, cumpleaños | ✓ | ✓ | ✓ |
| Caja con escáner QR | ✓ | ✓ | ✓ |
| Tarjeta digital + PWA | ✓ | ✓ | ✓ |
| Campañas de email con métrica de retorno | — | ✓ | ✓ |
| Logo personalizado | — | ✓ | ✓ |
| Exportar clientes (CSV) | — | ✓ | ✓ |
| Tarjeta en Google Wallet | — | — | ✓ |
| WhatsApp automático | — | — | Próximamente |

*Promo primeros 100 negocios: $10.000/mes.

### Frases que venden (para tener a mano)
- *"Tu cliente no baja ninguna app: escanea un QR y ya está sumando puntos."*
- *"Una campaña que te trae 5 clientes de vuelta ya pagó el mes del plan Pro."*
- *"Tu tarjeta en la billetera de Google del cliente, como Starbucks — y el saldo se actualiza solo."*
- *"El empleado escanea el QR del cliente y le suma puntos en 5 segundos, hasta con cola en el local."*
- *"Empezás gratis, sin hablar con nadie, y en 5 minutos tenés el QR en el mostrador."*

---

## 🔜 En el horno (no prometer con fecha)

- WhatsApp automático (avisos de puntos, cumpleaños y campañas por WhatsApp).
- Apple Wallet.
- Integración con Tiendanube (puntos automáticos por ventas online).
- Reactivación automática (campañas que se disparan solas).
