import { Resend } from 'resend'

// Cliente de Resend compartido. Se crea perezosamente porque el
// constructor tira si no hay API key, y en desarrollo/preview la
// variable no está seteada a propósito (no queremos mandar mails de
// verdad desde ahí). Sin key, enviarEmail es un no-op silencioso.
let cliente = null

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  if (!cliente) cliente = new Resend(process.env.RESEND_API_KEY)
  return cliente
}

/**
 * Envía un email. Nunca lanza: los envíos son secundarios al flujo
 * que los dispara (registro, canje, aviso de límite...) y no deben
 * hacer fallar la request.
 *
 * @returns {Promise<boolean>} true si Resend aceptó el envío. Aceptado no
 * quiere decir entregado: un rebote se entera después, por webhook.
 */
export async function enviarEmail(opciones) {
  const resend = getResend()
  if (!resend) return false
  try {
    // Resend no lanza cuando rechaza un envío (tope diario, demasiados
    // pedidos por segundo, destinatario inválido): devuelve { error }. Sin
    // mirarlo, todos esos rechazos se contaban como enviados, por ejemplo
    // en el total de una campaña.
    const { error } = await resend.emails.send(opciones)
    if (error) {
      console.error('enviarEmail rechazado:', error.name, error.message)
      return false
    }
    return true
  } catch (error) {
    console.error('enviarEmail error:', error)
    return false
  }
}
