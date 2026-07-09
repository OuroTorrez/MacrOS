'use client'

import { useState } from 'react'
import { db } from '@/lib/bd/schema'
import { usePreferenciasStore } from '@/store/usePreferenciasStore'
import { crearSesion, crearSet } from '@/lib/api/sets'
import styles from './page.module.css'

const hoy = () => new Date().toISOString().slice(0, 10)
const uid = () => crypto.randomUUID()

export default function RegistroPage() {
  const { unidad, toggleUnidad, aKg, formatPeso } = usePreferenciasStore()

  const [ejercicio, setEjercicio] = useState('')
  const [reps, setReps]           = useState('')
  const [peso, setPeso]           = useState('')
  const [nota, setNota]           = useState('')
  const [guardado, setGuardado]   = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)

  async function guardar() {
    setError(null)
    setGuardado(null)
    if (!ejercicio.trim() || !reps || !peso) {
      setError('Completa ejercicio, reps y peso.')
      return
    }

    setLoading(true)
    const pesoKg      = aKg(parseFloat(peso))
    const ejercicioId = ejercicio.trim().toLowerCase()
    const fecha       = hoy()

    try {
      // 1. Sesión del día — el API devuelve existente o crea una nueva
      const resSesion = await crearSesion({ fecha })
      if (resSesion.error) throw new Error(resSesion.error)
      const sesion = resSesion.data

      // 2. Guardar set en Supabase vía Route Handler
      const resSet = await crearSet({
        sesion_id:    sesion.id,
        ejercicio_id: ejercicioId,
        numero_set:   1, // ponytail: contador simple, mejora con historial
        reps:         parseInt(reps),
        peso_kg:      pesoKg,
        notas:        nota || undefined,
      })
      if (resSet.error) throw new Error(resSet.error)
      const set = resSet.data

      // 3. Guardar también en Dexie para offline — ponytail: fire and forget
      db.sets.put({ ...set, es_pr: set.es_pr }).catch(console.error)

      setGuardado(
        set.es_pr
          ? `🏆 ¡PR! ${formatPeso(pesoKg)} × ${reps} reps`
          : `✓ ${formatPeso(pesoKg)} × ${reps} reps guardado`
      )
      setReps('')
      setPeso('')
      setNota('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Registrar set</h1>
        <button className={styles.toggle} onClick={toggleUnidad}>
          {unidad.toUpperCase()}
        </button>
      </div>

      <div className={styles.form}>
        <label className={styles.label}>
          Ejercicio
          <input
            className={styles.input}
            value={ejercicio}
            onChange={e => setEjercicio(e.target.value)}
            placeholder="press banca, sentadilla..."
            autoCapitalize="none"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            Reps
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={e => setReps(e.target.value)}
              placeholder="8"
              min={1}
            />
          </label>

          <label className={styles.label}>
            Peso ({unidad})
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              value={peso}
              onChange={e => setPeso(e.target.value)}
              placeholder="80"
              min={0}
              step={unidad === 'lbs' ? 5 : 2.5}
            />
          </label>
        </div>

        <label className={styles.label}>
          Nota (opcional)
          <input
            className={styles.input}
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="espalda neutral, agarre cerrado..."
          />
        </label>

        {error    && <p className={styles.error}>{error}</p>}
        {guardado && <p className={styles.success}>{guardado}</p>}

        <button className={styles.btn} onClick={guardar} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar set'}
        </button>
      </div>
    </main>
  )
}
