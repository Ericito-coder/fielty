/**
 * Sitemap del sitio público.
 *
 * `lastModified` va a mano, con la fecha en que cambió de verdad el
 * contenido de cada página. Antes usaba la fecha del build, con lo cual
 * en cada deploy las once URLs decían "modificada hoy" aunque no se
 * hubiera tocado ninguna, y ese es justo el tipo de señal que Google
 * termina ignorando.
 *
 * Al editar el contenido de una página, actualizá su fecha acá. No hace
 * falta tocarla por cambios que el visitante no ve (estilos, refactors).
 */
export default function sitemap() {
  const base = 'https://www.fielty.app'

  const routes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly', lastModified: '2026-08-01' },
    { path: '/para', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-08-01' },
    { path: '/para/barberias', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-07-30' },
    { path: '/para/cafeterias', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-07-30' },
    { path: '/para/peluquerias', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-07-30' },
    { path: '/para/veterinarias', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-07-30' },
    { path: '/para/gimnasios', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-07-30' },
    { path: '/para/restaurantes', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-08-01' },
    { path: '/para/panaderias', priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-08-01' },
    { path: '/faq', priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-08-01' },
    { path: '/guia', priority: 0.6, changeFrequency: 'monthly', lastModified: '2026-08-01' },
    { path: '/terminos', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-05-17' },
    { path: '/privacidad', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-07-28' },
  ]

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(`${route.lastModified}T00:00:00Z`),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
