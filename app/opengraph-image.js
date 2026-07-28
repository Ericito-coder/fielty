import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Fielty — Programa de fidelización y puntos para negocios sin app'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e0e0e',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e0001b', display: 'flex' }} />
          <div style={{ fontSize: 68, fontWeight: 900, color: 'white', letterSpacing: -2 }}>fielty</div>
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            maxWidth: 900,
            marginTop: 36,
            lineHeight: 1.25,
            display: 'flex',
          }}
        >
          Fidelizá clientes. Hacelos volver.
        </div>
        <div style={{ fontSize: 26, color: '#888', marginTop: 20, textAlign: 'center', display: 'flex' }}>
          Programa de puntos sin app para negocios en Argentina
        </div>
      </div>
    ),
    { ...size }
  )
}
