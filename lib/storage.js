/**
 * Wrapper seguro de localStorage que no rompe en modo incógnito
 * ni en entornos donde localStorage está bloqueado.
 */
export const storage = {
  get(key) {
    try { return localStorage.getItem(key) } catch { return null }
  },
  set(key, value) {
    try { localStorage.setItem(key, value) } catch { /* silencioso */ }
  },
  remove(key) {
    try { localStorage.removeItem(key) } catch { /* silencioso */ }
  },
}
