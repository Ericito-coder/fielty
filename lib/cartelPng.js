// Genera el cartel del QR como PNG para descargar o compartir.
//
// El cartel se puede mandar a imprimir con window.print(), pero desde el
// celular eso es incómodo y queda atado a cómo cada navegador imprime los
// fondos (ver components/FondoImpreso). Un PNG se guarda en el teléfono, se
// manda por WhatsApp o se lleva a una imprenta, que es lo que un dueño
// termina haciendo.
//
// El cartel se vuelve a dibujar acá a mano sobre un canvas en vez de
// rasterizar el DOM: pasar HTML a imagen requiere un SVG con <foreignObject>,
// que es justamente lo que peor anda en Safari de iOS, que es el caso que
// queremos cubrir. La contra es que este dibujo y el JSX de las páginas
// /qr son dos copias del mismo diseño: si se toca uno hay que tocar el otro.

const ANCHO = 440   // mismo ancho que el cartel en pantalla
const PAD = 28      // padding lateral del contenido

// next/font genera un nombre de familia propio (__Geist_xxxx) que solo se
// puede leer del DOM. Si el canvas no lo puede parsear, ctx.font ignora la
// asignación y quedaría todo en la fuente por defecto, así que lo probamos
// antes y si no, volvemos a la stack del CSS.
function familiaTipografica() {
  const familia = getComputedStyle(document.body).fontFamily
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `900 22px ${familia}`
  return ctx.font.includes('22px') ? familia : 'Arial, Helvetica, sans-serif'
}

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function rectRedondeado(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.fill()
}

