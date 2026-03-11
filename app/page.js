'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      window.location.href = '/reset-password' + hash
    } else {
      window.location.href = '/login'
    }
  }, [])

  return <div style={{minHeight:'100vh', background:'#0e0e0e'}} />
}