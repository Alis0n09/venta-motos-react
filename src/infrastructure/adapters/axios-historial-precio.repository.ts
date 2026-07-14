import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { HistorialPrecioRepository, HistorialPrecioFilters } from '@/domain/ports/historial-precio.repository'
import type { HistorialPrecio, HistorialPrecioStats } from '@/domain/entities/historial-precio.entity'
import type { PaginatedResponse } from '@/domain/entities/pagination.entity'

export class AxiosHistorialPrecioRepository implements HistorialPrecioRepository {

  async getAll(filters: HistorialPrecioFilters): Promise<PaginatedResponse<HistorialPrecio>> {
    try {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', String(filters.page))
      if (filters.page_size) params.set('page_size', String(filters.page_size))
      if (filters.moto) params.set('moto', filters.moto)

      const { data } = await apiClient.get(`/historial-precios/?${params}`)
      if (Array.isArray(data)) {
        return { count: data.length, next: null, previous: null, results: data }
      }
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getStats(): Promise<HistorialPrecioStats> {
    try {
      const { data } = await apiClient.get('/historial-precios/stats/')
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}