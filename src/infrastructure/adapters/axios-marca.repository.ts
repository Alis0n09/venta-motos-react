// src/infrastructure/adapters/axios-marca.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { MarcaRepository } from '@/domain/ports/marca.repository'
import type { Marca } from '@/domain/entities/marca.entity'
import type { CrearMarcaDto, ActualizarMarcaDto } from '@/application/dtos/marca.dto'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosMarcaRepository implements MarcaRepository {
  async listar(): Promise<Marca[]> {
    try {
      const { data } = await apiClient.get('/marcas/?page_size=100')
      return extraerResultados<Marca>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async crear(dto: CrearMarcaDto): Promise<Marca> {
    try {
      const { data } = await apiClient.post<Marca>('/marcas/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async actualizar(id: number, dto: ActualizarMarcaDto): Promise<Marca> {
    try {
      const { data } = await apiClient.patch<Marca>(`/marcas/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await apiClient.delete(`/marcas/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}