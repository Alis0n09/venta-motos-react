// src/infrastructure/adapters/axios-direccion.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { DireccionRepository, DireccionInput } from '@/domain/ports/direccion.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { Direccion } from '@/domain/entities/direccion.entity'

export class AxiosDireccionRepository implements DireccionRepository {
  async list(params: ListParams): Promise<PaginatedResult<Direccion>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Direccion>>('/direcciones/', {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: 'ciudad',
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<Direccion> {
    try {
      const { data } = await apiClient.get<Direccion>(`/direcciones/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: DireccionInput): Promise<Direccion> {
    try {
      const { data } = await apiClient.post<Direccion>('/direcciones/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number | string, dto: DireccionInput): Promise<Direccion> {
    try {
      const { data } = await apiClient.patch<Direccion>(`/direcciones/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/direcciones/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
