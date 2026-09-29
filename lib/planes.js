/**
 * Reglas de features por plan. Única fuente de verdad — usable en
 * cliente y servidor (el gating real siempre se valida en el server).
 *
 * Planes: gratis | pro_early (legacy: promo 50% off, ya no se vende) | pro | business
 */

export function esPago(plan) {
  return plan === 'pro' || plan === 'pro_early' || plan === 'business'
}

export function esBusiness(plan) {
  return plan === 'business'
}

// Clientes que admite el plan gratis. Bajó de 50 a 30 el 29/09/2026: con
// 50 casi nadie llegaba al límite (3 de 93 negocios), y los que usan Fielty
// en serio llegan a 30 clientes en 1 a 3 semanas, que es cuando conviene
// que se encuentren con el plan pago. A los negocios que ya estaban
// registrados se les respetan los 50 con los que entraron.
const CAMBIO_LIMITE_GRATIS = Date.parse('2026-09-29T03:00:00Z')

export function limiteClientes(negocio) {
  if (esPago(negocio?.plan)) return Infinity
  // created_at es timestamp sin zona (UTC). Si no vino en la consulta se
  // cae al límite viejo: mejor dejar pasar de más que bloquear a un
  // negocio que tiene derecho a 50.
  const t = String(negocio?.created_at || '')
  const alta = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`)
  if (Number.isNaN(alta)) return 50
  return alta < CAMBIO_LIMITE_GRATIS ? 50 : 30
}

// Qué desbloquea cada nivel:
// - Todos: Google Wallet
// - Pago (Pro o Business): clientes ilimitados, logo, campañas, CSV
// - Business: WhatsApp automático (cuando esté), sucursales ∞
export const puedeUsarCampanas = esPago
export const puedeSubirLogo = esPago
export const puedeExportarCSV = esPago

// Wallet no tiene costo por pase y el competidor lo da gratis: cobrarlo
// perdía la comparación antes de que nadie mirara el resto del producto.
// Lo que se paga es la marca propia — como `puedeSubirLogo` es de pago, el
// pase de un negocio gratis muestra el ícono de Fielty. Se deja como
// función y no como `true` para no tener que tocar los call sites si algún
// día vuelve a depender del plan.
export const puedeUsarWallet = () => true
