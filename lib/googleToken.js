// Verificación server-side del ID token que devuelve el botón de Google
// (Google Identity Services). El endpoint tokeninfo valida la firma y la
// expiración; acá solo falta chequear que el token sea para nuestra app
// (aud) y que Google haya verificado el email.
export async function verificarGoogleToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null
    if (data.email_verified !== 'true' || !data.email) return null
    return { email: data.email.toLowerCase(), nombre: data.name || '' }
  } catch {
    return null
  }
}
