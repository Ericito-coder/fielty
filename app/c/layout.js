import ClarityScript from '@/app/components/ClarityScript'

export default function CajaLayout({ children }) {
  return (
    <>
      <ClarityScript />
      {children}
    </>
  )
}
