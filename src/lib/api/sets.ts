import type { ApiResult, CrearSetDTO, CrearSesionDTO, Set, Sesion } from '@/types'

async function post<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

export async function crearSesion(dto: CrearSesionDTO) {
  return post<Sesion>('/api/sesiones', dto)
}

export async function crearSet(dto: CrearSetDTO) {
  return post<Set>('/api/sets', dto)
}

export async function getSets(sesionId: string) {
  const res = await fetch(`/api/sets?sesion_id=${sesionId}`)
  return res.json() as Promise<ApiResult<Set[]>>
}