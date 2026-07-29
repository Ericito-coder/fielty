export default function sitemap() {
  const base = 'https://www.fielty.app'
  const now = new Date()

  const routes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/para/barberias', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/guia', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/terminos', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacidad', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
