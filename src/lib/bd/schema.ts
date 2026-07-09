import Dexie, { type EntityTable } from 'dexie'
import type { Ejercicio, Sesion, Set, PR } from '@/types'

// Extendemos Dexie tipando cada tabla con su interface correspondiente.
// EntityTable<T, K> = tabla de registros tipo T con llave primaria tipo K.
class GymDB extends Dexie {
  ejercicios!: EntityTable<Ejercicio, 'id'>
  sesiones!:   EntityTable<Sesion,    'id'>
  sets!:       EntityTable<Set,       'id'>
  prs!:        EntityTable<PR,        'id'>

  constructor() {
    super('gym-tracker')

    // Solo indexamos los campos que necesitamos buscar o filtrar.
    // Los demás campos de la interface existen en el objeto pero no como índices
    // (indexar todo tiene costo de escritura — evítalo).
    // '&' = llave primaria única.
    this.version(1).stores({
      ejercicios: '&id, nombre, grupo_muscular',
      sesiones:   '&id, fecha',
      sets:       '&id, sesion_id, ejercicio_id, es_pr',
      prs:        '&id, ejercicio_id, fecha',
    })
  }
}

// Singleton — una sola instancia de la DB en toda la app.
// El guard de typeof window evita que Dexie corra en el servidor de Next.js:
// los Route Handlers y RSC corren en Node donde IndexedDB no existe.
export const db = typeof window !== 'undefined' ? new GymDB() : undefined;

export { db }
export type { GymDB }