import { storage } from './storage'

/**
 * De dónde vino el dueño la primera vez que entró a fielty.app.
 *
 * GA lo sabe, pero por sesión y mezclado con el tráfico de los clientes
 * finales: para saber qué canal trae negocios hubo que cruzar a mano las
 * páginas de QR abiertas desde ChatGPT contra la tabla de negocios. Con
 * esto cada negocio queda en la base con su origen puesto.
 *
 * Se guarda el primer toque y no el último: la pregunta es cómo nos
 * conoció, no por dónde entró el día que se registró (que muchas veces
 * es escribir fielty.app o buscar "fielty" en Google). La excepción es un
 * primer toque directo, que no dice nada: si después llega desde una
 * fuente real, esa lo reemplaza.
 */
const CLAVE = 'fielty_origen'

// Pasar de una página del sitio a otra no es un toque nuevo.
const PROPIOS = /(^|\.)fielty\.app$|^localhost$|\.vercel\.app$/

// Hosts por los que el usuario pasa en medio de un flujo nuestro (login
// con Google, checkout de Mercado Pago). Si volviera de ahí sin origen
// previo, quedaría anotado como que nos encontró en Google.
const DE_PASO = /^accounts\.google\.|(^|\.)mercadopago\.|(^|\.)mercadolibre\./

// utm_source abreviados que usan las redes de Meta.
const ALIAS = { ig: 'instagram', fb: 'facebook' }

function normalizar(fuente) {
  const f = fuente.toLowerCase().replace(/^(www|l|lm|m)\./, '')
  if (ALIAS[f]) return ALIAS[f]
  if (/(^|\.)google\./.test(f)) return 'google'
  if (/(^|\.)bing\.com$/.test(f)) return 'bing'
  if (/(^|\.)(chatgpt\.com|chat\.openai\.com)$/.test(f)) return 'chatgpt.com'
  if (/(^|\.)perplexity\.ai$/.test(f)) return 'perplexity'
  if (/(^|\.)instagram\.com$/.test(f)) return 'instagram'
  if (/(^|\.)facebook\.com$/.test(f)) return 'facebook'
  return f
}

export function leerOrigen() {
  try { return JSON.parse(storage.get(CLAVE)) } catch { return null }
}

export function capturarOrigen() {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  let referrer = null
  try { referrer = document.referrer ? new URL(document.referrer).hostname : null } catch { /* referrer ilegible */ }

  const utm = params.get('utm_source')
  if (!utm && referrer && (PROPIOS.test(referrer) || DE_PASO.test(referrer))) return

  const fuente = utm ? normalizar(utm) : referrer ? normalizar(referrer) : 'direct'

  const previo = leerOrigen()
  if (previo && !(previo.fuente === 'direct' && fuente !== 'direct')) return

  const origen = { fuente, landing: window.location.pathname, fecha: new Date().toISOString() }
  if (params.get('utm_medium')) origen.medio = params.get('utm_medium')
  if (params.get('utm_campaign')) origen.campana = params.get('utm_campaign')
  if (referrer) origen.referrer = referrer

  storage.set(CLAVE, JSON.stringify(origen))
}
