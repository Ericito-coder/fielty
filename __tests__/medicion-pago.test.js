// Tests de cuándo se mide un pago en GA4 y Meta.
//
// Copia de estadoCheckout (lib/medicion.js) y esPago (lib/planes.js): los
// tests de este proyecto no importan de lib (jest corre sin transformar
// ESM). Si cambia una, cambiar la otra.

function esPago(plan) {
  return plan === 'pro' || plan === 'pro_early' || plan === 'business'
}

const VIGENCIA_CHECKOUT_MS = 7 * 24 * 60 * 60 * 1000

function estadoCheckout(checkout, negocio, ahora = Date.now()) {
  if (!checkout) return 'descartar'
  if (ahora - Date.parse(checkout.fecha) > VIGENCIA_CHECKOUT_MS) return 'descartar'
  if (checkout.negocioId !== negocio.id) return 'esperar'
  if (negocio.plan_manual) return 'esperar'
  if (!esPago(negocio.plan) || negocio.plan === checkout.planAnterior) return 'esperar'
  return 'medir'
}

const AHORA = Date.parse('2026-10-06T20:00:00Z')
const haceDias = (dias) => new Date(AHORA - dias * 24 * 60 * 60 * 1000).toISOString()

const checkout = (extra = {}) => ({
  negocioId: 'neg-1', planAnterior: 'gratis', monto: 20000, fecha: haceDias(0), ...extra,
})
const negocio = (extra = {}) => ({ id: 'neg-1', plan: 'gratis', plan_manual: false, ...extra })

describe('Medición del pago', () => {
  test('mide cuando el checkout dejó activo un plan pago', () => {
    expect(estadoCheckout(checkout(), negocio({ plan: 'pro' }), AHORA)).toBe('medir')
  })

  // El caso que se perdía: el dueño paga, cierra la pestaña de Mercado
  // Pago y entra al panel al otro día por la URL de siempre.
  test('mide aunque el dueño entre días después', () => {
    expect(estadoCheckout(checkout({ fecha: haceDias(3) }), negocio({ plan: 'pro' }), AHORA)).toBe('medir')
  })

  test('espera si el plan todavía no se activó', () => {
    expect(estadoCheckout(checkout(), negocio(), AHORA)).toBe('esperar')
  })

  test('espera si el plan es el mismo que tenía antes de pagar', () => {
    const c = checkout({ planAnterior: 'pro' })
    expect(estadoCheckout(c, negocio({ plan: 'pro' }), AHORA)).toBe('esperar')
    expect(estadoCheckout(c, negocio({ plan: 'business' }), AHORA)).toBe('medir')
  })

  test('no cuenta como venta un plan regalado a mano', () => {
    expect(estadoCheckout(checkout(), negocio({ plan: 'business', plan_manual: true }), AHORA)).toBe('esperar')
  })

  test('no toca el checkout de otro negocio', () => {
    expect(estadoCheckout(checkout({ negocioId: 'neg-2' }), negocio({ plan: 'pro' }), AHORA)).toBe('esperar')
  })

  test('descarta un checkout abandonado hace más de una semana', () => {
    expect(estadoCheckout(checkout({ fecha: haceDias(8) }), negocio(), AHORA)).toBe('descartar')
    expect(estadoCheckout(checkout({ fecha: haceDias(8) }), negocio({ plan: 'pro' }), AHORA)).toBe('descartar')
  })

  test('descarta un registro ilegible', () => {
    expect(estadoCheckout(null, negocio({ plan: 'pro' }), AHORA)).toBe('descartar')
  })

  // Los registros guardados antes de este cambio no tienen fecha ni monto.
  test('un registro viejo sin fecha no vence', () => {
    const viejo = { negocioId: 'neg-1', planAnterior: 'gratis' }
    expect(estadoCheckout(viejo, negocio({ plan: 'pro' }), AHORA)).toBe('medir')
    expect(estadoCheckout(viejo, negocio(), AHORA)).toBe('esperar')
  })
})
