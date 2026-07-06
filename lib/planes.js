/**
 * Reglas de features por plan. Única fuente de verdad — usable en
 * cliente y servidor (el gating real siempre se valida en el server).
 *
 * Planes: gratis | pro_early (promo primeros 100) | pro | business
 */

export function esPago(plan) {
  return plan === 'pro' || plan === 'pro_early' || plan === 'business'
}

export function esBusiness(plan) {
  return plan === 'business'
}

// Qué desbloquea cada nivel:
// - Pago (Pro o Business): clientes ilimitados, logo, campañas, CSV
// - Business: Google Wallet, WhatsApp automático (cuando esté), sucursales ∞
export const puedeUsarCampanas = esPago
export const puedeSubirLogo = esPago
export const puedeExportarCSV = esPago
export const puedeUsarWallet = esBusiness
