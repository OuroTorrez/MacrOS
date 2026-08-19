import type { ApiResult, CrearSplitConfiguradoDTO, SplitConfigurado } from '@/types'

export async function getSplits(): Promise<ApiResult<SplitConfigurado[]>> {
  const response = await fetch('/api/splits')
  return response.json()
}

export async function crearSplit(body: CrearSplitConfiguradoDTO) {
  const response = await fetch('/api/splits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}
