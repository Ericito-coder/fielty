'use client'
import { theme } from '@/lib/theme'
import { useState } from 'react'
import { FAQS } from './faqData'


export default function FaqClient() {
  const [abiertos, setAbiertos] = useState({})

  const toggle = (key) => setAbiertos(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div style={{ minHeight: '100vh', background: theme.black, fontFamily: 'inherit' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.red, boxShadow: '0 0 8px #e0001b' }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>fielty</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/#como-funciona" style={{ fontSize: 13, color: theme.gray, textDecoration: 'none', fontWeight: 500 }}>Cómo funciona</a>
          <a href="/#precios" style={{ fontSize: 13, color: theme.gray, textDecoration: 'none', fontWeight: 500 }}>Precios</a>
          <a href="/login" style={{ fontSize: 13, color: theme.gray, textDecoration: 'none', fontWeight: 500 }}>Ingresar</a>
          <a href="/onboarding/registro" style={{ fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 700, background: theme.red, padding: '9px 16px', borderRadius: 10 }}>Empezá →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.red, marginBottom: 16 }}>Ayuda</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: -1, lineHeight: 1.1 }}>Preguntas frecuentes</h1>
        <p style={{ fontSize: 16, color: theme.gray, lineHeight: 1.7, marginBottom: 0 }}>
          Todo lo que necesitás saber sobre Fielty. ¿No encontrás tu respuesta?{' '}
          <a href="mailto:hola@fielty.app" style={{ color: theme.red, textDecoration: 'none', fontWeight: 600 }}>Escribinos</a>.
        </p>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        {FAQS.map((cat) => (
          <div key={cat.categoria} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.red, marginBottom: 14 }}>
              {cat.categoria}
            </div>
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1a1a1a' }}>
              {cat.preguntas.map((item, i) => {
                const key = `${cat.categoria}-${i}`
                const abierto = !!abiertos[key]
                return (
                  <div key={i} style={{ borderBottom: i < cat.preguntas.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <button
                      onClick={() => toggle(key)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 24px', background: abierto ? '#111' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s' }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.4 }}>{item.q}</span>
                      <span style={{ fontSize: 20, color: theme.red, flexShrink: 0, transform: abierto ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1, fontWeight: 300 }}>+</span>
                    </button>
                    {abierto && (
                      <div style={{ padding: '0 24px 20px', fontSize: 14, color: theme.gray, lineHeight: 1.8, background: '#111' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Por rubro */}
        <div style={{ border: '1px solid #1a1a1a', borderRadius: 20, padding: '32px', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 8 }}>Cómo funciona en tu rubro</div>
          <p style={{ fontSize: 14, color: theme.gray, marginBottom: 20, lineHeight: 1.6 }}>
            Armamos una guía específica según el tipo de negocio, con la regla de puntos que mejor le calza a cada uno.
          </p>
          <div style={{ display: 'flex', gap: '12px 20px', flexWrap: 'wrap' }}>
            {[
              ['/para/barberias', 'Barberías'],
              ['/para/cafeterias', 'Cafeterías'],
              ['/para/peluquerias', 'Peluquerías'],
              ['/para/veterinarias', 'Veterinarias y pet shops'],
              ['/para/gimnasios', 'Gimnasios'],
              ['/para/restaurantes', 'Restaurantes'],
              ['/para/panaderias', 'Panaderías'],
            ].map(([href, nombre]) => (
              <a key={href} href={href} style={{ fontSize: 14, color: theme.red, fontWeight: 700, textDecoration: 'none' }}>
                {nombre} →
              </a>
            ))}
          </div>
        </div>

        {/* Empezá gratis */}
        <div style={{ border: '1px solid #1a1a1a', borderRadius: 20, padding: '40px 32px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10 }}>¿Listo para fidelizar tus clientes?</div>
          <p style={{ fontSize: 14, color: theme.gray, marginBottom: 28, lineHeight: 1.6 }}>Empezá gratis hoy. Sin tarjeta, sin contrato.</p>
          <a href="/onboarding/registro" style={{ display: 'inline-block', background: theme.red, color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Empezá gratis →
          </a>
        </div>

        {/* CTA final */}
        <div style={{ border: '1px solid #1a1a1a', borderRadius: 20, padding: '40px 32px', textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10 }}>¿Todavía tenés dudas?</div>
          <p style={{ fontSize: 14, color: theme.gray, marginBottom: 28, lineHeight: 1.6 }}>Escribinos y te respondemos en menos de 24 horas.</p>
          <a href="mailto:hola@fielty.app" style={{ display: 'inline-block', background: theme.red, color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Contactar →
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1a1a', textAlign: 'center', padding: '24px 20px 40px', fontSize: 13, color: '#444' }}>
        <a href="/terminos" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Términos</a>
        <a href="/privacidad" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Privacidad</a>
        <a href="/guia" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Guía completa</a>
        <a href="/como-armar-un-programa-de-puntos" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Cómo armar un programa de puntos</a>
        <a href="/para" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Por rubro</a>
        <a href="/" style={{ color: '#444', textDecoration: 'none' }}>fielty.app</a>
      </div>
    </div>
  )
}
