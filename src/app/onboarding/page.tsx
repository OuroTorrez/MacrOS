'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './page.module.css'

export default function OnboardingPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function guardarPerfil(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!nombre.trim() || !apellidoPaterno.trim()) {
      setError('Nombre y apellido paterno son requeridos.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido_paterno: apellidoPaterno.trim(),
          apellido_materno: apellidoMaterno.trim() || undefined,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'No se pudo guardar el perfil.')

      router.replace('/')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <form className={styles.card} onSubmit={guardarPerfil}>
        <h1>Completa tu perfil</h1>
        <p>Usaremos estos datos para personalizar tu cuenta.</p>

        <label>
          Nombre
          <input value={nombre} onChange={(event) => setNombre(event.target.value)} autoComplete="given-name" />
        </label>
        <label>
          Apellido paterno
          <input value={apellidoPaterno} onChange={(event) => setApellidoPaterno(event.target.value)} autoComplete="family-name" />
        </label>
        <label>
          Apellido materno <span>(opcional)</span>
          <input value={apellidoMaterno} onChange={(event) => setApellidoMaterno(event.target.value)} autoComplete="additional-name" />
        </label>

        {error && <p className={styles.error}>{error}</p>}
        <button disabled={loading} type="submit">{loading ? 'Guardando...' : 'Continuar'}</button>
      </form>
    </main>
  )
}
