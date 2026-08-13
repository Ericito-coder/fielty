/**
 * Sincronización de suscripciones con Mercado Pago.
 *
 * El webhook es "best effort": si MP no está configurado, si el
 * secreto no coincide o si el evento se pierde, el pago queda sin
 * impactar. Para que eso no vuelva a pasar, la verdad se resuelve
 * consultando la API de MP directamente (verificación activa):
 * al volver del checkout, con el botón "Ya pagué" y desde el cron.
 *
 * Solo servidor.
 */

import { sincronizarClaseWallet } from './googleWallet'

const MP_API = 'https://api.mercadopago.com'

async function mpGet(path) {
  const res = await fetch(`${MP_API}${path}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })
  if (!res.ok) return null
  return res.json()
}

/**
 * Busca en MP las suscripciones de un negocio.
 *
 * IMPORTANTE: la API de MP ignora el filtro `external_reference` en
 * /preapproval/search y devuelve todo. Por eso cada resultado se
 * valida acá contra el negocio — si se confiara en el filtro, se
 * activarían planes de negocios que nunca pagaron.
 */
async function buscarPreapprovals(negocioId, planIds) {
  const encontrados = new Map()
  const planesDelNegocio = new Set(planIds)

  const esDeEsteNegocio = (r) =>
    r?.external_reference === negocioId ||
    (r?.preapproval_plan_id && planesDelNegocio.has(r.preapproval_plan_id))

  const agregarValidados = (resultados) => {
    for (const r of resultados || []) {
      if (esDeEsteNegocio(r)) encontrados.set(r.id, r)
    }
  }

  // Por external_reference (lo guardamos al crear el plan)
  agregarValidados((await mpGet(`/preapproval/search?external_reference=${encodeURIComponent(negocioId)}&limit=100`))?.results)

  // Por cada plan que el negocio generó alguna vez (los planes viejos
  // no tienen external_reference; este filtro sí lo respeta MP)
  for (const planId of planIds) {
    agregarValidados((await mpGet(`/preapproval/search?preapproval_plan_id=${encodeURIComponent(planId)}&limit=100`))?.results)
  }

  return [...encontrados.values()]
}

/**
 * Consulta MP y deja el plan del negocio igual a la realidad.
 * Devuelve { plan, cambio, suscripcionesEncontradas }.
 */
export async function sincronizarSuscripcion(supabaseAdmin, negocioId) {
  const { data: negocio } = await supabaseAdmin
    .from('negocios')
    .select('id, plan, mp_plan_id, mp_plan_tipo, plan_manual')
    .eq('id', negocioId)
    .single()
  if (!negocio) return { error: 'Negocio no encontrado' }

  const { data: intentos } = await supabaseAdmin
    .from('suscripciones')
    .select('mp_plan_id, plan_tipo')
    .eq('negocio_id', negocioId)

  const planIds = [...new Set([
    ...(intentos || []).map(i => i.mp_plan_id),
    ...(negocio.mp_plan_id ? [negocio.mp_plan_id] : []),
  ])]

  const preapprovals = await buscarPreapprovals(negocioId, planIds)
  const activa = preapprovals.find(p => p.status === 'authorized')

  // Qué plan corresponde: el tipo con el que se creó ese plan de MP.
  // El fallback es pro_early porque solo llega ahí una suscripción vieja
  // sin tipo registrado, y esas son todas de la promo. Toda suscripción
  // nueva guarda su plan_tipo al crearse en /api/suscripcion.
  const tipoDe = (planId) =>
    (intentos || []).find(i => i.mp_plan_id === planId)?.plan_tipo
    || negocio.mp_plan_tipo
    || 'pro_early'

  let planNuevo = negocio.plan
  if (activa) {
    planNuevo = tipoDe(activa.preapproval_plan_id)
  } else if (preapprovals.length && negocio.plan && negocio.plan !== 'gratis' && !negocio.plan_manual) {
    // Tenía suscripción y ya no hay ninguna activa → vuelve a gratis.
    // Salvo que el plan esté puesto a mano: eso es un plan regalado, no
    // una baja, y la falta de suscripción en MP es lo esperable.
    planNuevo = 'gratis'
  }

  const cambio = planNuevo !== negocio.plan
  if (cambio || (activa && negocio.plan_manual)) {
    // Si aparece una suscripción real, el plan deja de ser una excepción
    // y vuelve a quedar bajo control de Mercado Pago.
    const cambios = { plan: planNuevo }
    if (activa && negocio.plan_manual) cambios.plan_manual = false
    await supabaseAdmin.from('negocios').update(cambios).eq('id', negocioId)
  }

  // El logo propio es feature de pago, así que un cambio de plan cambia lo
  // que tiene que mostrar el pase de Wallet. Sin este aviso, un negocio que
  // baja a gratis conserva su marca en el pase de todos sus clientes hasta
  // que algo más dispare la sincronización. Se hace acá porque este es el
  // único punto por el que pasan los cambios automáticos de plan: el
  // webhook de MP, los dos crons y /api/suscripcion/verificar.
  if (cambio) await sincronizarClaseWallet(negocioId)

  // Reflejar el estado en el historial
  for (const p of preapprovals) {
    if (!p.preapproval_plan_id) continue
    await supabaseAdmin
      .from('suscripciones')
      .update({ estado: p.status === 'authorized' ? 'activa' : p.status, updated_at: new Date().toISOString() })
      .eq('negocio_id', negocioId)
      .eq('mp_plan_id', p.preapproval_plan_id)
  }

  return { plan: planNuevo, cambio, suscripcionesEncontradas: preapprovals.length }
}

/**
 * Resuelve a qué negocio pertenece un evento del webhook.
 * Orden: external_reference → historial de intentos → campo legacy.
 */
export async function resolverNegocio(supabaseAdmin, preapproval) {
  const ref = preapproval?.external_reference
  if (ref) {
    const { data } = await supabaseAdmin
      .from('negocios').select('id, mp_plan_tipo').eq('id', ref).maybeSingle()
    if (data) return { negocioId: data.id, planTipo: data.mp_plan_tipo, via: 'external_reference' }
  }

  const planId = preapproval?.preapproval_plan_id
  if (planId) {
    const { data: s } = await supabaseAdmin
      .from('suscripciones').select('negocio_id, plan_tipo').eq('mp_plan_id', planId).maybeSingle()
    if (s) return { negocioId: s.negocio_id, planTipo: s.plan_tipo, via: 'historial' }

    const { data: n } = await supabaseAdmin
      .from('negocios').select('id, mp_plan_tipo').eq('mp_plan_id', planId).maybeSingle()
    if (n) return { negocioId: n.id, planTipo: n.mp_plan_tipo, via: 'negocios.mp_plan_id' }
  }

  return null
}
