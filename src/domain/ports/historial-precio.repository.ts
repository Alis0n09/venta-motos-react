import type { HistorialPrecio, HistorialPrecioStats } from '../entities/historial-precio.entity'
import type { PaginatedResponse } from '../entities/pagination.entity'

export interface HistorialPrecioFilters {
  moto?: string
  page?: number
  page_size?: number
}

export interface HistorialPrecioRepository {
  getAll(filters: HistorialPrecioFilters): Promise<PaginatedResponse<HistorialPrecio>>
  getStats(): Promise<HistorialPrecioStats>
}