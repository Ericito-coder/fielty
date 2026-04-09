# Fielty — Guía completa de producto

**Versión:** MVP  
**Actualizado:** Abril 2026  
**URL:** https://www.fielty.app

---

## ¿Qué es Fielty?

Fielty es un sistema de fidelización de clientes para negocios físicos argentinos. Permite que tus clientes acumulen puntos en cada compra y los canjeen por premios que vos definís.

**Sin app. Sin descarga. Todo desde el navegador del celular.**

Ideal para: peluquerías, cafeterías, veterinarias, restaurantes, tiendas de ropa, farmacias, y cualquier negocio que quiera hacer volver a sus clientes.

---

## Planes disponibles

| | Gratis | Pro | Business |
|---|---|---|---|
| Clientes | Hasta 50 | Ilimitados | Ilimitados |
| Sucursales | 1 | Hasta 3 | Ilimitadas |
| Logo personalizado | ✗ | ✗ | ✓ |
| Exportación CSV | ✗ | ✗ | ✓ |
| Precio | $0 | $10.000/mes* | $35.000/mes |

*Precio especial para los primeros 100 negocios. Precio regular: $20.000/mes.

---

---

# PARTE 1 — FLUJO DEL DUEÑO DE NEGOCIO

---

## Paso 1 — Registro del negocio

### 1.1 Elegir plan
El dueño entra a **fielty.app** y elige su plan en la landing page.

- Si elige **Gratis**: va directo al onboarding sin pagar.
- Si elige **Pro o Business**: va al onboarding y al final es redirigido a Mercado Pago para completar el pago.

### 1.2 Crear cuenta
URL: `fielty.app/onboarding/registro`

Completa:
- **Email** — con el que va a ingresar al panel
- **Contraseña** — mínimo 6 caracteres
- **Nombre** — del dueño o responsable
- **Teléfono** — de contacto del dueño

### 1.3 Configurar el negocio
URL: `fielty.app/onboarding/negocio`

Completa:
- **Nombre del negocio** — ej: "Pet Point"
- **Rubro** — ej: "Veterinaria"
- **Color de marca** — elige un color que representa al negocio (aparece en la tarjeta del cliente)

Fielty genera automáticamente un **slug único** para el negocio (ej: `pet-point`) que se usa en todas las URLs.

### 1.4 Pantalla "¡Todo listo!"
URL: `fielty.app/onboarding/listo`

El dueño ve:
- Link de registro para clientes: `fielty.app/registro/pet-point`
- QR para imprimir y poner en el mostrador
- Los 3 primeros pasos recomendados

**Email de bienvenida**: se envía automáticamente al email del dueño con el link de registro, los primeros pasos y el link al panel.

Si el plan elegido fue Pro o Business, es redirigido a `fielty.app/dashboard/upgrade` para completar el pago con Mercado Pago.

---

## Paso 2 — El panel del dueño

URL: `fielty.app/dashboard`

El panel tiene 5 secciones. Disponible en mobile y desktop.

---

### 📊 Sección: Inicio

**Métricas principales (6 cards):**
- 👥 Clientes totales registrados
- 🔥 Clientes activos en los últimos 30 días
- ⭐ Puntos en circulación
- 🎁 Canjes realizados
- 🤝 Referidos
- 📈 Tasa de retorno (% activos / totales)

**Links del negocio:**
- **Link de registro de clientes**: `fielty.app/registro/[slug]`
  - Botón para copiar
  - Botón para ver/imprimir el QR
- **Link de caja** (sin sucursal): `fielty.app/c/[slug]`
  - Botón para copiar

**Últimas transacciones:**
- Muestra las últimas 10 transacciones en tiempo real
- Tipo de transacción con ícono: suma de puntos ⭐, cumpleaños 🎂, referido 🤝, canje 🎁
- Fecha y puntos de cada transacción

**Métricas por sucursal** (si tiene más de una):
- Clientes por sucursal
- Puntos acreditados por sucursal
- Canjes por sucursal
- Barra de progreso comparativa entre sucursales

