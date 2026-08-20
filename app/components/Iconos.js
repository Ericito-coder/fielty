// Set de iconos propio, en SVG inline: un solo trazo, un solo tamaño, y toman
// el color del contenedor con currentColor.
//
// Antes esto eran emojis. El problema del emoji como icono es que no es un
// icono: cada sistema operativo lo dibuja distinto (el regalo de Android no se
// parece en nada al de iPhone), no se puede colorear, no se puede alinear con
// precisión y el conjunto nunca se ve como un set. Con nueve emojis distintos
// la sección de features tenía nueve estilos de dibujo diferentes.
//
// Si algún día entra una librería de iconos, se reemplaza el mapa de abajo y
// todo lo que los usa sigue funcionando igual.

const TRAZO = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const FIGURAS = {
  // Configurar el negocio
  ajustes: (
    <>
      <line x1="4" y1="8" x2="20" y2="8" />
      <circle cx="9" cy="8" r="2.2" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <circle cx="16" cy="16" r="2.2" />
    </>
  ),
  // El QR del mostrador
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
      <path d="M14 14h3.2v3.2H14z" />
      <path d="M20.5 14v0M14 20.5v0M20.5 20.5v0" />
    </>
  ),
  // Cargar la venta
  ticket: (
    <>
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-2.5-1.6L14 21l-2-1.6L10 21l-2.5-1.6L5 21V4.5a1 1 0 0 1 1-1z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </>
  ),
  // Puntos por compra
  estrella: <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5z" />,
  // Cumpleaños
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <line x1="3.5" y1="10" x2="20.5" y2="10" />
      <line x1="8" y1="2.8" x2="8" y2="6.5" />
      <line x1="16" y1="2.8" x2="16" y2="6.5" />
      <path d="M12 15v0" />
    </>
  ),
  // Referidos
  personas: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.8c0-3.1 2.5-5.2 5.5-5.2s5.5 2.1 5.5 5.2" />
      <path d="M16 5.3a3.2 3.2 0 0 1 0 5.8" />
      <path d="M17.6 15c1.9.7 3 2.5 3 4.8" />
    </>
  ),
  // Niveles de lealtad
  medalla: (
    <>
      <circle cx="12" cy="14.8" r="5.4" />
      <path d="M8.6 9.7L6 3.5h12l-2.6 6.2" />
    </>
  ),
  // Sucursales
  local: (
    <>
      <path d="M4.5 10.2V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-9.8" />
      <path d="M3 9.5l1.8-5A1 1 0 0 1 5.75 3.8h12.5a1 1 0 0 1 .95.7L21 9.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
      <path d="M9.8 21v-5.3h4.4V21" />
    </>
  ),
  // Abrir/cerrar de los acordeones: rotado 45° queda una cruz
  mas: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  // Métricas
  // El eje sube hasta arriba a propósito: sin él las barras quedaban todas en
  // la mitad de abajo del cuadro y el icono se veía hundido al lado del resto.
  grafico: (
    <>
      <path d="M4 3.5v17h16.5" />
      <path d="M8.8 20.5v-6" />
      <path d="M13.2 20.5v-10.5" />
      <path d="M17.6 20.5v-4" />
    </>
  ),
}

export default function Icono({ nombre, size = 22, style }) {
  const figura = FIGURAS[nombre]
  if (!figura) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style} {...TRAZO}>
      {figura}
    </svg>
  )
}
