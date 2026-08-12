import ClarityScript from '@/app/components/ClarityScript'

// El onboarding está linkeado desde todas las páginas públicas ("Empezá"),
// así que Google lo encuentra sí o sí. Bloquearlo por robots.txt no alcanza:
// eso impide rastrearlo, no indexarlo, y termina apareciendo en búsquedas
// sin descripción. Con noindex Google lo rastrea, ve que no va al índice y
// lo descarta. Por eso estas rutas salieron del disallow en robots.js.
export const metadata = {
  robots: { index: false, follow: true },
}

export default function OnboardingLayout({ children }) {
  return (
    <>
      <ClarityScript />
      {children}
    </>
  )
}
