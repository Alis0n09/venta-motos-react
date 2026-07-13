// src/infrastructure/adapters/axios-proveedor.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ProveedorRepository, ProveedorInput } from '@/domain/ports/proveedor.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { Proveedor } from '@/domain/entities/proveedor.entity'

export class AxiosProveedorRepository implements ProveedorRepository {
  async list(params: ListParams): Promise<PaginatedResult<Proveedor>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Proveedor>>('/proveedores/', {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: 'empresa',
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<Proveedor> {
    try {
      const { data } = await apiClient.get<Proveedor>(`/proveedores/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: ProveedorInput): Promise<Proveedor> {
    try {
      const { data } = await apiClient.post<Proveedor>('/proveedores/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number | string, dto: ProveedorInput): Promise<Proveedor> {
    try {
      const { data } = await apiClient.patch<Proveedor>(`/proveedores/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/proveedores/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
