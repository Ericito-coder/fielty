/**
 * Código corto y legible del cliente (FLT-6A1DE). Es lo que se muestra
 * en la tarjeta, debajo del QR y como "ID de miembro" del pase de
 * Wallet: tiene que ser el mismo en los tres lados o el empleado y el
 * cliente terminan mirando identificadores distintos.
 */
export function codigoCliente(id) {
  return `FLT-${String(id).slice(0, 5).toUpperCase()}`
}

/**
 * Etiqueta con la que la caja identifica a un cliente en pantalla.
 * Los clientes que se registran con Google no cargan DNI, así que se
 * cae al WhatsApp y, si tampoco lo tiene, al email.
 */
export function identidadCliente(cliente) {
  if (!cliente) return ''
  if (cliente.dni) return `DNI ${cliente.dni}`
  if (cliente.telefono) return cliente.telefono
  if (cliente.email) return cliente.email
  return 'Sin datos de contacto'
}
