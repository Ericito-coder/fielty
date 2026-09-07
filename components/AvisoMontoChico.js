'use client'
import { theme } from '@/lib/theme'

/**
 * Aviso para la caja cuando el monto tipeado no llega a sumar ni 1 punto
 * con la regla del negocio.
 *
 * Sin esto el botón de acreditar queda apagado y no hay forma de saber
 * por qué: el empleado ve "+0 puntos" y un botón que no responde. Le dice
 * el monto exacto desde el que sí suma, que es lo único accionable.
 *
 * Va en las dos cajas (la del negocio y la de sucursal), que son casi el
 * mismo archivo duplicado — de ahí que sea un componente y no cuatro
 * copias del mismo div.
 */
export default function AvisoMontoChico({ monto, montoMinimo }) {
  const valor = parseInt(monto)
  if (!valor) return null

  return (
    <div role="status" style={{
      background:'#2a1f00', border:'1px solid #4a3800', borderRadius:12,
      padding:'10px 14px', marginBottom:12, fontSize:13,
      color:theme.gold, lineHeight:1.5,
    }}>
      Con ${valor.toLocaleString('es-AR')} no suma ningún punto.
      {' '}Desde <strong>${montoMinimo.toLocaleString('es-AR')}</strong> sí.
    </div>
  )
}
