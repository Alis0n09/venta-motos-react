// src/infrastructure/adapters/axios-moto.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { MotoRepository, MotoOption } from '@/domain/ports/moto.repository'
import type { PaginatedResult } from '@/domain/ports/crud.repository'

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
}
