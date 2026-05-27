// Tests para validaciones de negocio críticas

function validarPassword(password) {
  if (!password) return 'La contraseña es obligatoria'
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  return null
}

function validarPin(pin, pinGuardado) {
  if (!pinGuardado) return 'PIN no configurado'
  if (pin !== pinGuardado) return 'PIN incorrecto'
  return null
}

const PINES_COMUNES = ['1234', '0000', '1111', '1212', '4321', '1122', '9999', '0123']

function validarPinSeguridad(pin, confirmar) {
  if (!pin) return 'El PIN es obligatorio'
  if (pin.length < 4) return 'El PIN debe tener al menos 4 caracteres'
  if (PINES_COMUNES.includes(pin)) return 'Ese PIN es muy común'
  if (confirmar !== undefined && pin !== confirmar) return 'Los PINs no coinciden'
  return null
}

describe('Validación de contraseña', () => {
  test('acepta contraseña de 8 caracteres', () => {
    expect(validarPassword('12345678')).toBeNull()
  })

  test('acepta contraseña larga', () => {
    expect(validarPassword('miContraseñaSegura2025')).toBeNull()
  })

  test('rechaza contraseña de 7 caracteres', () => {
    expect(validarPassword('1234567')).not.toBeNull()
  })

  test('rechaza contraseña vacía', () => {
    expect(validarPassword('')).not.toBeNull()
  })

  test('rechaza contraseña null', () => {
    expect(validarPassword(null)).not.toBeNull()
  })
})

describe('Validación de PIN en caja', () => {
  test('acepta PIN correcto', () => {
    expect(validarPin('abc123', 'abc123')).toBeNull()
  })

  test('rechaza PIN incorrecto', () => {
    expect(validarPin('wrong', 'abc123')).not.toBeNull()
  })

  test('rechaza si no hay PIN configurado', () => {
    expect(validarPin('1234', null)).not.toBeNull()
  })

  test('rechaza si PIN guardado es string vacío', () => {
    expect(validarPin('1234', '')).not.toBeNull()
  })
})

describe('Validación de PIN al configurar', () => {
  test('acepta PIN alfanumérico seguro', () => {
    expect(validarPinSeguridad('abc9', 'abc9')).toBeNull()
  })

  test('rechaza PIN menor a 4 caracteres', () => {
    expect(validarPinSeguridad('ab', 'ab')).not.toBeNull()
  })

  test('rechaza PIN 1234', () => {
    expect(validarPinSeguridad('1234', '1234')).not.toBeNull()
  })

  test('rechaza si los PINs no coinciden', () => {
    expect(validarPinSeguridad('abc123', 'abc456')).not.toBeNull()
  })

  test('rechaza PIN vacío', () => {
    expect(validarPinSeguridad('', '')).not.toBeNull()
  })
})
