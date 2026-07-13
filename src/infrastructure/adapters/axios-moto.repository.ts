// src/infrastructure/adapters/axios-moto.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { MotoRepository, MotoOption } from '@/domain/ports/moto.repository'
import type { PaginatedResult } from '@/domain/ports/crud.repository'
import type { Moto } from '@/domain/entities/moto.entity'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosMotoRepository implements MotoRepository {
  async search(term: string): Promise<MotoOption[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<MotoOption> | MotoOption[]>('/motos/', {
        params: { search: term },
      })
      return Array.isArray(data) ? data : data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<MotoOption> {
    try {
      const { data } = await apiClient.get<MotoOption>(`/motos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listarDisponibles(): Promise<Moto[]> {
    try {
      // El backend no filtra por 'estado' en este endpoint, así que se filtra aquí.
      const { data } = await apiClient.get('/motos/?page_size=100')
      const todas = extraerResultados<Moto>(data)
      return todas.filter((m) => m.estado === 'disponible')
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listarTodas(): Promise<Moto[]> {
    try {
      const { data } = await apiClient.get('/motos/?page_size=200')
      return extraerResultados<Moto>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
