import Dexie, { type EntityTable } from 'dexie'
import type { Ejercicio, GrupoMuscular, Sesion, Serie, PR } from '@/types'

class GymDB extends Dexie {
  grupos_musculares!: EntityTable<GrupoMuscular, 'grupo_muscular_id'>
  ejercicios!:        EntityTable<Ejercicio,      'ejercicio_id'>
  sesiones!:          EntityTable<Sesion,          'sesion_id'>
  series!:            EntityTable<Serie,           'serie_id'>
  prs!:               EntityTable<PR,              'pr_id'>

  constructor() {
    super('gym-tracker')

    this.version(1).stores({
      grupos_musculares: '&grupo_muscular_id, nombre',
      ejercicios:        '&ejercicio_id, grupo_muscular_id, usuario_id, nombre',
      sesiones:          '&sesion_id, usuario_id, iniciado_en',
      series:            '&serie_id, sesion_id, ejercicio_id',
      prs:               '&pr_id, usuario_id, ejercicio_id, fecha',
    })
  }
}

// Guard: Dexie solo corre en el browser, nunca en el servidor de Next.js
const db = typeof window !== 'undefined' ? new GymDB() : null!

export { db }
export type { GymDB }