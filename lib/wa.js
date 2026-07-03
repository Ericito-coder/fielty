/**
 * Arma un link wa.me con el mensaje precargado. Normaliza números
 * argentinos al formato internacional de WhatsApp (549 + área + número).
 * Devuelve null si no hay teléfono.
 */
export function linkWhatsApp(telefono, texto) {
  if (!telefono) return null
  let d = String(telefono).replace(/\D/g, '')
  if (!d) return null
  if (d.startsWith('0')) d = d.slice(1)
  if (d.startsWith('549')) {
    // ya está completo
  } else if (d.startsWith('54')) {
    d = '549' + d.slice(2)
  } else {
    d = '549' + d
  }
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`
}