**Guía de primeros pasos:**
- Aparece la primera vez que el dueño entra al panel
- Checklist con 5 pasos que se tachan automáticamente según los datos reales:
  1. ✅ Creaste tu programa de fidelización
  2. Copiaste el link de registro para tus clientes
  3. Tu primer cliente se registró
  4. Acreditaste puntos desde la caja
  5. Configuraste una recompensa
- Barra de progreso roja
- Al completar los 5 pasos desaparece automáticamente
- Se puede cerrar manualmente (pide confirmación antes de cerrar)

---

### 👥 Sección: Clientes

**Lista completa de clientes** con:
- Nombre
- DNI
- Puntos actuales
- Nivel: 🥉 Bronce / 🥈 Plata / 🥇 Oro (según puntos históricos acumulados)
- Última visita
- Fecha de registro

**Filtros:**
- Todos
- Activos (visitaron en los últimos 30 días)
- Inactivos
- Referidos

**Buscador** por nombre o DNI.

**Exportación CSV** (solo plan Business):
- Descarga todos los clientes filtrados en formato CSV
- Compatible con Excel (incluye BOM para caracteres en español)
- Columnas: Nombre, DNI, Teléfono, Email, Puntos, Puntos históricos, Visitas, Última visita, Fecha de registro

---

### 🎁 Sección: Recompensas

El dueño crea las recompensas que sus clientes pueden canjear.

**Por cada recompensa define:**
- Nombre (ej: "Café gratis")
- Descripción (ej: "Un café de cualquier tamaño")
- Puntos necesarios para canjearla

**Acciones disponibles:**
- Crear nueva recompensa
- Activar / desactivar recompensa (las inactivas no aparecen para los clientes)
- Eliminar recompensa

---

### 🏪 Sección: Sucursales

Cada sucursal tiene su propia URL de caja con métricas separadas.

**Por cada sucursal:**
- Nombre (ej: "Sucursal Centro")
- Dirección (opcional)
- URL de caja propia: `fielty.app/c/[slug]/[sucursal-slug]`
- PIN de acceso propio para empleados
- Botón para copiar URL de caja

**Límites según plan:**
- Gratis: 1 sucursal
- Pro: hasta 3 sucursales
- Business: ilimitadas

Al llegar al límite, el formulario de nueva sucursal se bloquea con un aviso para mejorar el plan.

---

### ⚙️ Sección: Configuración

**Personalización del negocio:**
- Nombre del negocio
- Color de marca (picker de color)
- **Logo personalizado** (solo Business):
  - Sube una imagen (PNG, JPG, WebP — máx. 2MB)
  - Aparece en la tarjeta del cliente y en la página de registro
  - Se almacena en Supabase Storage

**Programa de puntos:**
- **Regla de puntos**: cuántos puntos por cada peso de compra
  - Ej: "1 punto cada $100"
- **Puntos de bienvenida**: los que recibe un cliente al registrarse (default: 10)

**Sistema de referidos:**
- **Puntos para el que invita** (emisor): default 100 pts
- **Puntos para el nuevo cliente** (receptor): default 50 pts

---

## Paso 3 — Gestión del pago (planes pagos)

URL: `fielty.app/dashboard/upgrade`

Para pasar de Gratis a Pro o Business:
1. El dueño elige el plan deseado
2. Es redirigido a Mercado Pago para completar el pago
3. Al confirmar el pago, Mercado Pago envía un webhook a Fielty
4. El plan se actualiza automáticamente
5. El dueño ve un banner de confirmación "¡Suscripción activada!" en el panel

**Cancelación:** desde Mercado Pago. Al cancelar, el plan vuelve a Gratis automáticamente.

---

## Notificaciones automáticas al dueño

Fielty envía emails automáticos en estos momentos:

| Evento | Asunto |
|---|---|
| Termina el onboarding | "¡Bienvenido a Fielty, [negocio]! 🎉" |
| Llega a 45 clientes (plan Gratis) | "📊 Te quedan 5 clientes para el límite en Fielty" |
| Llega a 50 clientes (plan Gratis) | "⚠️ Llegaste al límite de clientes en Fielty" |

---

---

# PARTE 2 — FLUJO DEL EMPLEADO (LA CAJA)

