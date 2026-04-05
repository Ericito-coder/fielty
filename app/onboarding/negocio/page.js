'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const COLORES = ['#e0001b', '#0e76fd', '#00b96b', '#7c3aed', '#f0a500', '#0e0e0e']

export default function ConfigNegocio() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [color, setColor] = useState('#e0001b')
  const [pesosPorTramo, setPesosPorTramo] = useState('100')
  const [puntosPorTramo, setPuntosPorTramo] = useState('1')
  const [puntosCumpleanos, setPuntosCumpleanos] = useState('50')
  const [puntosReferidoEmisor, setPuntosReferidoEmisor] = useState('100')
  const [puntosReferidoReceptor, setPuntosReferidoReceptor] = useState('50')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function guardar() {
    if (!nombre) { setError('Ingresá el nombre del negocio'); return }
    if (!telefono) { setError('Ingresá el teléfono del negocio'); return }
    setError('')
    setCargando(true)

    const userId = localStorage.getItem('fielty_user_id')

    const slug = nombre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data, error: dbError } = await supabase
      .from('negocios')
      .insert([{
        nombre,
        telefono,
        color,
        slug,
        tipo: 'puntos',
        pesos_por_punto: parseInt(pesosPorTramo) || 100,
        puntos_por_tramo: parseInt(puntosPorTramo) || 1,
        puntos_cumpleanos: parseInt(puntosCumpleanos) || 50,
        puntos_referido_emisor: parseInt(puntosReferidoEmisor) || 100,
        puntos_referido_receptor: parseInt(puntosReferidoReceptor) || 50,
        user_id: userId
      }])
      .select()
      .single()

    setCargando(false)
    if (dbError) { setError('Hubo un error, intentá de nuevo'); return }

    localStorage.setItem('fielty_negocio_id', data.id)
    window.location.href = '/onboarding/recompensa'
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoDot}></div>
          <span style={s.logoText}>fielty</span>
        </div>

        <div style={s.step}>Paso 2 de 3</div>
        <h1 style={s.title}>Configurá tu negocio</h1>
        <p style={s.sub}>Así va a aparecer en la tarjeta de tus clientes.</p>

        <div style={s.field}>
          <label style={s.label}>Nombre del negocio</label>
          <input style={s.input} placeholder="Ej: Pet Point"
            value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>

        <div style={s.field}>
          <label style={s.label}>Teléfono del negocio</label>
          <input style={s.input} type="tel" placeholder="Ej: 1123456789"
            value={telefono} onChange={e => setTelefono(e.target.value.replace(/[^0-9+\s()-]/g, ''))} />
          <div style={{fontSize:12, color:'#aaa', marginTop:6}}>Para que tus clientes puedan contactarte</div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Color de marca</label>
          <div style={s.colorRow}>
            {COLORES.map(c => (
              <div key={c} onClick={() => setColor(c)} style={{
                ...s.swatch,
                background: c,
                border: color === c ? '3px solid #0e0e0e' : '3px solid transparent',
                transform: color === c ? 'scale(1.15)' : 'scale(1)'
              }} />
            ))}
            <div style={{position:'relative', width:36, height:36, flexShrink:0}}>
              <div style={{
                width:36, height:36, borderRadius:10, cursor:'pointer',
                background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                border: '3px solid transparent', overflow:'hidden'
              }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0, cursor:'pointer', border:'none', padding:0}} />
              </div>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:12}}>
            <div style={{width:32, height:32, borderRadius:8, background:color, border:'1px solid #e8eaf0', flexShrink:0}}/>
            <div style={{position:'relative', flex:1}}>
              <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#888', fontFamily:'monospace'}}>#</span>
              <input style={{...s.input, paddingLeft:28, fontFamily:'monospace', fontSize:14}}
                placeholder="e0001b" maxLength={6}
                value={color.replace('#', '')}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9a-fA-F]/g, '')
                  if (val.length <= 6) setColor('#' + val)
                }} />
            </div>
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Regla de puntos</label>
          <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
            <span style={{fontSize:14, color:'#888'}}>Cada</span>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#888'}}>$</span>
              <input style={{...s.input, width:100, paddingLeft:24}} type="number" placeholder="100"
                value={pesosPorTramo} onChange={e => setPesosPorTramo(e.target.value)} />
            </div>
            <span style={{fontSize:14, color:'#888'}}>gastados →</span>
            <input style={{...s.input, width:80}} type="number" placeholder="1"
              value={puntosPorTramo} onChange={e => setPuntosPorTramo(e.target.value)} />
            <span style={{fontSize:14, color:'#888'}}>punto{puntosPorTramo != 1 ? 's' : ''}</span>
          </div>
          <div style={{fontSize:12, color:'#aaa', marginTop:8}}>
            Ej: compra de ${(parseInt(pesosPorTramo)||100) * 5} → {(parseInt(puntosPorTramo)||1) * 5} puntos
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Puntos por cumpleaños</label>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <input style={{...s.input, width:100}} type="number" placeholder="50"
              value={puntosCumpleanos} onChange={e => setPuntosCumpleanos(e.target.value)} />
            <span style={{fontSize:14, color:'#888'}}>puntos de regalo el día del cumpleaños</span>
          </div>
          <div style={{fontSize:12, color:'#aaa', marginTop:8}}>
            Se acreditan automáticamente cada año 🎂
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Puntos por referir amigos</label>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <input style={{...s.input, width:100}} type="number" placeholder="100"
                value={puntosReferidoEmisor} onChange={e => setPuntosReferidoEmisor(e.target.value)} />
              <span style={{fontSize:14, color:'#888'}}>puntos para el que invita</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <input style={{...s.input, width:100}} type="number" placeholder="50"
                value={puntosReferidoReceptor} onChange={e => setPuntosReferidoReceptor(e.target.value)} />
              <span style={{fontSize:14, color:'#888'}}>puntos para el nuevo cliente</span>
            </div>
          </div>
          <div style={{fontSize:12, color:'#aaa', marginTop:8}}>
            Se acreditan automáticamente cuando el amigo se registra 🤝
          </div>
        </div>

        {/* Preview */}
        <div style={{background:'linear-gradient(145deg, #1a1a2e, #0f3460)', borderRadius:20, padding:24, color:'white', marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
            <div style={{width:40, height:40, borderRadius:12, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'white', flexShrink:0}}>
              {nombre ? nombre.slice(0,2).toUpperCase() : 'MI'}
            </div>
            <div>
              <div style={{fontSize:16, fontWeight:700}}>{nombre || 'Mi Negocio'}</div>
              <div style={{fontSize:11, opacity:0.5}}>Programa de puntos</div>
            </div>
          </div>
          <div style={{fontSize:40, fontWeight:900, letterSpacing:-1}}>0 <span style={{fontSize:18, opacity:0.5, fontWeight:400}}>pts</span></div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={guardar} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Continuar →'}
        </button>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:28, padding:'40px 32px', width:'100%', maxWidth:420 },
  logo: { display:'flex', alignItems:'center', gap:8, marginBottom:28 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#e0001b', boxShadow:'0 0 10px #e0001b' },
  logoText: { fontSize:22, fontWeight:800, color:'#0e0e0e', letterSpacing:-0.5 },
  step: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#e0001b', marginBottom:8 },
  title: { fontSize:28, fontWeight:800, color:'#0e0e0e', marginBottom:8 },
  sub: { fontSize:14, color:'#888', marginBottom:28, lineHeight:1.6 },
  field: { marginBottom:20 },
  label: { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#888', marginBottom:8 },
  input: { width:'100%', padding:'14px 16px', border:'2px solid #e8eaf0', borderRadius:12, fontSize:16, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  colorRow: { display:'flex', gap:12, alignItems:'center' },
  swatch: { width:36, height:36, borderRadius:10, cursor:'pointer', transition:'all 0.15s' },
  btn: { width:'100%', padding:18, background:'#e0001b', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'inherit' },
  error: { background:'#fff0f0', color:'#e0001b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:12 },
}