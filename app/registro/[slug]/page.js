'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function RegistroSlug({ params }) {
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
const [email, setEmail] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [cargando, setCargando] = useState(false)
  const [clienteId, setClienteId] = useState(null)
  const [error, setError] = useState('')
  const [negocio, setNegocio] = useState(null)
  const [REFERIDO_POR, setReferidoPor] = useState(null)

  useEffect(() => {
    params.then(p => {
      supabase.from('negocios').select('*').eq('slug', p.slug).single()
        .then(({ data }) => setNegocio(data))
    })
    const searchParams = new URLSearchParams(window.location.search)
    setReferidoPor(searchParams.get('ref') || null)
  }, [params])

  async function registrar() {
    if (!nombre) { setError('Ingresá tu nombre'); return }
if (!dni) { setError('Ingresá tu DNI'); return }
if (!telefono) { setError('Ingresá tu WhatsApp'); return }
   if (!negocio) { setError('Negocio no encontrado'); return }
    setError('')
    setCargando(true)

  const { data: porDni } = await supabase
      .from('clientes').select('id').eq('negocio_id', negocio.id).eq('dni', dni).limit(1)
    if (porDni && porDni.length > 0) {
      setError('Ya tenés una tarjeta en este negocio registrada con ese DNI. ¡Pedile al empleado que te busque!')
      setCargando(false); return
    }

    const { data: porTelefono } = await supabase
      .from('clientes').select('id').eq('negocio_id', negocio.id).eq('telefono', telefono).limit(1)
    if (porTelefono && porTelefono.length > 0) {
      setError('Ya tenés una tarjeta en este negocio registrada con ese WhatsApp. ¡Pedile al empleado que te busque!')
      setCargando(false); return
    }

    if (email) {
      const { data: porEmail } = await supabase
        .from('clientes').select('id').eq('negocio_id', negocio.id).eq('email', email).limit(1)
      if (porEmail && porEmail.length > 0) {
        setError('Ya tenés una tarjeta en este negocio registrada con ese email. ¡Pedile al empleado que te busque!')
        setCargando(false); return
      }
    }
const { count } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocio.id)

    if (negocio.plan === 'gratis' && count >= 50) {
      setError('No se pudo completar el registro. Contactá al negocio para más información.')
      setCargando(false)
      return
    }
    const { data, error: insertError } = await supabase
      .from('clientes')
      .insert([{
        nombre,
        dni,
        telefono,
email: email || null,
        negocio_id: negocio.id,
        puntos: 10,
        puntos_historicos: 10,
        fecha_nacimiento: fechaNacimiento || null,
        referido_por: REFERIDO_POR || null
      }])
      .select()

    if (insertError) { setError('Hubo un error, intentá de nuevo'); setCargando(false); return }

    // Notificar al dueño si se acerca o llega al límite (no bloqueante)
    if (negocio.plan === 'gratis') {
      fetch('/api/notificar-limite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId: negocio.id }),
      }).catch(() => {})
    }

    const nuevoCliente = data[0]

    if (REFERIDO_POR) {
      const ptsEmisor = negocio.puntos_referido_emisor || 100
      const ptsReceptor = negocio.puntos_referido_receptor || 50

      const { data: emisor } = await supabase
        .from('clientes').select('puntos, puntos_historicos, referidos_count')
        .eq('id', REFERIDO_POR).single()

      if (emisor) {
        await supabase.from('clientes').update({
          puntos: emisor.puntos + ptsEmisor,
          puntos_historicos: emisor.puntos_historicos + ptsEmisor,
          referidos_count: (emisor.referidos_count || 0) + 1
        }).eq('id', REFERIDO_POR)

        await supabase.from('transacciones').insert([{
          cliente_id: REFERIDO_POR,
          negocio_id: negocio.id,
          tipo: 'referido',
          puntos: ptsEmisor,
          descripcion: `🤝 Referido exitoso: ${nombre} se registró con tu link`
        }])

        await supabase.from('clientes').update({
          puntos: 10 + ptsReceptor,
          puntos_historicos: 10 + ptsReceptor
        }).eq('id', nuevoCliente.id)

        await supabase.from('transacciones').insert([{
          cliente_id: nuevoCliente.id,
          negocio_id: negocio.id,
          tipo: 'referido',
          puntos: ptsReceptor,
          descripcion: `🤝 Bonus por registrarte con un link de amigo`
        }])
      }
    }

    setCargando(false)
    setClienteId(nuevoCliente.id)
  }

  if (!negocio) return (
    <div style={styles.wrap}>
      <div style={{color:'white', textAlign:'center'}}>Cargando...</div>
    </div>
  )

  if (clienteId) return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{fontSize:56, marginBottom:16}}>🎉</div>
        <h2 style={styles.title}>¡Bienvenido!</h2>
        <p style={styles.sub}>
          Tu tarjeta fue creada con <strong>{REFERIDO_POR ? '10 puntos + bonus por referido' : '10 puntos'}</strong> de regalo.
        </p>
        <button style={{...styles.btn, background: negocio.color}} onClick={() => window.location.href = `/tarjeta/${clienteId}`}>
          Ver mi tarjeta →
        </button>
      </div>
    </div>
  )

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <div style={{width:40, height:40, borderRadius:12, background: negocio.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'white'}}>
            {negocio.nombre.slice(0,2).toUpperCase()}
          </div>
          <div style={{fontSize:13, color: negocio.color, fontWeight:700, letterSpacing:'0.05em'}}>
            {negocio.nombre.toUpperCase()}
          </div>
        </div>
        <h1 style={styles.title}>Sumá puntos,<br/>ganá premios.</h1>
        <p style={styles.sub}>
          {REFERIDO_POR
            ? '🤝 Un amigo te invitó — vas a recibir puntos extra al registrarte.'
            : 'Registrate y empezá a acumular en cada compra. Sin app, sin complicaciones.'}
        </p>

        <div style={styles.field}>
          <label style={styles.label}>Tu nombre</label>
          <input style={styles.input} placeholder="Ej: Martina García"
            value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>DNI</label>
          <input style={styles.input} placeholder="Ej: 38.452.100"
            value={dni} onChange={e => setDni(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>WhatsApp</label>
          <input style={styles.input} placeholder="Ej: 11 5555-1234"
            value={telefono} onChange={e => setTelefono(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input style={styles.input} type="email" placeholder="Ej: martina@gmail.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Fecha de nacimiento <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input style={{...styles.input, width:'calc(100% - 32px)'}} type="date"
            value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={{...styles.btn, background: negocio.color}} onClick={registrar} disabled={cargando}>
          {cargando ? 'Creando tu tarjeta...' : '✦ Crear mi tarjeta gratis'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'36px 28px', width:'100%', maxWidth:400 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', lineHeight:1.2, marginBottom:10 },
  sub: { fontSize:14, color:'#888', marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:16 },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box', maxWidth:'100%' },
  btn: { width:'100%', padding:18, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 }
}