// Tests para el sistema de niveles de lealtad

function getNivel(puntosHistoricos) {
  if (puntosHistoricos >= 5000) return 'Oro'
  if (puntosHistoricos >= 1000) return 'Plata'
  return 'Bronce'
}

describe('Niveles de lealtad', () => {
  test('Bronce con 0 puntos', () => {
    expect(getNivel(0)).toBe('Bronce')
  })

  test('Bronce con 999 puntos', () => {
    expect(getNivel(999)).toBe('Bronce')
  })

  test('Plata exacto con 1000 puntos', () => {
    expect(getNivel(1000)).toBe('Plata')
  })

  test('Plata con 4999 puntos', () => {
    expect(getNivel(4999)).toBe('Plata')
  })

  test('Oro exacto con 5000 puntos', () => {
    expect(getNivel(5000)).toBe('Oro')
  })

  test('Oro con muchos puntos', () => {
    expect(getNivel(99999)).toBe('Oro')
  })
})
