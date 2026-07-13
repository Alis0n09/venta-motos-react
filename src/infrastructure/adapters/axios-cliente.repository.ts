// src/infrastructure/adapters/axios-cliente.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ClienteRepository } from '@/domain/ports/cliente.repository'
import type { Cliente } from '@/domain/entities/cliente.entity'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosClienteRepository implements ClienteRepository {
  async listar(): Promise<Cliente[]> {
    try {
      const { data } = await apiClient.get('/clientes/?page_size=200')
      return extraerResultados<Cliente>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}