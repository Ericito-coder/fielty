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

/**
 * Mide el pago al volver del checkout de Mercado Pago, solo si esa vuelta
 * dejó activo un plan que antes no estaba. El registro del checkout lo
 * deja /dashboard/upgrade al salir hacia MP; se borra acá para que una
 * segunda vuelta con ?suscripcion=ok no vuelva a contar.
 */
export function medirPagoNuevo(negocio, monto) {
  let checkout = null
  try { checkout = JSON.parse(storage.get('fielty_checkout')) } catch { /* registro ilegible */ }
  storage.remove('fielty_checkout')

  if (checkout?.negocioId !== negocio.id) return
  if (!esPago(negocio.plan) || negocio.plan === checkout.planAnterior) return

  medirConversion('pago', {
    unaVezPorClave: `fielty_conv_pago_${negocio.id}_${negocio.plan}`,
    valor: monto,
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
