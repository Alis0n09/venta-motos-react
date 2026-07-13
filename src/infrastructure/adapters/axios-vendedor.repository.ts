// src/infrastructure/adapters/axios-vendedor.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { VendedorRepository } from '@/domain/ports/vendedor.repository'
import type { Vendedor } from '@/domain/entities/cliente.entity'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosVendedorRepository implements VendedorRepository {
  async listar(): Promise<Vendedor[]> {
    try {
      const { data } = await apiClient.get('/vendedores/?page_size=200')
      return extraerResultados<Vendedor>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}