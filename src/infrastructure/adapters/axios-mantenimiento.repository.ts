// src/infrastructure/adapters/axios-mantenimiento.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { MantenimientoRepository, MantenimientoInput } from '@/domain/ports/mantenimiento.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { Mantenimiento } from '@/domain/entities/mantenimiento.entity'

export class AxiosMantenimientoRepository implements MantenimientoRepository {
  async list(params: ListParams): Promise<PaginatedResult<Mantenimiento>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Mantenimiento>>('/mantenimientos/', {
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

  async getById(id: number | string): Promise<Mantenimiento> {
    try {
      const { data } = await apiClient.get<Mantenimiento>(`/mantenimientos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: MantenimientoInput): Promise<Mantenimiento> {
    try {
      const { data } = await apiClient.post<Mantenimiento>('/mantenimientos/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number | string, dto: MantenimientoInput): Promise<Mantenimiento> {
    try {
      const { data } = await apiClient.patch<Mantenimiento>(`/mantenimientos/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/mantenimientos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
