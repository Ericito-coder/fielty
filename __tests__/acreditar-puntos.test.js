// Tests para la lógica de acreditación de puntos

function calcularPuntos(monto, pesosPorPunto, puntosPorTramo) {
  return Math.floor(monto / pesosPorPunto) * puntosPorTramo
}

function validarMonto(monto) {
  const valor = parseInt(monto)
  return valor && valor >= 100
}

describe('Cálculo de puntos', () => {
  test('acredita puntos correctamente con configuración por defecto', () => {
    expect(calcularPuntos(1000, 100, 1)).toBe(10)
  })

  test('acredita puntos con ratio personalizado', () => {
    expect(calcularPuntos(2000, 200, 2)).toBe(20)
  })

  test('no acredita puntos si el monto es menor al tramo', () => {
    expect(calcularPuntos(50, 100, 1)).toBe(0)
  })

  test('trunca puntos (no redondea hacia arriba)', () => {
    // $150 con $100 por punto = 1 punto (no 2)
    expect(calcularPuntos(150, 100, 1)).toBe(1)
  })

  test('puntos múltiples por tramo', () => {
    // $500 con $100 por punto y 3 pts por tramo = 15 pts
    expect(calcularPuntos(500, 100, 3)).toBe(15)
  })
})

describe('Validación de monto', () => {
  test('acepta monto válido', () => {
    expect(validarMonto(500)).toBe(true)
  })

  test('rechaza monto menor a 100', () => {
    expect(validarMonto(99)).toBe(false)
  })

  test('rechaza monto cero', () => {
    expect(validarMonto(0)).toBeFalsy()
  })

  test('rechaza string vacío', () => {
    expect(validarMonto('')).toBeFalsy()
  })

  test('acepta monto exacto de 100', () => {
    expect(validarMonto(100)).toBe(true)
  })
})
