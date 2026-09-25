/**
 * La regla de puntos del negocio, en un solo lugar.
 *
 * La cuenta estaba copiada en tres lados (la caja, la caja por sucursal
 * y la ruta que acredita) y tenían que dar exactamente lo mismo: si la
 * caja le muestra "+1" al empleado y el servidor calcula 0, el cliente
 * termina con una compra registrada que no le sumó nada.
 */

/**
 * Cuántos puntos suma una compra con la regla "cada $pesosPorPunto
 * gastados → puntosPorTramo puntos".
 *
 * Redondea al más cercano y no hacia abajo: con la regla de $1.000 por
 * punto, una compra de $500 suma 1 punto en vez de ninguno. Es el
 * comportamiento que ya venía corriendo en producción.
 *
 * Multiplica antes de dividir a propósito. `monto / ppp * ptp` da lo
 * mismo en matemática pero no siempre en punto flotante, y donde falla
 * es justo en los montos que caen exactamente en la mitad — que son los
 * que deciden si la compra suma 1 punto o ninguno, o sea los que le dan
 * sentido a `montoMinimoParaUnPunto`.
 */
export function calcularPuntos(monto, pesosPorPunto, puntosPorTramo) {
  const ppp = pesosPorPunto || 100
  const ptp = puntosPorTramo || 1
  return Math.round(monto * ptp / ppp)
}

/**
 * La compra más chica que suma aunque sea 1 punto con esta regla.
 *
 * Sale de despejar `monto * ptp / ppp >= 0.5`, o sea `monto >= ppp / (2*ptp)`.
 * Se calcula como división entera con el numerador corrido, en vez de
 * `Math.ceil(ppp / (2 * ptp))`, para que no dependa del punto flotante:
 * este número es el que la caja le muestra al empleado como "desde $X",
 * así que tiene que ser exactamente un monto que sí acredite.
 */
export function montoMinimoParaUnPunto(pesosPorPunto, puntosPorTramo) {
  const ppp = pesosPorPunto || 100
  const ptp = puntosPorTramo || 1
  const divisor = 2 * ptp
  return Math.max(1, Math.floor((ppp + divisor - 1) / divisor))
}

/**
 * Si un movimiento del historial le saca puntos al cliente (se muestra en
 * rojo y con "-"). Todo lo demás — compras, cumpleaños, referidos,
 * devoluciones de canjes — suma.
 */
export function restaPuntos(tipo) {
  return tipo === 'canje' || tipo === 'vencimiento'
}
