'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [cargando, setCargando] = useState(false)
  const [clienteId, setClienteId] = useState(null)
  const [error, setError] = useState('')

  const [NEGOCIO_ID, setNegocioId] = useState('b6bf5d90-9aca-46c4-8f9a-ff3ec342af67')
const [REFERIDO_POR, setReferidoPor] = useState(null)

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  setNegocioId(params.get('negocio') || 'b6bf5d90-9aca-46c4-8f9a-ff3ec342af67')
  setReferidoPor(params.get('ref') || null)
}, [])

  async function registrar() {
    if (!nombre) { setError('Ingresá tu nombre'); return }
    if (!dni) { setError('Ingresá tu DNI'); return }
    setError('')
    setCargando(true)

    // Crear el cliente nuevo
    const { data, error: insertError } = await supabase
      .from('clientes')
      .insert([{
        nombre,
        dni,
        telefono,
        negocio_id: NEGOCIO_ID,
        puntos: 10,
        puntos_historicos: 10,
        fecha_nacimiento: fechaNacimiento || null,
        referido_por: REFERIDO_POR || null
      }])
      .select()

    if (insertError) { setError('Hubo un error, intentá de nuevo'); setCargando(false); return }

    const nuevoCliente = data[0]

    // Si vino con referido, dar puntos a ambos
    if (REFERIDO_POR) {
      // Buscar config del negocio
      const { data: negocio } = await supabase
        .from('negocios')
        .select('puntos_referido_emisor, puntos_referido_receptor')
        .eq('id', NEGOCIO_ID)
        .single()

      const ptsEmisor = negocio?.puntos_referido_emisor || 100
      const ptsReceptor = negocio?.puntos_referido_receptor || 50

      // Buscar puntos actuales del que refirió
      const { data: emisor } = await supabase
        .from('clientes')
        .select('puntos, puntos_historicos, referidos_count')
        .eq('id', REFERIDO_POR)
        .single()

      if (emisor) {
        // Dar puntos al que refirió
        await supabase
          .from('clientes')
          .update({
            puntos: emisor.puntos + ptsEmisor,
            puntos_historicos: emisor.puntos_historicos + ptsEmisor,
            referidos_count: (emisor.referidos_count || 0) + 1
          })
          .eq('id', REFERIDO_POR)

        await supabase
          .from('transacciones')
          .insert([{
            cliente_id: REFERIDO_POR,
            negocio_id: NEGOCIO_ID,
            tipo: 'referido',
            puntos: ptsEmisor,
            descripcion: `🤝 Referido exitoso: ${nombre} se registró con tu link`
          }])

        // Dar puntos extra al nuevo cliente por venir referido
        await supabase
          .from('clientes')
          .update({
            puntos: 10 + ptsReceptor,
            puntos_historicos: 10 + ptsReceptor
          })
          .eq('id', nuevoCliente.id)

        await supabase
          .from('transacciones')
          .insert([{
            cliente_id: nuevoCliente.id,
            negocio_id: NEGOCIO_ID,
            tipo: 'referido',
            puntos: ptsReceptor,
            descripcion: `🤝 Bonus por registrarte con un link de amigo`
          }])
      }
    }

    setCargando(false)
    setClienteId(nuevoCliente.id)
  }

  if (clienteId) return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{fontSize:56, marginBottom:16}}>🎉</div>
        <h2 style={styles.title}>¡Bienvenido!</h2>
        <p style={styles.sub}>
          Tu tarjeta fue creada con <strong>{REFERIDO_POR ? '10 puntos + bonus por referido' : '10 puntos'}</strong> de regalo.
        </p>
        <button style={styles.btn} onClick={() => window.location.href = `/tarjeta/${clienteId}`}>
          Ver mi tarjeta →
        </button>
      </div>
    </div>
  )

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{fontSize:13, color:'#e0001b', fontWeight:700, marginBottom:8, letterSpacing:'0.05em'}}>PET POINT</div>
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
          <label style={styles.label}>WhatsApp <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input style={styles.input} placeholder="Ej: 11 5555-1234"
            value={telefono} onChange={e => setTelefono(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Fecha de nacimiento <span style={{color:'#bbb', fontWeight:400}}>(opcional)</span></label>
          <input style={styles.input} type="date"
            value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btn} onClick={registrar} disabled={cargando}>
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
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:8, fontFamily:'inherit' },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 }
}