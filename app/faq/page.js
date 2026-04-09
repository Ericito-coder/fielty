'use client'
import { useState } from 'react'

const FAQS = [
  {
    categoria: 'Sobre Fielty',
    preguntas: [
      {
        q: '¿Qué es Fielty?',
        a: 'Fielty es un sistema de fidelización de clientes para negocios. Tus clientes acumulan puntos en cada compra y los canjean por premios que vos definís. Sin app, sin complicaciones — todo funciona desde el celular con un link o QR.',
      },
      {
        q: '¿Mis clientes necesitan descargar una app?',
        a: 'No. Todo funciona desde el navegador. Tus clientes escanean el QR o entran al link y listo — ven su tarjeta, sus puntos y sus premios sin instalar nada.',
      },
      {
        q: '¿Funciona para cualquier tipo de negocio?',
        a: 'Sí. Fielty funciona para peluquerías, cafeterías, veterinarias, restaurantes, tiendas de ropa, farmacias y cualquier negocio que quiera fidelizar clientes.',
      },
    ],
  },
  {
    categoria: 'Registro y clientes',
    preguntas: [
      {
        q: '¿Cómo se registran mis clientes?',
        a: 'Mostrales el QR o compartiles el link de registro de tu negocio. Ellos completan su nombre, DNI y WhatsApp en menos de un minuto y ya tienen su tarjeta digital con puntos de bienvenida.',
      },
      {
        q: '¿Qué datos se piden al registrarse?',
        a: 'Nombre, DNI y WhatsApp son obligatorios. Email y fecha de nacimiento son opcionales. La fecha de nacimiento sirve para que tus clientes reciban puntos extra en su cumpleaños.',
      },
      {
        q: '¿Un cliente puede registrarse en varios negocios?',
        a: 'Sí. Cada negocio tiene su propio programa independiente. Un cliente puede tener tarjeta en todos los negocios que quiera.',
      },
    ],
  },
  {
    categoria: 'Puntos y recompensas',
    preguntas: [
      {
        q: '¿Cómo acredito puntos a un cliente?',
        a: 'Desde la URL de caja de tu negocio (fielty.app/c/tu-negocio). Buscás al cliente por nombre o DNI, ingresás el monto de la compra y confirmás. Los puntos se acreditan al instante.',
      },
      {
        q: '¿Puedo personalizar cuántos puntos da cada compra?',
        a: 'Sí. Desde la configuración del panel podés definir la regla de puntos. Por ejemplo: 1 punto por cada $100 de compra.',
      },
      {
        q: '¿Cómo canjean premios mis clientes?',
        a: 'Desde la tarjeta digital del cliente. Ellos ven las recompensas disponibles, aprietan "Canjear" y se genera un código que vos validás desde la caja antes de entregar el premio.',
      },
      {
        q: '¿Puedo cambiar las recompensas cuando quiero?',
        a: 'Sí, podés agregar, editar o desactivar recompensas en cualquier momento desde la sección Recompensas de tu panel.',
      },
    ],
  },
  {
    categoria: 'Planes y pagos',
    preguntas: [
      {
        q: '¿Cuánto cuesta Fielty?',
        a: 'Hay un plan Gratis que permite hasta 50 clientes sin costo. El plan Pro cuesta $7.999/mes e incluye clientes ilimitados, hasta 3 sucursales y soporte prioritario. El plan Business agrega exportación CSV, logo personalizado y sucursales ilimitadas.',
      },
      {
        q: '¿Puedo cancelar en cualquier momento?',
        a: 'Sí. No hay contratos ni permanencia mínima. Podés cancelar tu suscripción cuando quieras desde Mercado Pago.',
      },
      {
        q: '¿Cómo se cobra la suscripción?',
        a: 'El pago es mensual y se procesa automáticamente a través de Mercado Pago. Podés pagar con tarjeta de crédito, débito o dinero en cuenta de MP.',
      },
      {
        q: '¿Qué pasa cuando llego al límite de 50 clientes en el plan Gratis?',
        a: 'Te avisamos por email cuando llegás a 45 clientes para que tengas tiempo de decidir. Al llegar a 50, los nuevos clientes no pueden registrarse hasta que mejorés el plan.',
      },
    ],
  },
  {
    categoria: 'Técnico y seguridad',
    preguntas: [
      {
        q: '¿Es seguro guardar los datos de mis clientes en Fielty?',
        a: 'Sí. Los datos se almacenan en Supabase con encriptación y acceso protegido. Cumplimos con la Ley 25.326 de Protección de Datos Personales de Argentina.',
      },
      {
        q: '¿Qué pasa si Fielty tiene un problema técnico?',
        a: 'Ante cualquier inconveniente podés escribirnos a eric.bohl10@gmail.com y te respondemos a la brevedad.',
      },
      {
        q: '¿Puedo usar Fielty desde el celular?',
        a: 'Sí. El panel del dueño y la caja están optimizados para mobile. Podés gestionar todo desde tu celular sin necesidad de una computadora.',
      },
    ],
  },
]

export default function FAQ() {
  const [abiertos, setAbiertos] = useState({})

  const toggle = (key) => setAbiertos(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0001b', boxShadow: '0 0 8px #e0001b' }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>fielty</span>
        </a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/#como-funciona" style={{ fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 500 }}>Cómo funciona</a>
          <a href="/#precios" style={{ fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 500 }}>Precios</a>
          <a href="/login" style={{ fontSize: 13, color: '#888', textDecoration: 'none', fontWeight: 500 }}>Ingresar</a>
          <a href="/onboarding/registro" style={{ fontSize: 13, color: 'white', textDecoration: 'none', fontWeight: 700, background: '#e0001b', padding: '9px 16px', borderRadius: 10 }}>Empezá →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0001b', marginBottom: 16 }}>Ayuda</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: -1, lineHeight: 1.1 }}>Preguntas frecuentes</h1>
        <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, marginBottom: 0 }}>
          Todo lo que necesitás saber sobre Fielty. ¿No encontrás tu respuesta?{' '}
          <a href="mailto:eric.bohl10@gmail.com" style={{ color: '#e0001b', textDecoration: 'none', fontWeight: 600 }}>Escribinos</a>.
        </p>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        {FAQS.map((cat) => (
          <div key={cat.categoria} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e0001b', marginBottom: 14 }}>
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
                      <span style={{ fontSize: 20, color: '#e0001b', flexShrink: 0, transform: abierto ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1, fontWeight: 300 }}>+</span>
                    </button>
                    {abierto && (
                      <div style={{ padding: '0 24px 20px', fontSize: 14, color: '#888', lineHeight: 1.8, background: '#111' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* CTA final */}
        <div style={{ border: '1px solid #1a1a1a', borderRadius: 20, padding: '40px 32px', textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10 }}>¿Todavía tenés dudas?</div>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 28, lineHeight: 1.6 }}>Escribinos y te respondemos en menos de 24 horas.</p>
          <a href="mailto:eric.bohl10@gmail.com" style={{ display: 'inline-block', background: '#e0001b', color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Contactar →
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1a1a', textAlign: 'center', padding: '24px 20px 40px', fontSize: 13, color: '#444' }}>
        <a href="/terminos" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Términos</a>
        <a href="/privacidad" style={{ color: '#444', textDecoration: 'none', marginRight: 20 }}>Privacidad</a>
        <a href="/" style={{ color: '#444', textDecoration: 'none' }}>fielty.app</a>
      </div>
    </div>
  )
}
