// Tests del buscador de clientes del dashboard.
//
// Copia de lib/clientes.js: los tests de este proyecto no importan de
// lib (jest corre sin transformar ESM), así que la función se replica
// acá igual que en validaciones.test.js. Si cambia una, cambiar la otra.

function coincideBusqueda(cliente, termino) {
  const t = String(termino || '').trim().toLowerCase()
  if (!t) return true
  if (!cliente) return false
  return [cliente.nombre, cliente.dni, cliente.telefono, cliente.email]
    .some(campo => campo != null && String(campo).toLowerCase().includes(t))
}

// El que se registra con Google llega sin DNI y sin teléfono: este es el
// cliente que hacía explotar la pantalla de clientes al escribir en el
// buscador.
const clienteDeGoogle = { nombre: 'Lucas Fernández', dni: null, telefono: null, email: 'lucas@gmail.com' }
const clienteCompleto = { nombre: 'Martina García', dni: '38452100', telefono: '1155551234', email: 'martina@gmail.com' }

describe('Buscador de clientes', () => {
  test('no explota con un cliente sin DNI ni teléfono', () => {
    expect(() => coincideBusqueda(clienteDeGoogle, 'mar')).not.toThrow()
    expect(coincideBusqueda(clienteDeGoogle, 'mar')).toBe(false)
  })

  test('encuentra por nombre', () => {
    expect(coincideBusqueda(clienteCompleto, 'martina')).toBe(true)
  })

  test('encuentra por DNI parcial', () => {
    expect(coincideBusqueda(clienteCompleto, '3845')).toBe(true)
  })

  test('encuentra por teléfono y por email', () => {
    expect(coincideBusqueda(clienteCompleto, '5555')).toBe(true)
    expect(coincideBusqueda(clienteCompleto, 'martina@gmail')).toBe(true)
  })

  test('al cliente de Google lo encuentra por email, que es lo único que tiene', () => {
    expect(coincideBusqueda(clienteDeGoogle, 'lucas@gmail.com')).toBe(true)
  })

  test('ignora mayúsculas y espacios de más', () => {
    expect(coincideBusqueda(clienteCompleto, '  MARTINA  ')).toBe(true)
  })

  test('sin término de búsqueda entran todos', () => {
    expect(coincideBusqueda(clienteDeGoogle, '')).toBe(true)
    expect(coincideBusqueda(clienteDeGoogle, '   ')).toBe(true)
  })

  test('no coincide con algo que no está en ningún campo', () => {
    expect(coincideBusqueda(clienteCompleto, 'zzz')).toBe(false)
  })

  test('el DNI guardado como número tampoco rompe', () => {
    expect(coincideBusqueda({ nombre: 'Ana', dni: 38452100 }, '3845')).toBe(true)
  })
})
