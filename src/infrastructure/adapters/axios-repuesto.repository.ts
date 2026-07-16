// src/infrastructure/adapters/axios-repuesto.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { RepuestoRepository, RepuestoInput, MarcaOption } from '@/domain/ports/repuesto.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { Repuesto } from '@/domain/entities/repuesto.entity'

export class AxiosRepuestoRepository implements RepuestoRepository {
  async list(params: ListParams): Promise<PaginatedResult<Repuesto>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Repuesto>>('/repuestos/', {
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

  async getById(id: number | string): Promise<Repuesto> {
    try {
      const { data } = await apiClient.get<Repuesto>(`/repuestos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: RepuestoInput): Promise<Repuesto> {
    try {
      const { data } = await apiClient.post<Repuesto>('/repuestos/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number | string, dto: RepuestoInput): Promise<Repuesto> {
    try {
      const { data } = await apiClient.patch<Repuesto>(`/repuestos/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/repuestos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listMarcas(): Promise<MarcaOption[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<MarcaOption> | MarcaOption[]>('/marcas/', {
        params: { page_size: 100 },
      })
      return Array.isArray(data) ? data : data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
