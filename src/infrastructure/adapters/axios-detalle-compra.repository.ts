// src/infrastructure/adapters/axios-detalle-compra.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { DetalleCompraRepository, DetalleCompraInput } from '@/domain/ports/detalle-compra.repository'
import type { PaginatedResult } from '@/domain/ports/crud.repository'
import type { DetalleCompra } from '@/domain/entities/detalle-compra.entity'

export class AxiosDetalleCompraRepository implements DetalleCompraRepository {
  async listByCompra(compraId: number | string): Promise<DetalleCompra[]> {
    try {
      const { data } = await apiClient.get<PaginatedResult<DetalleCompra> | DetalleCompra[]>('/detalle-compras/', {
        params: { compra: compraId, page_size: 100 },
      })
      return Array.isArray(data) ? data : data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(dto: DetalleCompraInput): Promise<DetalleCompra> {
    try {
      const { data } = await apiClient.post<DetalleCompra>('/detalle-compras/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
