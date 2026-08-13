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
