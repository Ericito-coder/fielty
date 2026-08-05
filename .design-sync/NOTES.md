# Notas de design-sync — Fielty

## Por que este sync es a mano y no con el converter

`/design-sync` compila una libreria de componentes (un `dist/` o un Storybook) y
la sube para que el agente de diseno arme pantallas con los componentes reales.
Fielty no es eso: es la app Next.js.

- `package.json` solo tiene `next dev/build/start`. No hay build de libreria, no
  hay `dist/`, no hay exports. El repo es `private: true`.
- No hay Storybook ni archivos `*.stories.*`.
- El unico componente compartido del repo es `components/GoogleSignInButton.js`.
- `app/globals.css` es el starter de Next + Tailwind v4 con una regla de
  `:focus-visible`. La maqueta real vive en estilos inline dentro de las paginas.

Por eso `shape` en `config.json` es `brand-foundations`, no `package` ni
`storybook`, y el bundle se genero a mano: tokens + primitivas + cards de
fundamentos. Si algun dia se extrae una libreria de componentes de verdad, este
sync se puede rehacer con el converter normal.

**No hay `_ds_sync.json`.** El envelope del sidecar pide campos propios de las
dos shapes del converter (`renderHashes`, `sourceKeys`, `scriptsSha`…) que aca no
significan nada. Sin ancla, el proximo sync re-verifica todo, que es lo correcto.

## Divergencias entre el manual de marca y el codigo real

Salieron de contar los hex usados en `app/**/*.js`. Vale la pena que Eric decida
si corrige el manual o el codigo:

- **Gris de texto.** El manual dice `#888888`. En el codigo aparece 2 veces,
  contra 19 de `#aaa` y 15 de `#bbb`. El token `--fielty-gris-texto` quedo en
  `#aaaaaa`, que es lo que de verdad se ve en el producto.
- **Verde.** El manual dice `#00b96b` para exito (2 usos). Pero `#00a884`
  aparece 10 veces: es el verde de WhatsApp, y se usa solo en el boton de
  WhatsApp de la tarjeta del cliente. Quedo como `--whatsapp-verde`, marcado
  como color de un tercero, no de Fielty.
- **Colores usados que el manual no documenta.** `#e8eaf0` (41 usos: bordes y
  separadores de los emails y de la guia imprimible) y `#1e1e1e` (24 usos: borde
  mas tenue que `#2a2a2a`). Los agregue como `--fielty-borde-claro` y
  `--fielty-borde-sutil`.
- **Tracking de titulos.** El manual dice que los titulos van "con el espaciado
  entre letras un poco cerrado". En el codigo no hay ni un `letterSpacing`
  negativo. No inventamos un token para eso; la guia sigue en
  `guidelines/manual-de-marca.md` tal cual la escribio Eric.

## Variantes claras y slides de carrusel

Se agregaron despues del primer sync, para poder alternar carruseles negros y
blancos en el feed de Instagram. Las dos superficies claras salieron del
producto, no se inventaron:

- **Blanco:** el de los emails. Texto `#0e0e0e`, secundario `#555`, bordes
  `#e8eaf0`. Ojo con `#aaa`: en los emails se usa sobre fondo claro pero solo en
  los pies de pagina; para texto de lectura sobre blanco no alcanza, por eso
  quedo como `--fielty-texto-claro-terciario`.
- **Crema:** `#fff8e6` con ambar oscuro `#7a5800`, el par de los bloques
  destacados de los emails y de la guia imprimible. El `--fielty-ambar` normal
  (`#f0a500`) no contrasta sobre crema; por eso existe el token oscurecido.

Los overrides de las primitivas estan scopeados bajo `.fielty-claro` y
`.fielty-crema`, asi que las mismas clases sirven en las tres superficies. La
unica que no es universal es `.fielty-etiqueta-ambar`, que solo existe dentro de
`.fielty-crema`.

### Dos trampas de CSS que costaron un ciclo de debug

Vale la pena dejarlas escritas porque no son obvias y se repiten en cualquier
pieza de tamano fijo:

1. **`padding` en `cqw` sobre el propio contenedor.** Un `padding:8.5cqw` en el
   elemento que tiene `container-type:inline-size` no se resuelve contra si
   mismo sino contra el contenedor de afuera. En la card se inflo a 66px, aplasto
   la caja de contenido a 77px, y los hijos terminaron midiendo su `cqw` contra
   esos 77px: titulos de 7px en vez de 19px. Por eso el padding vive en
   `.fielty-slide-cuerpo`, que si es descendiente.
2. **`aspect-ratio` adentro de una fila flex.** El `align-items:stretch` por
   defecto le pisa el `aspect-ratio` y el slide sale con la altura del vecino mas
   alto: el 1:1 salia 4:5. `.fielty-slide` lleva `align-self:flex-start` para
   blindarse.

Las dos se verificaron midiendo con `getComputedStyle` en el navegador, no a
ojo: en la captura el 1:1 y el 4:5 parecian casi iguales.

## Fuentes

Geist Sans y Geist Mono se cargan con `next/font/google` en `app/layout.js`; no
hay archivos de fuente en el repo (no esta el paquete `geist`). El bundle no
lleva carpeta `fonts/`: `--fielty-font-sans` cae en Inter, como dice el manual.

## Las clases `.fielty-*`

Existen solo en `ds-bundle/primitivas.css`, no en el codigo de fielty.app. Estan
para que el agente de diseno tenga con que componer en la estetica correcta, ya
que no hay componentes. Los valores si salieron del producto. Si algun dia se
extrae una libreria real, conviene que las clases se llamen igual que ahi.

## Como rehacer el sync

`ds-bundle/` esta en `.gitignore` (es artefacto de build). Se regenera a mano;
lo que se versiona es `.design-sync/conventions.md` (que se copia como
`README.md` del bundle) y este archivo.
