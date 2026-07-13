// src/infrastructure/adapters/axios-compra.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { CompraRepository, CompraInput } from '@/domain/ports/compra.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { Compra } from '@/domain/entities/compra.entity'

export class AxiosCompraRepository implements CompraRepository {
  async list(params: ListParams): Promise<PaginatedResult<Compra>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Compra>>('/compras/', {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: '-fecha',
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<Compra> {
    try {
      const { data } = await apiClient.get<Compra>(`/compras/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: CompraInput): Promise<Compra> {
    try {
      const { data } = await apiClient.post<Compra>('/compras/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/compras/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
