/**
 * Reglas del PIN de caja. Compartidas entre el onboarding, la config del
 * negocio y la de cada sucursal, para que no se desincronicen.
 *
 * El PIN protege la caja, y la URL de la caja es pública: el slug lo
 * conoce cualquier cliente porque es el mismo del link de registro. Con
 * un PIN adivinable, cualquiera puede acreditarse puntos, validar canjes
 * y ver el listado de clientes.
 */

export const PINES_COMUNES = [
  '1234', '0000', '1111', '1212', '4321', '1122', '9999',
  '0123', '2222', '3333', '4444', '5555', '6666', '7777', '8888',
]

export function validarPin(pin, confirmar) {
  if (!pin) return 'El PIN es obligatorio'
  if (pin.length < 4) return 'El PIN debe tener al menos 4 caracteres'
  if (PINES_COMUNES.includes(pin)) return 'Ese PIN es muy común. Elegí uno más seguro'
  if (confirmar !== undefined && pin !== confirmar) return 'Los PINs no coinciden'
  return null
}
