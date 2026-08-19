'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearSplit, getSplits } from '@/lib/api/splits'
import { getEjercicios } from '@/lib/api/series'
import type { CrearSplitConfiguradoDTO, Ejercicio, SplitConfigurado } from '@/types'
import styles from './page.module.css'

type Fila = CrearSplitConfiguradoDTO['ejercicios'][number]

const filaNueva = (ejercicioId: number): Fila => ({
  ejercicio_id: ejercicioId,
  series_objetivo: 3,
  reps_objetivo: 10,
  descanso_seg: 90,
})

export default function SplitsPage() {
  const router = useRouter()
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [splits, setSplits] = useState<SplitConfigurado[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [filas, setFilas] = useState<Fila[]>([])
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    Promise.all([getEjercicios(), getSplits()])
      .then(([ejerciciosResult, splitsResult]) => {
        if (ejerciciosResult.data) setEjercicios(ejerciciosResult.data)
        if (splitsResult.data) setSplits(splitsResult.data)
        if (ejerciciosResult.error || splitsResult.error) setError(ejerciciosResult.error ?? splitsResult.error ?? 'No se pudo cargar la configuración')
      })
      .catch(() => setError('No se pudo cargar la configuración'))
      .finally(() => setLoading(false))
  }, [])

  const plantillas = splits.filter(split => !split.usuario_id)
  const propios = splits.filter(split => split.usuario_id)

  function usarPlantilla(plantilla: SplitConfigurado) {
    setNombre(plantilla.nombre)
    setDescripcion(plantilla.descripcion ?? '')
    setFilas(plantilla.ejercicios.map(({ ejercicio_id, series_objetivo, reps_objetivo, descanso_seg, notas }) => ({ ejercicio_id, series_objetivo, reps_objetivo, descanso_seg, notas })))
    setError(null)
    setMensaje(`Plantilla ${plantilla.nombre} cargada. Ajusta lo necesario y guárdala como tu split.`)
  }

  function agregarEjercicio() {
    const disponible = ejercicios.find(ejercicio => !filas.some(fila => fila.ejercicio_id === ejercicio.ejercicio_id))
    if (!disponible) return setError('No hay más ejercicios disponibles para agregar.')
    setFilas(actuales => [...actuales, filaNueva(disponible.ejercicio_id)])
  }

  function actualizarFila(index: number, cambio: Partial<Fila>) {
    setFilas(actuales => actuales.map((fila, posicion) => posicion === index ? { ...fila, ...cambio } : fila))
  }

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMensaje(null)
    setGuardando(true)

    try {
      const resultado = await crearSplit({ nombre, descripcion, ejercicios: filas })
      if (resultado.error) throw new Error(resultado.error)
      setNombre('')
      setDescripcion('')
      setFilas([])
      setMensaje('Split guardado. Esta copia ya es sólo tuya.')
      router.refresh()
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo guardar el split.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p>PLANIFICACIÓN</p>
        <h1>Splits</h1>
        <span>Elige una plantilla o crea tu propia rutina.</span>
      </header>

      {loading ? <p className={styles.status}>Cargando configuración…</p> : (
        <>
          <section className={styles.templates} aria-labelledby="plantillas">
            <h2 id="plantillas">Plantillas</h2>
            <div className={styles.templateSlider} aria-label="Plantillas de split">
              {plantillas.map(plantilla => (
                <button key={plantilla.split_id} className={styles.template} type="button" onClick={() => usarPlantilla(plantilla)}>
                  <strong>{plantilla.nombre}</strong>
                  <span data-initial>{plantilla.descripcion}</span>
                  <small>{plantilla.ejercicios.length} ejercicios · usar como base</small>
                </button>
              ))}
            </div>
          </section>

          <form className={styles.form} onSubmit={guardar}>
            <div className={styles.formHeading}>
              <div><p>TU CONFIGURACIÓN</p><h2>{nombre || 'Nuevo split'}</h2></div>
              <button className={styles.add} type="button" onClick={agregarEjercicio}>+ Ejercicio</button>
            </div>

            <label className={styles.label}>
              Nombre
              <input className={styles.input} value={nombre} onChange={event => setNombre(event.target.value)} placeholder="Ej. Torso A" maxLength={100} required />
            </label>
            <label className={styles.label}>
              Descripción <span>(opcional)</span>
              <input className={styles.input} value={descripcion} onChange={event => setDescripcion(event.target.value)} placeholder="Enfoque y objetivo del día" />
            </label>

            <div className={styles.exerciseList}>
              <div className={styles.listTitle} aria-hidden="true">
                <span />
                <span>Ejercicio</span>
                <span>Series</span>
                <span>Reps</span>
                <span>Descanso (s)</span>
                <span />
              </div>
              {filas.map((fila, index) => (
                <div className={styles.exerciseRow} key={`${fila.ejercicio_id}-${index}`}>
                  <span className={styles.order}>{index + 1}</span>
                  <select className={styles.select} value={fila.ejercicio_id} onChange={event => actualizarFila(index, { ejercicio_id: Number(event.target.value) })}>
                    {ejercicios.map(ejercicio => <option key={ejercicio.ejercicio_id} value={ejercicio.ejercicio_id} disabled={filas.some((otra, posicion) => posicion !== index && otra.ejercicio_id === ejercicio.ejercicio_id)}>{ejercicio.nombre}</option>)}
                  </select>
                  <input aria-label="Series" className={styles.number} type="number" min="1" max="20" value={fila.series_objetivo} onChange={event => actualizarFila(index, { series_objetivo: Number(event.target.value) })} />
                  <input aria-label="Repeticiones" className={styles.number} type="number" min="1" max="100" value={fila.reps_objetivo} onChange={event => actualizarFila(index, { reps_objetivo: Number(event.target.value) })} />
                  <input aria-label="Descanso en segundos" className={styles.number} type="number" min="0" max="1800" value={fila.descanso_seg} onChange={event => actualizarFila(index, { descanso_seg: Number(event.target.value) })} />
                  <button className={styles.remove} type="button" onClick={() => setFilas(actuales => actuales.filter((_, posicion) => posicion !== index))} aria-label={`Quitar ejercicio ${index + 1}`}>×</button>
                </div>
              ))}
              {filas.length === 0 && <p className={styles.empty}>Agrega ejercicios o selecciona una plantilla para empezar.</p>}
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {mensaje && <p className={styles.message}>{mensaje}</p>}
            <button className={styles.save} disabled={guardando || filas.length === 0} type="submit">{guardando ? 'Guardando…' : 'Guardar mi split'}</button>
          </form>

          {propios.length > 0 && <section className={styles.own}><h2>Mis splits</h2>{propios.map(split => <p key={split.split_id}>{split.nombre}<span>{split.ejercicios.length} ejercicios</span></p>)}</section>}
        </>
      )}
    </main>
  )
}
