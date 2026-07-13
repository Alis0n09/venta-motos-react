// src/infrastructure/adapters/axios-sucursal-staff.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { ApiException } from '@/domain/exceptions/api.exception'
import type {
  SucursalStaffRepository, SucursalStaffInput, StaffOption,
} from '@/domain/ports/sucursal-staff.repository'
import type { ListParams, PaginatedResult } from '@/domain/ports/crud.repository'
import type { SucursalStaff } from '@/domain/entities/sucursal-staff.entity'

/**
 * staff+sucursal es único en el backend. Ante un 400 de unicidad, DRF
 * responde con `non_field_errors` (no queda en fieldErrors), así que aquí se
 * traduce a un error de campo para que FormDialog lo muestre junto al select
 * de sucursal en lugar de perderse como error genérico.
 */
function toSucursalStaffError(err: unknown): ApiException {
  const apiErr = parseApiError(err)
  const isDuplicate = apiErr.status === 400 && !apiErr.fieldErrors && /unique/i.test(apiErr.detail)
  if (isDuplicate) {
    return new ApiException(apiErr.status, apiErr.detail, {
      sucursal: ['Este miembro del staff ya está asignado a esta sucursal.'],
    })
  }
  return apiErr
}

export class AxiosSucursalStaffRepository implements SucursalStaffRepository {
  async list(params: ListParams): Promise<PaginatedResult<SucursalStaff>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<SucursalStaff>>('/sucursal-staff/', {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: 'id',
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number | string): Promise<SucursalStaff> {
    try {
      const { data } = await apiClient.get<SucursalStaff>(`/sucursal-staff/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: SucursalStaffInput): Promise<SucursalStaff> {
    try {
      const { data } = await apiClient.post<SucursalStaff>('/sucursal-staff/', dto)
      return data
    } catch (err) {
      throw toSucursalStaffError(err)
    }
  }

  async update(id: number | string, dto: SucursalStaffInput): Promise<SucursalStaff> {
    try {
      const { data } = await apiClient.patch<SucursalStaff>(`/sucursal-staff/${id}/`, dto)
      return data
    } catch (err) {
      throw toSucursalStaffError(err)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/sucursal-staff/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async searchStaff(term: string): Promise<StaffOption[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<StaffOption> | StaffOption[]>('/vendedores/', {
        params: { search: term },
      })
      return Array.isArray(data) ? data : data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
