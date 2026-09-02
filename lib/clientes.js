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

/**
 * Junta nombre y apellido en el único campo `nombre` que guarda la base.
 * Los formularios los piden por separado porque con un solo campo la
 * mitad cargaba el nombre de pila nomás y el negocio terminaba con tres
 * "Lucas" sin forma de distinguirlos. Abajo siguen siendo un solo texto,
 * así que todo lo que ya lee `nombre` (el saludo de WhatsApp, las
 * iniciales del avatar, el CSV) sigue andando igual.
 */
export function juntarNombre(nombre, apellido) {
  return [nombre, apellido].map(p => String(p || '').trim()).filter(Boolean).join(' ')
}

/**
 * La inversa, para precargar los dos campos con lo que ya está guardado.
 * Todo lo que viene después de la primera palabra cuenta como apellido
 * ("Juan Carlos Pérez" -> "Juan" + "Carlos Pérez"): con un apellido
 * compuesto acierta, y con un nombre compuesto el cliente lo corrige a
 * mano, que es el caso menos malo de los dos.
 */
export function partirNombre(completo) {
  const partes = String(completo || '').trim().split(/\s+/).filter(Boolean)
  return { nombre: partes[0] || '', apellido: partes.slice(1).join(' ') }
}
