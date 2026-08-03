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
