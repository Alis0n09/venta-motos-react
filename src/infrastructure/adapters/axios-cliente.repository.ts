// src/infrastructure/adapters/axios-cliente.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ClienteRepository, ClienteOption } from '@/domain/ports/cliente.repository'
import type { PaginatedResult } from '@/domain/ports/crud.repository'
import type { Cliente } from '@/domain/entities/cliente.entity'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosClienteRepository implements ClienteRepository {
  async search(term: string): Promise<ClienteOption[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<ClienteOption> | ClienteOption[]>('/clientes/', {
        params: { search: term },
      })
      return Array.isArray(data) ? data : data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<ClienteOption> {
    try {
      const { data } = await apiClient.get<ClienteOption>(`/clientes/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listar(): Promise<Cliente[]> {
    try {
      const { data } = await apiClient.get('/clientes/?page_size=200')
      return extraerResultados<Cliente>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
