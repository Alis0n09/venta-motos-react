import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { GarantiaRepository } from '@/domain/ports/garantia.repository'
import type { Garantia } from '@/domain/entities/garantia.entity'
import type { CreateGarantiaDto, UpdateGarantiaDto } from '@/application/dtos/garantia.dto'
import type { PaginatedResponse } from '@/domain/entities/pagination.entity'

export class AxiosGarantiaRepository implements GarantiaRepository {

  async getAll(): Promise<PaginatedResponse<Garantia>> {
    try {
      const { data } = await apiClient.get('/garantias/?page_size=100')
      if (Array.isArray(data)) {
        return { count: data.length, next: null, previous: null, results: data }
      }
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getByVenta(ventaId: number): Promise<Garantia[]> {
    try {
      const { data } = await apiClient.get(`/garantias/?venta=${ventaId}&page_size=100`)
      return Array.isArray(data) ? data : data.results ?? []
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: CreateGarantiaDto): Promise<Garantia> {
    try {
      const { data } = await apiClient.post<Garantia>('/garantias/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, dto: UpdateGarantiaDto): Promise<Garantia> {
    try {
      const { data } = await apiClient.patch<Garantia>(`/garantias/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/garantias/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}