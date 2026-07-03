# WhatsApp automático con Twilio — guía de setup

Estado actual: los botones `wa.me` (manuales, gratis) ya están en producción.
Esta guía es para el paso siguiente: **mensajes automáticos** (aviso de puntos,
cumpleaños, campañas) desde un número central de Fielty vía Twilio.

## Qué tenés que hacer vos (una sola vez)

### Fase 1 — Sandbox (hoy, gratis, sin trámites)

1. Crear cuenta en https://www.twilio.com/try-twilio (gratis, dan crédito de prueba).
2. En la consola: **Messaging → Try it out → Send a WhatsApp message**.
   Ahí está el sandbox: un número de Twilio compartido para pruebas.
3. Copiar de la consola (Account Info, abajo a la derecha del dashboard):
   - `Account SID` (empieza con `AC...`)
   - `Auth Token`
4. Pasármelos para cargarlos como variables de entorno:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM` (el número del sandbox, formato `whatsapp:+14155238886`)

Limitación del sandbox: cada celular receptor tiene que "unirse" primero
mandando el código que muestra la consola (ej: `join brave-tiger`) al número
del sandbox. Sirve para que probemos el circuito completo con tu celular,
no para clientes reales.

### Fase 2 — Producción (cuando haya negocios pagando)

1. En la consola de Twilio: **Messaging → Senders → WhatsApp senders → New sender**.
2. Twilio te guía por el registro con Meta:
   - Verificación de **Meta Business** (datos del negocio Fielty, puede tardar días).
   - Un **número dedicado** (podés comprar uno en Twilio, ~US$1-2/mes).
     ⚠️ Ese número queda solo para la API: no se puede usar en la app de WhatsApp.
3. Crear y enviar a aprobación las **plantillas de mensaje** (Meta las aprueba en 1-2 días):
   - `puntos_acreditados`: "¡Hola {{1}}! Sumaste {{2}} puntos en {{3}}. Ya tenés {{4}} pts. 🎉"
   - `cumpleanos`: "¡Feliz cumpleaños {{1}}! 🎂 {{2}} te regaló {{3}} puntos."
   - `reactivacion`: "¡Hola {{1}}! Hace tiempo no te vemos por {{2}}. Tenés {{3}} puntos esperándote 🎁"
4. Cambiar `TWILIO_WHATSAPP_FROM` al número nuevo. Nada más: el código es el mismo.

## Costos (Argentina, aprox.)

| Concepto | Costo |
|---|---|
| Mensaje "utility" (sumaste puntos, cumpleaños) | ~US$0,02-0,03 por conversación de 24hs |
| Mensaje "marketing" (reactivación) | ~US$0,06-0,07 por conversación |
| Markup Twilio | ~US$0,005 por mensaje |
| Número dedicado | ~US$1-2/mes |

Regla práctica: 1.000 avisos de puntos ≈ US$30. Se absorbe en el plan Pro.

## Qué va a hacer el código (lo implemento cuando tengas las credenciales)

- `lib/whatsapp.js`: función `enviarWhatsApp({ telefono, plantilla, variables })`
  que llama a la API de Twilio. Proveedor abstraído: si un día conviene migrar
  a Meta Cloud API directo o 360dialog, se toca solo ese archivo.
- Hook en `/api/caja/acreditar-puntos`: además del email, manda el WhatsApp
  (si el cliente tiene teléfono y el negocio tiene la opción activada).
- Hook en `/api/cron/cumpleanos`: WhatsApp de cumpleaños.
- Toggle por negocio en Configuración: "Notificar por WhatsApp" (feature de plan Pro).
- Opt-out: si el cliente responde "BASTA", se marca `no_whatsapp` y no se le
  envía más (obligatorio para no quemar el número).
