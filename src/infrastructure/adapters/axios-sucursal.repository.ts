// src/infrastructure/adapters/axios-sucursal.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { SucursalRepository, SucursalInput } from '@/domain/ports/sucursal.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { Sucursal } from '@/domain/entities/sucursal.entity'

export class AxiosSucursalRepository implements SucursalRepository {
  async list(params: ListParams): Promise<PaginatedResult<Sucursal>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Sucursal>>('/sucursales/', {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: 'nombre',
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<Sucursal> {
    try {
      const { data } = await apiClient.get<Sucursal>(`/sucursales/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: SucursalInput): Promise<Sucursal> {
    try {
      const { data } = await apiClient.post<Sucursal>('/sucursales/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number | string, dto: SucursalInput): Promise<Sucursal> {
    try {
      const { data } = await apiClient.patch<Sucursal>(`/sucursales/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/sucursales/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
