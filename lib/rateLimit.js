const attempts = new Map()

/**
 * Rate limiter in-memory simple.
 * @param {string} key - clave única (ej: "login:IP", "forgot:email")
 * @param {number} maxAttempts - intentos máximos en la ventana
 * @param {number} windowMs - ventana en milisegundos
 * @returns {{ ok: boolean, remaining: number }}
 */
export function rateLimit({ key, maxAttempts = 5, windowMs = 15 * 60 * 1000 }) {
  const now = Date.now()
  const record = attempts.get(key) || { count: 0, resetAt: now + windowMs }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + windowMs
  }

  record.count += 1
  attempts.set(key, record)

  // Limpiar entradas expiradas ocasionalmente
  if (Math.random() < 0.02) {
    for (const [k, v] of attempts) {
      if (now > v.resetAt) attempts.delete(k)
    }
  }

  return {
    ok: record.count <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.count),
  }
}
