import { storage } from './storage'
import { esPago } from './planes'

/**
 * Conversiones del embudo, a GA4 y al pixel de Meta en una sola llamada.
 *
 * Es el único lugar que sabe a qué plataforma va cada evento. Google Ads
 * no necesita nada acá: importa los eventos clave de GA4. Si algún día se
 * suma un tag propio de Ads, o se pasa todo a Tag Manager, el cambio es
 * en este archivo y no en cada página que mide algo.
 *
 * GA4 está en todo el sitio (layout raíz); el pixel, solo en el embudo de
 * venta. Mandarle algo a una plataforma que no está cargada en la página
 * no hace nada, así que esto se puede llamar desde cualquier lado.
 */
const EVENTOS = {
  // Cuenta creada, todavía sin negocio. Solo para Meta: en GA ya se ve
  // como la visita a /onboarding/negocio y no hace falta otro evento clave.
  cuenta: { meta: 'Lead' },
  // Onboarding terminado: cuenta + negocio + recompensa.
  alta: { ga: 'sign_up', meta: 'CompleteRegistration' },
  // Un plan pago recién activado.
  pago: { ga: 'purchase', meta: 'Purchase' },
}

/**
 * `unaVezPorClave` guarda una marca en localStorage para no contar dos
 * veces el mismo evento si el usuario recarga o vuelve a la página. Sin
 * eso, un F5 en /onboarding/listo suma otra conversión y el costo por
 * registro de las campañas queda mal.
 */
export function medirConversion(tipo, { unaVezPorClave, valor, id } = {}) {
  if (typeof window === 'undefined') return
  const evento = EVENTOS[tipo]
  if (!evento) return

  if (unaVezPorClave) {
    if (storage.get(unaVezPorClave)) return
    storage.set(unaVezPorClave, '1')
  }

  const monto = valor ? { value: valor, currency: 'ARS' } : {}
  if (evento.ga) enviarAGa(evento.ga, { ...monto, ...(id ? { transaction_id: id } : {}) })
  if (evento.meta) enviarAMeta(evento.meta, monto)
}

// Un checkout que en una semana no terminó en plan pago se da por
// abandonado. Sin este tope el registro quedaría para siempre y contaría
// como venta cualquier plan que el negocio consiguiera después.
const VIGENCIA_CHECKOUT_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Qué hacer con el checkout que /dashboard/upgrade dejó anotado al salir
 * hacia Mercado Pago: 'medir' si ya activó un plan que antes no estaba,
 * 'esperar' si todavía puede activarlo, 'descartar' si ya no sirve.
 *
 * Los registros anteriores al 06/10/2026 no tienen fecha y no vencen.
 */
export function estadoCheckout(checkout, negocio, ahora = Date.now()) {
  if (!checkout) return 'descartar'
  if (ahora - Date.parse(checkout.fecha) > VIGENCIA_CHECKOUT_MS) return 'descartar'
  if (checkout.negocioId !== negocio.id) return 'esperar'
  // Un plan puesto a mano es un regalo, no una venta.
  if (negocio.plan_manual) return 'esperar'
  if (!esPago(negocio.plan) || negocio.plan === checkout.planAnterior) return 'esperar'
  return 'medir'
}

/**
 * Mide el pago cuando el checkout de Mercado Pago dejó activo un plan que
 * antes no estaba. Se llama en cada entrada al panel y no solo en la
 * vuelta con ?suscripcion=ok: MP no devuelve al dueño solo, y el que
 * cierra la pestaña después de pagar (o paga desde la app) nunca pasa por
 * esa URL. Así se perdió el primer pago posterior a la medición.
 *
 * El registro se borra recién al medir o al vencer. Si el dueño vuelve
 * antes de que el plan esté activo, queda para la próxima entrada.
 *
 * `monto` es el que informa MP en la verificación; si no hay, se usa el
 * precio que devolvió /api/suscripcion al crear el checkout.
 */
export function medirPagoNuevo(negocio, monto) {
  const crudo = storage.get('fielty_checkout')
  if (!crudo) return
  let checkout = null
  try { checkout = JSON.parse(crudo) } catch { /* registro ilegible */ }

  const estado = estadoCheckout(checkout, negocio)
  if (estado === 'esperar') return
  storage.remove('fielty_checkout')
  if (estado === 'descartar') return

  medirConversion('pago', {
    unaVezPorClave: `fielty_conv_pago_${negocio.id}_${negocio.plan}`,
    valor: monto ?? checkout.monto,
    id: `${negocio.id}-${negocio.plan}`,
  })
}

// Directo a dataLayer, igual que el gtag() del layout raíz: si esto corre
// antes de que termine de cargar el script de GA, el evento queda en cola
// en vez de perderse. Lo que se empuja tiene que ser `arguments` y no un
// array, porque gtag.js ignora los arrays.
function enviarAGa(nombre, params) {
  window.dataLayer = window.dataLayer || []
  gtag('event', nombre, params)
}

function gtag() {
  window.dataLayer.push(arguments)
}

// El pixel carga con strategy="afterInteractive", igual que la página que
// mide: según cuál termine primero, fbq puede no existir todavía. Se
// reintenta unos segundos; en las páginas sin pixel nunca aparece y se
// abandona solo.
function enviarAMeta(nombre, params, intentos = 12) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', nombre, params)
    return
  }
  if (intentos > 0) setTimeout(() => enviarAMeta(nombre, params, intentos - 1), 250)
}
