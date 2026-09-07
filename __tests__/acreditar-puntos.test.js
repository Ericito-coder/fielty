// Tests para la lógica de acreditación de puntos.
//
// Copia de lib/puntos.js: los tests de este proyecto no importan de lib
// (jest corre sin transformar ESM), así que las funciones se replican
// acá igual que en validaciones.test.js y busqueda-clientes.test.js. Si
// cambia una, cambiar la otra.
//
// Ojo con esta copia en particular: la versión anterior de este archivo
// usaba Math.floor mientras producción usaba Math.round, y la diferencia
// pasó desapercibida justamente porque el test nunca tocaba el código
// real. Con la regla de $100 por punto, una compra de $150 sumaba 2
// puntos en producción y el test afirmaba que sumaba 1.

function calcularPuntos(monto, pesosPorPunto, puntosPorTramo) {
  const ppp = pesosPorPunto || 100
  const ptp = puntosPorTramo || 1
  return Math.round(monto * ptp / ppp)
}

function montoMinimoParaUnPunto(pesosPorPunto, puntosPorTramo) {
  const ppp = pesosPorPunto || 100
  const ptp = puntosPorTramo || 1
  const divisor = 2 * ptp
  return Math.max(1, Math.floor((ppp + divisor - 1) / divisor))
}

describe('Cálculo de puntos', () => {
  test('acredita puntos correctamente con configuración por defecto', () => {
    expect(calcularPuntos(1000, 100, 1)).toBe(10)
  })

  test('acredita puntos con ratio personalizado', () => {
    expect(calcularPuntos(2000, 200, 2)).toBe(20)
  })

  test('redondea al más cercano, no hacia abajo', () => {
    // $150 con $100 por punto = 1,5 → 2 puntos. Redondear hacia abajo
    // sería más barato para el negocio, pero el que ya viene corriendo
    // en producción es el redondeo al más cercano.
    expect(calcularPuntos(150, 100, 1)).toBe(2)
    expect(calcularPuntos(140, 100, 1)).toBe(1)
  })

  test('puntos múltiples por tramo', () => {
    expect(calcularPuntos(500, 100, 3)).toBe(15)
  })

  test('una compra demasiado chica para el tramo suma 0', () => {
    // El caso que rompía: con "cada $50.000 → 1 punto", una compra de
    // $100 no suma nada. Antes la caja igual la dejaba acreditar y
    // grababa una transacción en 0.
    expect(calcularPuntos(100, 50000, 1)).toBe(0)
    expect(calcularPuntos(40, 100, 1)).toBe(0)
  })

  test('cae a la regla por defecto si el negocio no tiene una cargada', () => {
    expect(calcularPuntos(1000, null, null)).toBe(10)
    expect(calcularPuntos(1000, 0, 0)).toBe(10)
  })
})

describe('Monto mínimo para sumar 1 punto', () => {
  test('es la mitad del tramo, redondeada para arriba', () => {
    expect(montoMinimoParaUnPunto(100, 1)).toBe(50)
    expect(montoMinimoParaUnPunto(1000, 1)).toBe(500)
    expect(montoMinimoParaUnPunto(50000, 1)).toBe(25000)
  })

  test('baja cuando el tramo da muchos puntos', () => {
    expect(montoMinimoParaUnPunto(13000, 20)).toBe(325)
    expect(montoMinimoParaUnPunto(10, 50)).toBe(1)
  })

  test('nunca es menor a $1', () => {
    expect(montoMinimoParaUnPunto(1, 1)).toBe(1)
    expect(montoMinimoParaUnPunto(1, 100)).toBe(1)
  })

  // Esta es la propiedad que tiene que valer siempre: el número que la
  // caja le muestra al empleado ("desde $X sí suma") tiene que ser
  // exactamente el primer monto que acredita. Un peso menos, 0 puntos.
  test('es exacto para todas las reglas que hay en producción', () => {
    const reglasReales = [
      [1000, 1], [100, 1], [100, 10], [1000, 10], [10, 1], [1, 1], [50000, 1],
      [10000, 1], [10000, 5], [500, 1], [10000, 500], [30000, 25], [10, 50],
      [10000, 750], [10000, 100], [13000, 20], [16000, 1], [15000, 10],
      [30000, 1], [2000, 4], [12000, 100], [100, 5], [12000, 2], [2000, 5],
      [1000, 5], [13000, 10], [10000, 20], [1000, 100], [300, 1], [60000, 20],
      [15, 2], [200, 50],
    ]

    for (const [ppp, ptp] of reglasReales) {
      const minimo = montoMinimoParaUnPunto(ppp, ptp)
      expect(calcularPuntos(minimo, ppp, ptp)).toBeGreaterThanOrEqual(1)
      if (minimo > 1) {
        expect(calcularPuntos(minimo - 1, ppp, ptp)).toBe(0)
      }
    }
  })
})

describe('Validación del monto en la caja', () => {
  // El piso fijo de $100 que había antes no miraba la regla del negocio:
  // dejaba pasar compras que acreditaban 0 puntos y, al mismo tiempo,
  // bloqueaba compras chicas que sí sumaban.
  function puedeAcreditar(monto, pesosPorPunto, puntosPorTramo) {
    const valor = parseInt(monto)
    if (!valor || valor < 1) return false
    return calcularPuntos(valor, pesosPorPunto, puntosPorTramo) >= 1
  }

  test('acepta un monto que suma al menos 1 punto', () => {
    expect(puedeAcreditar(500, 100, 1)).toBe(true)
    expect(puedeAcreditar(50, 100, 1)).toBe(true)
  })

  test('rechaza el monto que no llega a 1 punto, aunque supere los $100', () => {
    expect(puedeAcreditar(100, 50000, 1)).toBe(false)
    expect(puedeAcreditar(24999, 50000, 1)).toBe(false)
    expect(puedeAcreditar(25000, 50000, 1)).toBe(true)
  })

  test('acepta montos chicos que antes bloqueaba el piso de $100', () => {
    // Un kiosco con "cada $10 → 1 punto": una compra de $30 suma 3
    // puntos y antes no se podía cargar.
    expect(puedeAcreditar(30, 10, 1)).toBe(true)
  })

  test('rechaza cero, vacío y basura', () => {
    expect(puedeAcreditar(0, 100, 1)).toBe(false)
    expect(puedeAcreditar('', 100, 1)).toBe(false)
    expect(puedeAcreditar('abc', 100, 1)).toBe(false)
  })
})
