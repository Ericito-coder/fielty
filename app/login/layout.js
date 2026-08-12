// /login está linkeado desde el nav de todas las páginas públicas, así que
// Google lo encuentra igual. Estaba en el disallow de robots.txt, y eso es
// justo lo que lo dejaba mal: el disallow impide rastrearlo, no indexarlo,
// con lo cual aparecía en búsquedas sin descripción (19 impresiones y 0
// clics en los últimos 28 días, la tercera página más mostrada del sitio).
//
// Con noindex, Google lo rastrea, ve que no va al índice y lo saca. Por eso
// esta ruta salió del disallow en robots.js: si sigue bloqueada, nunca puede
// leer esta instrucción.
//
// La página es un client component y no puede exportar metadata, por eso
// va acá y no en page.js.
export const metadata = {
  robots: { index: false, follow: true },
}

export default function LoginLayout({ children }) {
  return children
}
