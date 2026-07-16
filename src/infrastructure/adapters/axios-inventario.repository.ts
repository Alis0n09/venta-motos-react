// src/infrastructure/adapters/axios-inventario.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { ApiException } from '@/domain/exceptions/api.exception'
import type { InventarioRepository, InventarioInput } from '@/domain/ports/inventario.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { Inventario } from '@/domain/entities/inventario.entity'

/**
 * moto+sucursal es único en el backend. Ante un 400 de unicidad, DRF responde
 * con `non_field_errors` (no queda en fieldErrors), así que aquí se traduce
 * a un error de campo para que FormDialog lo muestre junto al select de
 * sucursal en lugar de perderse como error genérico.
 */
function toInventarioError(err: unknown): ApiException {
  const apiErr = parseApiError(err)
  const isDuplicate = apiErr.status === 400 && !apiErr.fieldErrors && /unique/i.test(apiErr.detail)
  if (isDuplicate) {
    return new ApiException(apiErr.status, apiErr.detail, {
      sucursal: ['Ya existe un registro de inventario para esta moto en esta sucursal.'],
    })
  }
  return apiErr
}

export class AxiosInventarioRepository implements InventarioRepository {
  async list(params: ListParams): Promise<PaginatedResult<Inventario>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<Inventario>>('/inventario/', {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: 'sucursal',
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<Inventario> {
    try {
      const { data } = await apiClient.get<Inventario>(`/inventario/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: InventarioInput): Promise<Inventario> {
    try {
      const { data } = await apiClient.post<Inventario>('/inventario/', dto)
      return data
    } catch (err) {
      throw toInventarioError(err)
    }
  }

  async update(id: number | string, dto: InventarioInput): Promise<Inventario> {
    try {
      const { data } = await apiClient.patch<Inventario>(`/inventario/${id}/`, dto)
      return data
    } catch (err) {
      throw toInventarioError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/inventario/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
