import { createClient } from '@supabase/supabase-js'

const attempts = new Map()

/**
 * Rate limiter para rutas API. Usa fn_rate_limit en Postgres
 * (funciona en serverless, donde cada instancia tiene su propia
 * memoria); si la función todavía no existe o falla, cae al
 * limiter en memoria como best-effort.
 *
 * @param {string} key - clave única (ej: "login:IP", "forgot:email")
 * @param {number} maxAttempts - intentos máximos en la ventana
 * @param {number} windowMs - ventana en milisegundos
 * @returns {Promise<{ ok: boolean }>}
 */
export async function rateLimit({ key, maxAttempts = 5, windowMs = 15 * 60 * 1000 }) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { data: permitido, error } = await supabaseAdmin.rpc('fn_rate_limit', {
      p_key: key,
      p_max: maxAttempts,
      p_window_seconds: Math.ceil(windowMs / 1000),
    })
    if (!error && typeof permitido === 'boolean') return { ok: permitido }
  } catch { /* fallback abajo */ }

  return rateLimitMemoria({ key, maxAttempts, windowMs })
}

function rateLimitMemoria({ key, maxAttempts, windowMs }) {
  const now = Date.now()
  const record = attempts.get(key) || { count: 0, resetAt: now + windowMs }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + windowMs
  }

  record.count += 1
  attempts.set(key, record)

  if (Math.random() < 0.02) {
    for (const [k, v] of attempts) {
      if (now > v.resetAt) attempts.delete(k)
    }
  }

  return { ok: record.count <= maxAttempts }
}