---

## La caja

URL: `fielty.app/c/[slug]` (sin sucursal)  
URL: `fielty.app/c/[slug]/[sucursal]` (con sucursal)

La caja es la pantalla que usan los empleados en el punto de venta para acreditar puntos y validar canjes.

### Acceso con PIN
Al entrar, el empleado ingresa el PIN de la sucursal. Esto evita que cualquiera acredite puntos sin autorización.

### Acreditar puntos a un cliente

1. **Buscar al cliente**: escribe nombre o DNI en el buscador
2. **Seleccionar al cliente**: ve nombre, DNI, puntos actuales y nivel
3. **Ingresar el monto de la compra**: tiene botones rápidos ($500, $1.000, $2.000, $5.000, $10.000, $20.000) o puede escribir el monto
4. **Ver preview de puntos**: antes de confirmar ve cuántos puntos va a recibir el cliente
5. **Confirmar**: los puntos se acreditan al instante y aparece un mensaje de confirmación

### Validar canje de recompensa

Cuando un cliente quiere canjear una recompensa:
1. El cliente genera un código desde su tarjeta (válido 24hs)
2. El empleado va a "Validar canje" en la caja
3. Ingresa el código del cliente
4. Ve qué recompensa es y a nombre de quién
5. Confirma que entregó el premio — el canje queda marcado como usado

### Ayuda para clientes

Si un cliente no sabe cómo acceder a su tarjeta, hay un botón:
> ❓ ¿El cliente no sabe cómo ver su tarjeta?

Al tocarlo aparece el link `fielty.app/mi-tarjeta` con opción de copiarlo para compartirlo con el cliente.

---

---

# PARTE 3 — FLUJO DEL CLIENTE

---

## Paso 1 — Registro del cliente

URL: `fielty.app/registro/[slug-del-negocio]`

El cliente llega a esta página escaneando el QR del negocio o con el link que le compartieron.

**Campos del formulario:**
- **Nombre** — obligatorio
- **DNI** — obligatorio (evita duplicados por negocio)
- **Email** — obligatorio (para recuperar contraseña)
- **Contraseña** — obligatorio (mínimo 6 caracteres, para volver a ver su tarjeta)
- **WhatsApp** — opcional
- **Fecha de nacimiento** — opcional (recibe puntos extra el día de su cumpleaños)

**Validaciones automáticas:**
- No puede registrarse dos veces en el mismo negocio con el mismo DNI
- No puede registrarse dos veces con el mismo WhatsApp en el mismo negocio
- No puede registrarse dos veces con el mismo email en el mismo negocio

**Al registrarse recibe:**
- 10 puntos de bienvenida (configurable por el dueño)
- Puntos extra si se registró con un link de referido de otro cliente

**Si el negocio tiene logo** (plan Business), aparece el logo en lugar de las iniciales.

**Si fue referido por otro cliente:**
- Ve un mensaje especial: "🤝 Un amigo te invitó — vas a recibir puntos extra al registrarte"
- El que lo invitó también recibe sus puntos automáticamente

---

## Paso 2 — La tarjeta digital

URL: `fielty.app/tarjeta/[id-del-cliente]`

Luego del registro, el cliente es redirigido a su tarjeta. Esta es su "tarjeta de fidelidad digital".

**Lo que ve el cliente:**

**Header de la tarjeta:**
- Logo del negocio (si tiene) o iniciales con color de marca
- Nombre del negocio
- Nivel del cliente: 🥉 Bronce / 🥈 Plata / 🥇 Oro
- Puntos actuales (grande, en el centro)
- Barra de progreso hacia la próxima recompensa
- Cuántos puntos le faltan para el próximo nivel

**Canje activo (si tiene uno pendiente):**
- Aparece como banner destacado al tope de la tarjeta
- Muestra el nombre de la recompensa, el código y la cuenta regresiva de expiración (24hs)
- El empleado lo usa para validar el canje en la caja

**Recompensas disponibles:**
- Lista de todas las recompensas activas del negocio
- Las que ya puede canjear aparecen con botón activo
- Las que aún no puede aparecen bloqueadas con cuántos puntos le faltan
- Al canjear se genera un código único válido por 24hs

