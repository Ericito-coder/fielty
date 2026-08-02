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
}