function circulo(ctx, cx, cy, r, color, brillo = 0) {
  ctx.save()
  if (brillo) { ctx.shadowColor = color; ctx.shadowBlur = brillo }
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function texto(ctx, str, x, y, { tamano, peso = 400, color = '#000', align = 'center', familia }) {
  ctx.font = `${peso} ${tamano}px ${familia}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ctx.fillText(str, x, y)
}

// Igual que texto() pero centrado verticalmente sobre `cy`, para lo que va
// dentro de un círculo o alineado con un punto.
function textoCentrado(ctx, str, x, cy, { tamano, peso = 400, color = '#000', align = 'center', familia }) {
  ctx.font = `${peso} ${tamano}px ${familia}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(str, x, cy)
}

function partirEnLineas(ctx, str, anchoMax) {
  const lineas = []
  let actual = ''
  for (const palabra of str.split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (actual && ctx.measureText(prueba).width > anchoMax) {
      lineas.push(actual)
      actual = palabra
    } else {
      actual = prueba
    }
  }
  if (actual) lineas.push(actual)
  return lineas
}

// Dibuja el cartel entero y devuelve el alto que ocupó. Se corre dos veces:
// una para medir (sobre un canvas descartable) y otra para dibujar de verdad,
// así el layout vive en un solo lugar.
function dibujar(ctx, spec, familia, qr) {
  const { header, headline, sub, pasos, flechas, beneficios } = spec
  let y = 0

  if (header.tipo === 'fielty') {
    const alto = 86
    ctx.fillStyle = header.color
    ctx.fillRect(0, 0, ANCHO, alto)
    ctx.font = `900 22px ${familia}`
    const anchoLogo = 10 + 10 + ctx.measureText('fielty').width
    const x0 = (ANCHO - anchoLogo) / 2
    circulo(ctx, x0 + 5, alto / 2, 5, '#e0001b', 8)
    textoCentrado(ctx, 'fielty', x0 + 20, alto / 2, { tamano: 22, peso: 900, color: '#fff', align: 'left', familia })
    y = alto
  } else {
    const alto = 177
    ctx.fillStyle = header.color
    ctx.fillRect(0, 0, ANCHO, alto)
    rectRedondeado(ctx, (ANCHO - 56) / 2, 32, 56, 56, 16, 'rgba(255,255,255,0.2)')
    textoCentrado(ctx, header.iniciales, ANCHO / 2, 60, { tamano: 20, peso: 900, color: '#fff', familia })
    texto(ctx, header.nombre, ANCHO / 2, 100, { tamano: 24, peso: 900, color: '#fff', familia })
    texto(ctx, header.subtitulo, ANCHO / 2, 133, { tamano: 13, color: 'rgba(255,255,255,0.75)', familia })
    y = alto
  }

  y += 32
  texto(ctx, headline, ANCHO / 2, y, { tamano: 26, peso: 900, color: '#0e0e0e', familia })
  y += 40

  for (const linea of sub) {
    texto(ctx, linea, ANCHO / 2, y, { tamano: 14, color: '#666', familia })
    y += 22
  }
  y += 28

  const altoQr = 232
  rectRedondeado(ctx, PAD, y, ANCHO - PAD * 2, altoQr, 20, '#f8f9fc')
  ctx.save()
  ctx.imageSmoothingEnabled = false   // el QR tiene que quedar con el borde duro
  ctx.drawImage(qr, (ANCHO - 200) / 2, y + 16, 200, 200)
  ctx.restore()
  y += altoQr + 28

  const anchoCol = (ANCHO - PAD * 2 - 32) / 3
  ctx.font = `600 11px ${familia}`
  const lineasPorPaso = pasos.map(p => partirEnLineas(ctx, p, anchoCol))
  pasos.forEach((_, i) => {
    const cx = PAD + i * (anchoCol + 16) + anchoCol / 2
    circulo(ctx, cx, y + 16, 16, header.color)
    textoCentrado(ctx, String(i + 1), cx, y + 16, { tamano: 14, peso: 800, color: '#fff', familia })
    lineasPorPaso[i].forEach((linea, j) => {
      texto(ctx, linea, cx, y + 38 + j * 14, { tamano: 11, peso: 600, color: '#666', familia })
    })
    if (flechas && i < pasos.length - 1) {
      textoCentrado(ctx, '→', PAD + (i + 1) * anchoCol + i * 16 + 8, y + 16, { tamano: 18, color: '#ccc', familia })
    }
  })
  y += 38 + Math.max(...lineasPorPaso.map(l => l.length)) * 14

  if (beneficios?.length) {
    y += 24
    const alto = 32 + beneficios.length * 17 + (beneficios.length - 1) * 10
    rectRedondeado(ctx, PAD, y, ANCHO - PAD * 2, alto, 16, '#f8f9fc')
    beneficios.forEach((b, i) => {
      texto(ctx, b, PAD + 20, y + 16 + i * 27, { tamano: 13, peso: 500, color: '#555', align: 'left', familia })
    })
    y += alto
  }
  y += 28

  ctx.font = `600 12px ${familia}`
  const anchoPie = 8 + 6 + ctx.measureText('Powered by fielty').width
  const xPie = (ANCHO - anchoPie) / 2
  circulo(ctx, xPie + 4, y + 8, 4, '#e0001b', 6)
  textoCentrado(ctx, 'Powered by fielty', xPie + 14, y + 8, { tamano: 12, peso: 600, color: '#aaa', align: 'left', familia })

  return y + 16 + 32
}

// `escala` 4 deja el cartel en ~1760px de ancho: impreso a 11cm da más de
// 300 dpi, que es lo que pide cualquier imprenta.
export async function generarCartelPng(spec, escala = 4) {
  const familia = familiaTipografica()
  if (document.fonts?.ready) await document.fonts.ready
  const qr = await cargarImagen(spec.qr)

  const medidor = document.createElement('canvas').getContext('2d')
  const alto = dibujar(medidor, spec, familia, qr)

  const canvas = document.createElement('canvas')
  canvas.width = ANCHO * escala
  canvas.height = alto * escala
  const ctx = canvas.getContext('2d')
  ctx.scale(escala, escala)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, ANCHO, alto)
  dibujar(ctx, spec, familia, qr)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

// En el celular conviene la hoja de compartir: deja guardar el cartel en
// Fotos, mandarlo por WhatsApp o imprimirlo, todo desde el mismo menú. En
// escritorio se espera una descarga común.
export async function descargarCartel(blob, nombre) {
  const archivo = new File([blob], nombre, { type: 'image/png' })
  if (navigator.canShare?.({ files: [archivo] }) && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ files: [archivo] })
      return
    } catch (e) {
      if (e.name === 'AbortError') return   // lo canceló el usuario
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revocar en el acto le corta la descarga a algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
