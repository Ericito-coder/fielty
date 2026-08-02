'use client'
import { useRef } from 'react'
import Script from 'next/script'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'

// Nonce para el id_token de Google: Supabase espera la version hasheada
// (SHA-256, hex) en la llamada a Google y la version sin hashear en
// signInWithIdToken. Ver docs de Supabase "Login with Google".
async function generarNonce() {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce))
  const hashedNonce = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  return [nonce, hashedNonce]
}

// Botón nativo "Sign in with Google" (Google Identity Services). A
// diferencia de supabase.auth.signInWithOAuth (que redirige a través del
// dominio de Supabase y por eso Google le muestra ese dominio al usuario
// en vez de "Fielty"), esto corre del lado del cliente contra los
// orígenes autorizados en Google Cloud (fielty.app / localhost), así que
// el usuario ve el dominio propio.
// Con `onCredential`, el botón entrega el ID token crudo y no toca
// Supabase Auth — es el modo para el login/registro de clientes finales,
// donde el token se verifica en nuestro backend (lib/googleToken.js) y no
// existe usuario de Supabase. Sin `onCredential` corre el flujo del dueño.
export default function GoogleSignInButton({ onError, onCredential }) {
  const contenedorRef = useRef(null)

  async function inicializar() {
    if (!window.google || !contenedorRef.current) return
    const [nonce, hashedNonce] = await generarNonce()

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (onCredential) { onCredential(response.credential); return }

        const { error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
          nonce,
        })
        if (authError) { onError?.(); return }

        const { data: { user } } = await supabase.auth.getUser()
        const { data: negocioData } = await supabase
          .from('negocios').select('id').eq('user_id', user.id).maybeSingle()

        if (!negocioData) storage.set('fielty_user_id', user.id)
        window.location.href = negocioData ? '/dashboard' : '/onboarding/negocio'
      },
      nonce: hashedNonce,
      use_fedcm_for_prompt: true,
    })

    // Ancho fijo en px (renderButton no admite "100%"): se mide el
    // contenedor real para que calce con la tarjeta tanto en mobile
    // como en desktop, en vez de hardcodear un valor pensado solo para
    // el ancho de desktop. El doble rAF espera a que termine el layout
    // del frame actual: si se mide en el mismo tick que onReady, el
    // contenedor a veces todavia no tiene su ancho final y Google cae
    // a un tamaño automático angosto por contenido.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!contenedorRef.current) return
        window.google.accounts.id.renderButton(contenedorRef.current, {
          theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es',
          width: contenedorRef.current.clientWidth,
        })
      })
    })
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" onReady={inicializar} />
      <div ref={contenedorRef} style={{ display: 'flex', justifyContent: 'center' }} />
    </>
  )
}
