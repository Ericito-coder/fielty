// Bloque de color que sobrevive a la impresión.
//
// Los navegadores no pintan los `background` CSS al imprimir salvo que el
// usuario tilde "imprimir fondos". En el escritorio eso se arregla con
// `print-color-adjust: exact`, pero Safari de iOS lo ignora: el cartel del
// QR salía con el header en blanco, los círculos de los pasos vacíos y el
// texto blanco de arriba degradado a gris. Las imágenes, en cambio, se
// imprimen siempre tal cual — ningún navegador les saca el color.
//
// Así que los bloques de color del cartel se pintan con un <img> de un SVG
// de color sólido estirado sobre el bloque, en vez de con un
// background-color. El `background` se deja igual en los estilos como
// respaldo por si la imagen no cargara.
//
// Para usarlo: el contenedor tiene que ser `position:relative` y los hijos
// que van encima también. Los elementos posicionados se pintan en orden del
// DOM, así que el <img> (que va primero) queda debajo del contenido.

// SVG de 1x1 de un color sólido, listo para usar como `src`. Lleva viewBox
// y preserveAspectRatio="none" para que el rectángulo se estire al tamaño
// del <img> en vez de quedar de 1px en una esquina.
export function colorSolido(color, opacidad = 1) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"><rect width="1" height="1" fill="${color}" fill-opacity="${opacidad}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function FondoImpreso({ color, opacidad = 1, radio = 'inherit' }) {
  return (
    <img
      src={colorSolido(color, opacidad)}
      alt=""
      aria-hidden="true"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:radio }}
    />
  )
}
