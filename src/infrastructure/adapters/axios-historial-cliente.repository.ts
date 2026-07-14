// src/infrastructure/adapters/axios-historial-cliente.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { HistorialClienteRepository } from '@/domain/ports/historial-cliente.repository'
import type { HistorialCliente } from '@/domain/entities/historial-cliente.entity'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosHistorialClienteRepository implements HistorialClienteRepository {
  async listarMiHistorial(): Promise<HistorialCliente[]> {
    try {
      const { data } = await apiClient.get('/historial-cliente/mi-historial/?page_size=100')
      return extraerResultados<HistorialCliente>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}