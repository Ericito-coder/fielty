# Fielty — fundamentos de marca

**Qué es esto.** Los fundamentos de marca de Fielty (fielty.app): un programa de
puntos para comercios con local a la calle. **No hay componentes React acá** —
Fielty es una app Next.js que maquetea con estilos inline y utilidades de
Tailwind v4, no una librería de componentes. Lo que este proyecto aporta son
tokens, primitivas CSS y las reglas de marca. Componé con componentes genéricos,
pero vestilos con estos tokens.

## Setup

No hace falta provider ni wrapper. Todo cuelga de `styles.css`; los tokens viven
en `:root`, así que están disponibles sin envolver nada. Para una pieza completa,
arrancá con `.fielty-oscuro` en el contenedor raíz: es el fondo negro + tipografía
correctos.

## Idioma visual

Tokens CSS con el prefijo `--fielty-*`. Usalos siempre en vez de escribir el hex.

**Color:** `--fielty-rojo` `--fielty-negro` `--fielty-blanco` `--fielty-negro-profundo`
`--fielty-gris-carbon` `--fielty-borde` `--fielty-borde-sutil` `--fielty-gris-texto`
`--fielty-gris-texto-tenue` `--fielty-gris-claro` `--fielty-borde-claro`
`--fielty-ambar` `--fielty-verde` `--fielty-degradado` `--fielty-foco`
(`--whatsapp-verde` es de WhatsApp, solo para el botón de WhatsApp).

**Tipografía:** `--fielty-font-sans` `--fielty-font-mono`; pesos
`--fielty-peso-normal|medio|semi|fuerte|titulo|maximo` (400→900); interlineado
`--fielty-lh-titulo|texto|largo`; tracking `--fielty-tracking-etiqueta`
(`-corto`, `-ancho`).

**Formas:** `--fielty-radio-xs|sm|md|lg|xl|2xl|3xl|4xl|pill` (6→100px),
`--fielty-borde-ancho`, `--fielty-borde-ancho-destacado`.

**Primitivas** (clases de este bundle, no del código de la app):
`.fielty-oscuro` `.fielty-claro` `.fielty-tarjeta` `.fielty-boton`
`.fielty-boton-secundario` `.fielty-etiqueta` `.fielty-titulo`
`.fielty-resaltado` `.fielty-texto-secundario` `.fielty-numero` `.fielty-pastilla`.

## Reglas que no se negocian

- **Oscuro por defecto.** Base `--fielty-negro` con texto blanco. Las piezas
  claras existen (emails, la guía imprimible) pero son la excepción.
- **El rojo es escaso.** Un botón, un punto, una palabra resaltada. Si una pieza
  tiene mucho rojo, está mal.
- **El degradado solo resalta una frase corta** dentro de un título. Nunca de
  fondo ni detrás de texto largo.
- **El logo siempre en minúscula:** `fielty`, nunca "Fielty" ni "FIELTY" como
  logo. En texto corrido sí lleva mayúscula inicial.
- **Tono:** castellano rioplatense, de vos ("Fidelizá", "Empezá", "Tenés").
  Nunca "tú" ni español neutro. Frases cortas, una idea por oración, sin jerga
  de marketing. Le hablás al dueño de una barbería, no a un MBA.
- **Sin guiones largos (—) a repetición**: es la marca del texto generado por IA.

## Dónde está la verdad

- `styles.css` y lo que importa: `tokens/colores.css`, `tokens/tipografia.css`,
  `tokens/formas.css`, `primitivas.css`. Leelos antes de estilar.
- `guidelines/manual-de-marca.md` — manual completo: tono de voz con ejemplos
  reales del sitio, e ideas de contenido por rubro (barberías, cafeterías,
  peluquerías, veterinarias, gimnasios).
- `brand/` — el isotipo en 1024, 512 y 192 px.

## Ejemplo

```html
<div class="fielty-oscuro" style="padding:48px">
  <div class="fielty-etiqueta">Barberías</div>
  <h1 class="fielty-titulo" style="font-size:44px;margin:12px 0 16px">
    El décimo corte <span class="fielty-resaltado">gratis</span>
  </h1>
  <p class="fielty-texto-secundario" style="font-size:16px;line-height:var(--fielty-lh-largo);max-width:52ch">
    Quien se corta con vos vuelve cada tres o cuatro semanas. No tenés que crear
    el hábito, solo asegurarte de que esa vuelta sea con vos.
  </p>
  <div class="fielty-tarjeta" style="max-width:340px;margin-top:28px">
    <div class="fielty-numero" style="font-size:28px">1 punto cada $100</div>
    <a class="fielty-boton" href="#" style="margin-top:18px">Empezá gratis</a>
  </div>
</div>
```
