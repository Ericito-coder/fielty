// Los deploys de preview sirven el sitio entero igual que producción. Si
// Google llega a una de esas URLs (fielty-git-master-...vercel.app) indexa
// una copia que compite con www.fielty.app por las mismas búsquedas. Fuera
// de producción, entonces, no se indexa nada. En local VERCEL_ENV no existe
// y cae en la misma rama, que es lo que queremos.
const esProduccion = process.env.VERCEL_ENV === 'production'

export default function robots() {
  if (!esProduccion) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Ojo con lo que se agrega acá: disallow impide rastrear, no indexar.
      // Una ruta bloqueada pero linkeada desde el sitio público termina
      // apareciendo en Google sin descripción, y encima el bloqueo impide
      // que lea el noindex que la sacaría. Para esas rutas (/login y
      // /onboarding/*, linkeadas desde el nav y los CTA) se usa noindex en
      // su layout. Acá quedan solo las que nadie enlaza desde afuera.
      disallow: [
        '/admin',
        '/email-preview',
        '/dashboard',
        '/api/',
        '/reset-password',
        '/mi-tarjeta',
        '/tarjeta/',
        '/qr/mi-tarjeta',
      ],
    },
    // Absoluto y con el mismo host que usa sitemap.js: un sitemap
    // declarado en otro dominio que el del robots.txt se ignora.
    sitemap: 'https://www.fielty.app/sitemap.xml',
  }
}
