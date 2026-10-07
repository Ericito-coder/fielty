import { createClient } from '@supabase/supabase-js'
import { rateLimit, rateLimitPeek } from './rateLimit'
import { puedeSubirLogo } from './planes'

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

// Campos de `negocios` que se leen para armar una respuesta pública.
// Incluye `plan` porque el logo depende de él: el resultado SIEMPRE tiene
// que pasar por `negocioPublico()`, que lo saca antes de responder.
// Nunca incluir acá: pin_caja, user_id, mp_plan_id.
export const NEGOCIO_CAMPOS_PUBLICOS =
  'id, nombre, slug, color, logo_url, plan, pesos_por_punto, puntos_por_tramo, puntos_bienvenida, puntos_cumpleanos, puntos_referido_emisor, puntos_referido_receptor, vencimiento_meses'

/**
 * Deja el negocio listo para el navegador: saca `plan` y apaga el logo si
 * el negocio no lo tiene pago.
 *
 * El logo propio es feature de pago, pero gatearlo solo al subirlo no
 * alcanza: un negocio que pagó un mes, subió su logo y volvió al plan
 * gratis conservaba su marca en la tarjeta y en el pase de Wallet. Se
 * resuelve en el servidor — si el `logo_url` viajara igual, esconderlo en
 * el front no serviría de nada.
 */
export function negocioPublico(negocio) {
  if (!negocio) return negocio
  const { plan, ...resto } = negocio
  return { ...resto, logo_url: puedeSubirLogo(plan) ? negocio.logo_url : null }
}

/**
 * Valida el PIN de caja de un negocio (o de una sucursal, que puede
 * tener PIN propio). Devuelve { negocio, sucursal } si el PIN es
 * correcto, o { error, status } si no.
 *
 * Rate-limitado por IP acá adentro (no en cada ruta) para que
 * ningún endpoint que reciba un PIN quede sin protección contra
 * fuerza bruta. Solo cuentan los intentos FALLIDOS: la caja manda el
 * PIN correcto en cada acción (buscar, acreditar, validar canje...)
 * y el uso normal de un turno supera cualquier presupuesto razonable
 * de intentos totales.
 */
export async function validarPinCaja(supabaseAdmin, { negocioId, slug, sucursalId, sucursalSlug, pin, ip }) {
  if (!pin) return { error: 'PIN requerido', status: 401 }

  const failKey = `pin-fail:${ip || 'unknown'}`
  const { ok: sinBloqueo } = await rateLimitPeek({ key: failKey, maxAttempts: 10 })
  if (!sinBloqueo) return { error: 'Demasiados intentos fallidos. Esperá 15 minutos.', status: 429 }

  let query = supabaseAdmin
    .from('negocios')
    .select('id, nombre, slug, color, plan, pin_caja, pesos_por_punto, puntos_por_tramo, puntos_bienvenida, created_at')
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
  if (!pinReal || pin !== pinReal) {
    await rateLimit({ key: failKey, maxAttempts: 10, windowMs: 15 * 60 * 1000 })
    return { error: 'PIN inválido', status: 401 }
  }

  return { negocio, sucursal }
}

// El nivel de la sesión viaja dentro del token: aal1 es haber entrado con
// contraseña o con Google, aal2 es además haber pasado el segundo paso.
function nivelDeSesion(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).aal
  } catch {
    return null
  }
}

/**
 * Confirma que el pedido viene del admin. Devuelve { user } si pasa, o
 * { error, status } si no. Pide tres cosas: una sesión válida, que sea la
 * cuenta de ADMIN_EMAIL y que esa sesión haya pasado la verificación en dos
 * pasos.
 *
 * Sin el segundo paso contesta 403 con `mfa: true` en vez de 401: el panel
 * lo usa para pedir el código (o configurar la app de autenticación la
 * primera vez) en lugar de tratarlo como una cuenta cualquiera. Ese 403 solo
 * lo ve quien ya entró con la cuenta del admin.
 *
 * Si falta ADMIN_EMAIL no pasa nadie: con un token inválido `user` es null,
 * y comparar dos undefined daba por bueno cualquier pedido.
 */
export async function verificarAdmin(supabaseAdmin, request) {
  const { ok } = await rateLimit({ key: `admin-auth:${getRequestIp(request)}`, maxAttempts: 30, windowMs: 15 * 60 * 1000 })
  if (!ok) return { error: 'Demasiados intentos. Esperá un momento.', status: 429 }

  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return { error: 'No autorizado', status: 401 }

  const adminEmail = process.env.ADMIN_EMAIL
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!adminEmail || user?.email !== adminEmail) return { error: 'No autorizado', status: 401 }

  // getUser ya validó el token contra Supabase, así que lo que dice adentro
  // es de fiar.
  if (nivelDeSesion(token) !== 'aal2') {
    return { error: 'Falta la verificación en dos pasos', status: 403, mfa: true }
  }

  return { user }
}

/** IP del request para rate limiting (best-effort en serverless). */
export function getRequestIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
