'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import styles from '../login/page.module.css'

export default function RestablecerContrasenaPage() {
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirmacion) return setError('Las contraseñas no coinciden.')

    setLoading(true)
    const { error } = await createSupabaseBrowser().auth.updateUser({ password })
    setLoading(false)

    if (error) return setError('El enlace no es válido o ya expiró. Solicita uno nuevo.')
    location.assign('/')
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>MacrOS</h1>
        <p className={styles.sub}>Elige una contraseña nueva</p>
        <form className={styles.form} onSubmit={(event) => { event.preventDefault(); handleSubmit() }}>
          <label className={styles.label}>
            Contraseña nueva
            <input className={styles.input} type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className={styles.label}>
            Confirmar contraseña
            <input className={styles.input} type="password" autoComplete="new-password" minLength={6} required value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} disabled={loading} type="submit">
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </main>
  )
}
