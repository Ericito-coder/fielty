// Service worker de Fielty: hace instalable la PWA y deja la tarjeta
// del cliente disponible sin conexión (muestra los últimos datos vistos).
const CACHE = 'fielty-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Assets con hash de Next + íconos: cache-first (no cambian)
  const esEstatico = url.pathname.startsWith('/_next/static/')
    || url.pathname.startsWith('/icons/')
    || url.pathname === '/manifest.json'

  // Lo que necesita funcionar offline: la tarjeta y sus datos
  const esTarjeta = url.pathname.startsWith('/tarjeta/')
    || url.pathname.startsWith('/api/tarjeta/')
    || url.pathname === '/mi-tarjeta'

  if (esEstatico) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(request)
        if (hit) return hit
        const res = await fetch(request)
        if (res.ok) cache.put(request, res.clone())
        return res
      })
    )
    return
  }

  if (esTarjeta) {
    // network-first: datos frescos si hay conexión, cache si no
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        try {
          const res = await fetch(request)
          if (res.ok) cache.put(request, res.clone())
          return res
        } catch {
          const hit = await cache.match(request)
          if (hit) return hit
          return new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
        }
      })
    )
  }
})
