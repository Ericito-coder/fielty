// Paleta de colores compartida. Antes cada página repetía estos hex a
// mano en su propio objeto de estilos, lo que hacía fácil que un gris o
// un rojo se fueran desalineando de página a página sin que nadie lo
// notara. Esto no es un sistema de componentes — cada página sigue
// definiendo sus propios estilos, solo referencian estas constantes en
// vez de repetir el valor.
export const theme = {
  red: '#e0001b',       // marca / CTA principal / error
  black: '#0e0e0e',      // texto principal y fondos oscuros
  gray: '#666',         // texto secundario / mudo
  grayLight: '#aaa',     // texto terciario, ayudas chicas
  grayMid: '#555',       // variante de texto mudo un poco más oscura
  green: '#00b96b',      // éxito / confirmación
  gold: '#f0a500',       // aviso / plan Business
  blue: '#0e76fd',       // acento secundario (también el color del anillo de foco)
  purple: '#7c3aed',     // swatch de color preset
  bgMuted: '#f0f2f7',    // fondo gris claro (botones de filtro, tarjetas)
  bgMuted2: '#f5f6fa',   // variante de fondo gris claro — parecido a bgMuted
                         // pero no idéntico; se dejan separados a propósito
                         // para no cambiar ningún fondo existente
  errorBg: '#fff0f0',    // fondo de mensajes de error
  successBg: '#e8faf2',  // fondo de mensajes de éxito

  // --- Superficie oscura (todo /app/(marketing), que va sobre theme.black) ---
  // Los grises de arriba están calibrados para fondo claro: sobre el negro del
  // landing, #555 da 2.3:1 y #333 da 1.5:1 — abajo del mínimo legible (4.5:1).
  // Estos tres son los únicos grises que se usan sobre fondo oscuro.
  darkText: '#a3a3a3',   // cuerpo y párrafos sobre negro (7.7:1)
  darkMuted: '#8a8a8a',  // labels, legales, links de footer, numeración (5.6:1)
  redOnDark: '#ff3b4d',  // el rojo de marca SOLO como texto sobre negro (5.5:1).
                         // Como fondo de botón sigue yendo theme.red, que con
                         // texto blanco ya da 5:1.
}
