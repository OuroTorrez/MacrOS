'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/bd/schema'
import { usePreferenciasStore } from '@/store/usePreferenciasStore'
import { crearSesion, crearSerie, getEjercicios, getUsuario } from '@/lib/api/series'
import type { Ejercicio } from '@/types'
import styles from './page.module.css'

export default function RegistroPage() {
  const { unidad, toggleUnidad, aKg, formatPeso } = usePreferenciasStore()

  // ── Usuario autenticado ────────────────────────────────────────────────────
  const [usuarioId, setUsuarioId] = useState<number | null>(null)

  useEffect(() => {
    // Obtiene el usuario de la sesión activa y resuelve su usuario_id interno
    getUsuario().then((json) => {
      if (json.data) setUsuarioId(json.data.usuario_id)
    })
  }, [])

  // ── Ejercicios ─────────────────────────────────────────────────────────────
  const [ejercicios, setEjercicios]     = useState<Ejercicio[]>([])
  const [ejercicioId, setEjercicioId]   = useState<number | null>(null)
  const [busqueda, setBusqueda]         = useState('')
  const [mostrarLista, setMostrarLista] = useState(false)
  const busquedaRef                     = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!usuarioId) return
    getEjercicios().then(res => {
      if (res.data) setEjercicios(res.data)
    })
  }, [usuarioId])

  const ejerciciosFiltrados = busqueda.trim()
    ? ejercicios.filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : ejercicios

  const ejercicioSeleccionado = ejercicios.find(e => e.ejercicio_id === ejercicioId)

  function seleccionarEjercicio(e: Ejercicio) {
    setEjercicioId(e.ejercicio_id)
    setBusqueda(e.nombre)
    setMostrarLista(false)
    setNumeroSerie(1)
  }

  function limpiarEjercicio() {
    setEjercicioId(null)
    setBusqueda('')
    setMostrarLista(false)
    busquedaRef.current?.focus()
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [numeroSerie, setNumeroSerie] = useState(1)
  const [reps, setReps]               = useState('')
  const [peso, setPeso]               = useState('')
  const [nota, setNota]               = useState('')
  const [guardado, setGuardado]       = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)

  async function guardar() {
    setError(null)
    setGuardado(null)

    if (!usuarioId)  { setError('Sesión no disponible.'); return }
    if (!ejercicioId) { setError('Selecciona un ejercicio.'); return }
    if (!reps || !peso) { setError('Completa reps y peso.'); return }

    setLoading(true)
    const pesoKg = aKg(parseFloat(peso))

    try {
      // 1. Sesión del día
      const resSesion = await crearSesion({})
      if (resSesion.error || !resSesion.data) throw new Error(resSesion.error ?? 'Error al crear sesión')

      // 2. Guardar serie en Supabase
      const resSerie = await crearSerie({
        sesion_id:    resSesion.data.sesion_id,
        ejercicio_id: ejercicioId,
        numero_serie: numeroSerie,
        repeticiones: parseInt(reps),
        peso_kg:      pesoKg,
        notas:        nota || undefined,
      })
      if (resSerie.error || !resSerie.data) throw new Error(resSerie.error ?? 'Error al guardar serie')
      const serie = resSerie.data

      // 3. Espejo en Dexie para offline
      db.series.put({
        serie_id:     serie.serie_id,
        sesion_id:    serie.sesion_id,
        ejercicio_id: serie.ejercicio_id,
        numero_serie: serie.numero_serie,
        repeticiones: serie.repeticiones,
        peso_kg:      serie.peso_kg,
        notas:        serie.notas,
        iniciado_en:  serie.iniciado_en,
      }).catch(console.error)

      setGuardado(
        serie.es_pr
          ? `🏆 ¡PR! ${formatPeso(pesoKg)} × ${reps} reps`
          : `✓ Serie ${numeroSerie} — ${formatPeso(pesoKg)} × ${reps} reps`
      )
      setNumeroSerie(n => n + 1)
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
        <h1>Registrar serie</h1>
        <button className={styles.toggle} onClick={toggleUnidad}>
          {unidad.toUpperCase()}
        </button>
      </div>

      <div className={styles.form}>

        <div className={styles.buscadorWrap}>
          <label className={styles.label}>Ejercicio</label>
          <div className={styles.buscadorRow}>
            <input
              ref={busquedaRef}
              className={styles.input}
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setEjercicioId(null); setMostrarLista(true) }}
              onFocus={() => setMostrarLista(true)}
              placeholder="Buscar ejercicio..."
              autoCapitalize="none"
              autoComplete="off"
            />
            {ejercicioId && (
              <button className={styles.clearBtn} onClick={limpiarEjercicio}>✕</button>
            )}
          </div>

          {mostrarLista && ejerciciosFiltrados.length > 0 && (
            <ul className={styles.lista}>
              {ejerciciosFiltrados.slice(0, 8).map(e => (
                <li key={e.ejercicio_id}>
                  <button className={styles.listaItem} onClick={() => seleccionarEjercicio(e)}>
                    <span className={styles.listaItemNombre}>{e.nombre}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {mostrarLista && busqueda.length > 1 && ejerciciosFiltrados.length === 0 && (
            <p className={styles.sinResultados}>Sin resultados para &quot;{busqueda}&quot;</p>
          )}
        </div>

        {ejercicioId && (
          <div className={styles.serieIndicador}>
            Serie {numeroSerie} — {ejercicioSeleccionado?.nombre}
          </div>
        )}

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

        <button
          className={styles.btn}
          onClick={guardar}
          disabled={loading || !ejercicioId || !usuarioId}
        >
          {loading ? 'Guardando...' : 'Guardar serie'}
        </button>
      </div>
    </main>
  )
}
