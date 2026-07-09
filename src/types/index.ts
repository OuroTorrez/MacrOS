// ─── Unidades ────────────────────────────────────────────────────────────────
// Preferencia global del usuario. Se guarda en Zustand y persiste en localStorage.
export type Unidad = 'kg' | 'lbs'

// ─── Ejercicio ────────────────────────────────────────────────────────────────
export type GrupoMuscular =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'piernas'
  | 'gluteos'
  | 'core'
  | 'cardio'
  | 'otro'

export interface Ejercicio {
  id: string
  nombre: string
  grupo_muscular: GrupoMuscular
  notas_forma?: string       // cues técnicos del ejercicio
  creado_en: string          // ISO 8601
}

// ─── Sesión ───────────────────────────────────────────────────────────────────
export interface Sesion {
  id: string
  fecha: string              // YYYY-MM-DD — string evita problemas de timezone
  notas_generales?: string
  duracion_min?: number
  creado_en: string
}

// ─── Set ──────────────────────────────────────────────────────────────────────
export interface Set {
  id: string
  sesion_id: string
  ejercicio_id: string
  numero_set: number         // 1, 2, 3... dentro del ejercicio en esa sesión
  reps: number
  peso_kg: number            // SIEMPRE en kg internamente — la UI convierte al mostrar
  notas?: string
  es_pr: boolean             // calculado por el server al guardar
  creado_en: string
}

// ─── PR ───────────────────────────────────────────────────────────────────────
export interface PR {
  id: string
  ejercicio_id: string
  peso_kg: number
  reps: number               // con cuántas reps se logró
  sesion_id: string
  set_id: string
  fecha: string
}

// ─── DTOs para Route Handlers ─────────────────────────────────────────────────
// Lo que el cliente envía al API — sin id ni campos calculados por el server
export type CrearSetDTO       = Omit<Set,       'id' | 'es_pr' | 'creado_en'>
export type CrearSesionDTO    = Omit<Sesion,    'id' | 'creado_en'>
export type CrearEjercicioDTO = Omit<Ejercicio, 'id' | 'creado_en'>

// ─── Respuestas de API ────────────────────────────────────────────────────────
export interface ApiResponse<T> { data: T; error?: never }
export interface ApiError       { data?: never; error: string }
export type ApiResult<T>        = ApiResponse<T> | ApiError