**Sistema de referidos:**
- Botón "🔗 Compartir mi link"
- Genera un link único que incluye su ID como referido
- Si alguien se registra con ese link, ambos reciben puntos

**Historial de transacciones:**
- Últimas 20 transacciones
- Ícono según tipo: ⭐ puntos sumados, 🎂 cumpleaños, 🤝 referido, 🎁 canje
- Fecha y puntos de cada movimiento
- Si fue acreditado en una sucursal específica, muestra el nombre

---

## Paso 3 — Cómo vuelve el cliente a su tarjeta

Si el cliente pierde el link o cierra el navegador:

**Opción 1 — Desde el link de vuelta**
El cliente entra a **`fielty.app/mi-tarjeta`**

**Opción 2 — El empleado se lo indica**
En la caja hay un botón de ayuda que muestra este link.

**Flujo en `/mi-tarjeta`:**
1. Ingresa su **DNI** y **contraseña**
2. Si está registrado en un solo negocio → va directo a su tarjeta
3. Si está en varios negocios → elige a cuál quiere ir

**Si olvidó la contraseña:**
1. Hace click en "¿Olvidaste tu contraseña?"
2. Ingresa su **email**
3. Recibe un email con un link para resetear la contraseña (válido 1 hora)
4. Crea una nueva contraseña
5. Puede ingresar normalmente

---

## Sistema de niveles

Los niveles se calculan en base a **puntos históricos** (todos los puntos que ganó, incluso los que ya canjeó):

| Nivel | Puntos históricos |
|---|---|
| 🥉 Bronce | 0 — 999 |
| 🥈 Plata | 1.000 — 4.999 |
| 🥇 Oro | 5.000+ |

---

## Sistema de referidos

Cada cliente tiene un link único de referido: `fielty.app/registro/[slug]?ref=[id-cliente]`

**Cuando alguien se registra con ese link:**
- El cliente que invitó recibe X puntos (default: 100, configurable)
- El nuevo cliente recibe X puntos extra además de los de bienvenida (default: 50, configurable)
- El contador de referidos del cliente que invitó sube en 1
- Ambas transacciones quedan registradas en el historial con el ícono 🤝

---

## Cumpleaños automático

Si el cliente cargó su fecha de nacimiento, el día de su cumpleaños recibe puntos extra automáticamente.
- La transacción aparece en su historial con el ícono 🎂

---

---

# PARTE 4 — PÁGINAS Y RECURSOS

---

| Página | URL | Para quién |
|---|---|---|
| Landing / Precios | fielty.app | Dueños de negocio |
| Registro negocio | fielty.app/onboarding/registro | Dueños de negocio |
| Panel del dueño | fielty.app/dashboard | Dueños de negocio |
| Upgrade de plan | fielty.app/dashboard/upgrade | Dueños de negocio |
| Caja (sin sucursal) | fielty.app/c/[slug] | Empleados |
| Caja (con sucursal) | fielty.app/c/[slug]/[sucursal] | Empleados |
| Registro cliente | fielty.app/registro/[slug] | Clientes |
| Tarjeta del cliente | fielty.app/tarjeta/[id] | Clientes |
| Ver mi tarjeta | fielty.app/mi-tarjeta | Clientes |
| Recuperar contraseña | fielty.app/mi-tarjeta/reset | Clientes |
| QR del negocio | fielty.app/qr/[slug] | Dueños de negocio |
| Preguntas frecuentes | fielty.app/faq | Todos |
| Términos y condiciones | fielty.app/terminos | Todos |
| Política de privacidad | fielty.app/privacidad | Todos |

---

---

# PARTE 5 — STACK TÉCNICO

---

- **Frontend/Backend:** Next.js 16 (App Router)
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación dueños:** Supabase Auth
- **Emails:** Resend
- **Pagos:** Mercado Pago (suscripciones mensuales)
- **Storage (logos):** Supabase Storage
- **Deploy:** Vercel
- **QR:** librería `qrcode`

---

## Contacto y soporte

Email: eric.bohl10@gmail.com  
Web: fielty.app
