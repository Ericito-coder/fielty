// Tests para la carga de los primeros clientes al terminar el alta.
//
// Copia de prepararPrimerosClientes de lib/clientes.js: los tests de este
// proyecto no importan de lib (jest corre sin transformar ESM), así que la
// función se replica acá igual que en busqueda-clientes.test.js. Si cambia
// una, cambiar la otra.

function prepararPrimerosClientes(filas, max = 5) {
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

describe('Primeros clientes del alta', () => {
  test('acepta dos clientes con nombre y WhatsApp', () => {
    const { clientes, error } = prepararPrimerosClientes([
      { nombre: 'Martina García', telefono: '11 5555-1234' },
      { nombre: 'Lucas Pérez', telefono: '+54 9 351 555 0000' },
    ])
    expect(error).toBeUndefined()
    expect(clientes).toHaveLength(2)
  })

  test('recorta los espacios de las puntas', () => {
    const { clientes } = prepararPrimerosClientes([{ nombre: '  Martina  ', telefono: ' 1155551234 ' }])
    expect(clientes).toEqual([{ nombre: 'Martina', telefono: '1155551234' }])
  })

  test('con una sola fila completa alcanza: la vacía se ignora', () => {
    // El formulario muestra dos filas. Exigir las dos dejaba afuera al
    // que en ese momento solo se acuerda de un teléfono.
    const { clientes, error } = prepararPrimerosClientes([
      { nombre: 'Martina', telefono: '1155551234' },
      { nombre: '', telefono: '' },
    ])
    expect(error).toBeUndefined()
    expect(clientes).toHaveLength(1)
  })

  test('todo vacío pide al menos uno', () => {
    expect(prepararPrimerosClientes([{ nombre: '', telefono: '' }, { nombre: ' ', telefono: '' }]).error).toMatch(/al menos un cliente/)
    expect(prepararPrimerosClientes([]).error).toMatch(/al menos un cliente/)
  })

  test('una fila a medias no pasa en silencio', () => {
    // Si se ignorara como la vacía, el dueño cargaría un nombre, tocaría
    // el botón y ese cliente desaparecería sin aviso.
    expect(prepararPrimerosClientes([{ nombre: 'Martina', telefono: '' }]).error).toBe('Falta el WhatsApp de Martina.')
    expect(prepararPrimerosClientes([{ nombre: '', telefono: '1155551234' }]).error).toMatch(/Falta el nombre/)
  })

  test('rechaza un WhatsApp que no puede ser un teléfono', () => {
    expect(prepararPrimerosClientes([{ nombre: 'Martina', telefono: '5551234' }]).error).toMatch(/Revisá el WhatsApp de Martina/)
    expect(prepararPrimerosClientes([{ nombre: 'Martina', telefono: 'no tengo' }]).error).toMatch(/Revisá el WhatsApp/)
    expect(prepararPrimerosClientes([{ nombre: 'Martina', telefono: '1234567890123456' }]).error).toMatch(/Revisá el WhatsApp/)
  })

  test('el mismo número escrito distinto cuenta como repetido', () => {
    const { error } = prepararPrimerosClientes([
      { nombre: 'Martina', telefono: '11 5555-1234' },
      { nombre: 'Lucas', telefono: '1155551234' },
    ])
    expect(error).toBe('Cargaste dos veces el mismo WhatsApp.')
  })

  test('no deja pasar más del tope por pedido', () => {
    const muchos = Array.from({ length: 6 }, (_, i) => ({ nombre: `Cliente ${i}`, telefono: `115555000${i}` }))
    expect(prepararPrimerosClientes(muchos).error).toMatch(/hasta 5 clientes/)
  })

  test('no se rompe con algo que no es una lista', () => {
    // El cuerpo del pedido lo arma el navegador: puede llegar cualquier cosa.
    expect(prepararPrimerosClientes(null).error).toMatch(/al menos un cliente/)
    expect(prepararPrimerosClientes('hola').error).toMatch(/al menos un cliente/)
    expect(prepararPrimerosClientes([null, 7]).error).toMatch(/al menos un cliente/)
  })
})
