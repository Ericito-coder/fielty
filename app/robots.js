export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/dashboard',
        '/api/',
        '/login',
        '/reset-password',
        '/mi-tarjeta',
        '/tarjeta/',
        '/qr/mi-tarjeta',
        '/onboarding/',
      ],
    },
  }
}
