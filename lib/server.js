import { createClient } from '@supabase/supabase-js'

/**
 * Helpers exclusivos del servidor (rutas API). Usan la service role
 * key: NUNCA importar desde componentes 'use client'.
 */

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Únicos campos de `negocios` que pueden viajar al navegador.
// Nunca incluir acá: pin_caja, user_id, mp_plan_id, plan.
export const NEGOCIO_CAMPOS_PUBLICOS =
  'id, nombre, slug, color, logo_url, pesos_por_punto, puntos_por_tramo, puntos_bienvenida, puntos_cumpleanos, puntos_referido_emisor, puntos_referido_receptor'

/**
 * Valida el PIN de caja de un negocio (o de una sucursal, que puede
 * tener PIN propio). Devuelve { negocio, sucursal } si el PIN es
 * correcto, o { error, status } si no.
 */
export async function validarPinCaja(supabaseAdmin, { negocioId, slug, sucursalId, sucursalSlug, pin }) {
  if (!pin) return { error: 'PIN requerido', status: 401 }

  let query = supabaseAdmin
    .from('negocios')
    .select('id, nombre, slug, color, plan, pin_caja, pesos_por_punto, puntos_por_tramo, puntos_bienvenida')
  query = negocioId ? query.eq('id', negocioId) : query.eq('slug', slug)
  const { data: negocio } = await query.single()
  if (!negocio) return { error: 'Negocio no encontrado', status: 404 }

  let sucursal = null
  if (sucursalId || sucursalSlug) {
    let q = supabaseAdmin
      .from('sucursales')
      .select('id, nombre, slug, pin_caja')
      .eq('negocio_id', negocio.id)
    q = sucursalId ? q.eq('id', sucursalId) : q.eq('slug', sucursalSlug)
    const { data } = await q.single()
    if (!data) return { error: 'Sucursal no encontrada', status: 404 }
    sucursal = data
  }

  const pinReal = sucursal?.pin_caja || negocio.pin_caja
  if (!pinReal || pin !== pinReal) return { error: 'PIN inválido', status: 401 }

  return { negocio, sucursal }
}

/** IP del request para rate limiting (best-effort en serverless). */
export function getRequestIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
