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
 * ¿El email tiene forma de email? No alcanza con el `type="email"` del
 * formulario: ese chequeo no corre cuando el botón manda los datos por
 * JavaScript, y además acepta "nombre@gmail" sin el ".com". Así se
 * colaron clientes que después no reciben ningún mail (Resend los
 * rechaza) ni pueden recuperar la contraseña.
 */
export function emailValido(email) {
  return /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(String(email || '').trim())
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
 * ¿Este cliente coincide con lo que se escribió en el buscador? Busca
 * por nombre, DNI, teléfono y email — los cuatro, porque el que se
 * registra con Google no carga DNI y sin esto no había forma de
 * encontrarlo.
 *
 * Todos los campos pasan por String() a propósito: el DNI es opcional
 * desde hace rato y un `cliente.dni.includes(...)` sobre un null tiraba
 * TypeError con la primera tecla, que en el dashboard se llevaba puesta
 * la pantalla entera de clientes.
 */
export function coincideBusqueda(cliente, termino) {
  const t = String(termino || '').trim().toLowerCase()
  if (!t) return true
  if (!cliente) return false
  return [cliente.nombre, cliente.dni, cliente.telefono, cliente.email]
    .some(campo => campo != null && String(campo).toLowerCase().includes(t))
}

/**
 * Revisa las filas de "tus primeros clientes" que el dueño carga al
 * terminar el alta. Devuelve `{ clientes }` con nombre y WhatsApp limpios,
 * o `{ error }` con un mensaje para mostrarle.
 *
 * La usan la pantalla y la ruta, para que el dueño vea el mismo mensaje
 * sin esperar al servidor. Una fila totalmente vacía no es un error: el
 * formulario muestra dos y con una sola completa alcanza.
 *
 * El WhatsApp es obligatorio porque la tarjeta se le manda por ahí: un
 * cliente cargado sin teléfono queda en la lista sin que nadie le avise
 * que tiene puntos.
 */
export function prepararPrimerosClientes(filas, max = 5) {
  const clientes = []
  const vistos = new Set()

  for (const fila of Array.isArray(filas) ? filas : []) {
    const nombre = String(fila?.nombre || '').trim()
    const telefono = String(fila?.telefono || '').trim()
    if (!nombre && !telefono) continue
    if (!nombre) return { error: 'Falta el nombre de uno de los clientes.' }
    if (!telefono) return { error: `Falta el WhatsApp de ${nombre}.` }

    const digitos = telefono.replace(/\D/g, '')
    if (digitos.length < 8 || digitos.length > 15) {
      return { error: `Revisá el WhatsApp de ${nombre}. Tiene que ir con el código de área, por ejemplo 11 5555-1234.` }
    }
    if (vistos.has(digitos)) return { error: 'Cargaste dos veces el mismo WhatsApp.' }
    vistos.add(digitos)

    clientes.push({ nombre, telefono })
  }

  if (!clientes.length) return { error: 'Cargá al menos un cliente, con su nombre y su WhatsApp.' }
  if (clientes.length > max) return { error: `Podés cargar hasta ${max} clientes por vez.` }
  return { clientes }
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
