/**
 * Cuánto vale cada negocio pago y hace cuánto paga. Lo usa el panel de admin.
 *
 * La base sabe qué plan tiene cada negocio, pero no desde cuándo paga ni
 * cuánto se le cobró: eso vive solo en Mercado Pago. Acá se cruzan las dos
 * cosas. Son funciones puras, sin consultas, para poder probarlas con datos
 * sueltos.
 */

const DIA = 24 * 60 * 60 * 1000

// negocios.created_at es timestamp sin zona (UTC): sin la Z, Date lo toma
// como hora local. Las fechas de MP ya traen su zona.
function aFecha(t) {
  const s = String(t || '')
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function mediana(numeros) {
  if (!numeros.length) return null
  const o = [...numeros].sort((a, b) => a - b)
  const m = Math.floor(o.length / 2)
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2
}

/**
 * Resume las suscripciones de MP de cada negocio. Devuelve un Map
 * negocioId → { pagaDesde, cuotas, cobrado, mensual, proximoCobro,
 * ultimoCobro, activa, bajaEl, diasHastaPagar }.
 *
 * Un negocio aparece solo si alguna vez se le cobró o tiene una suscripción
 * autorizada: un checkout que quedó a medias no es un pago.
 *
 * El cruce sigue el mismo orden que `resolverNegocio`: external_reference,
 * historial de intentos, y el mp_plan_id legacy de negocios. Lo que no se
 * puede asociar a ningún negocio (las suscripciones de prueba hechas a mano
 * en MP) queda afuera.
 */
export function suscripcionesPorNegocio({ negocios, intentos, preapprovals }) {
  const altaPorNegocio = new Map(negocios.map(n => [n.id, aFecha(n.created_at)]))
  const negocioPorPlan = new Map()
  negocios.forEach(n => { if (n.mp_plan_id) negocioPorPlan.set(n.mp_plan_id, n.id) })
  intentos.forEach(i => negocioPorPlan.set(i.mp_plan_id, i.negocio_id))

  const propias = new Map()
  for (const p of preapprovals) {
    const cobros = p.summarized?.charged_quantity || 0
    if (!cobros && p.status !== 'authorized') continue
    const negocioId = altaPorNegocio.has(p.external_reference)
      ? p.external_reference
      : negocioPorPlan.get(p.preapproval_plan_id)
    if (!negocioId) continue
    if (!propias.has(negocioId)) propias.set(negocioId, [])
    propias.get(negocioId).push(p)
  }

  const resumen = new Map()
  for (const [negocioId, lista] of propias) {
    const activa = lista.find(p => p.status === 'authorized')
    const fechas = campo => lista.map(p => aFecha(p[campo])).filter(Boolean).map(d => d.getTime())
    const cobrosEn = lista.map(p => aFecha(p.summarized?.last_charged_date)).filter(Boolean).map(d => d.getTime())
    const pagaDesde = Math.min(...fechas('date_created'))
    const alta = altaPorNegocio.get(negocioId)

    resumen.set(negocioId, {
      pagaDesde: new Date(pagaDesde).toISOString(),
      cuotas: lista.reduce((s, p) => s + (p.summarized?.charged_quantity || 0), 0),
      cobrado: lista.reduce((s, p) => s + (p.summarized?.charged_amount || 0), 0),
      mensual: activa?.auto_recurring?.transaction_amount ?? null,
      proximoCobro: activa?.next_payment_date || null,
      ultimoCobro: cobrosEn.length ? new Date(Math.max(...cobrosEn)).toISOString() : null,
      activa: !!activa,
      // Sin suscripción autorizada, la última modificación es la baja.
      bajaEl: activa ? null : new Date(Math.max(...fechas('last_modified'))).toISOString(),
      // Hay pagos anteriores al alta del negocio (un dueño que pagó desde
      // otro de sus negocios): se cuentan como 0 días, no como negativos.
      diasHastaPagar: alta ? Math.max(0, Math.floor((pagaDesde - alta.getTime()) / DIA)) : null,
    })
  }
  return resumen
}

/**
 * Números de conjunto de los negocios pagos. `pagos` son los negocios que
 * pagan hoy (plan pago que no está puesto a mano) y `mrr` lo que suman por
 * mes.
 *
 * El LTV estimado sale de las bajas: cuotas cobradas por cada baja es
 * cuántos meses dura un cliente en promedio, y eso por el ticket es lo que
 * deja. Sin ninguna baja no hay con qué estimarlo y queda en null — con la
 * primera el número existe pero se mueve mucho, por eso el panel muestra
 * siempre de cuántas bajas sale.
 */
export function resumenPagos({ negocios, suscripciones, pagos, mrr }) {
  const conCobros = negocios.filter(n => (suscripciones.get(n.id)?.cuotas || 0) > 0)
  const cobradoTotal = conCobros.reduce((s, n) => s + suscripciones.get(n.id).cobrado, 0)
  const cuotasTotal = conCobros.reduce((s, n) => s + suscripciones.get(n.id).cuotas, 0)
  const bajas = conCobros.filter(n => !suscripciones.get(n.id).activa).length
  const ticketPromedio = pagos.length ? mrr / pagos.length : null
  const churnMensual = bajas && cuotasTotal ? bajas / cuotasTotal : null

  return {
    cobradoTotal,
    cuotasTotal,
    pagaronAlgunaVez: conCobros.length,
    ticketPromedio,
    cobradoPorNegocio: conCobros.length ? cobradoTotal / conCobros.length : null,
    cuotasPorNegocio: conCobros.length ? cuotasTotal / conCobros.length : null,
    bajas,
    churnMensual,
    ltvEstimado: churnMensual && ticketPromedio ? ticketPromedio / churnMensual : null,
    medianaDiasHastaPagar: mediana(
      conCobros.map(n => suscripciones.get(n.id).diasHastaPagar).filter(d => d !== null)
    ),
  }
}
