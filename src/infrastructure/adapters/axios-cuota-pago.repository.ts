// src/infrastructure/adapters/axios-cuota-pago.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { CuotaPagoRepository } from '@/domain/ports/cuota-pago.repository'
import type { CuotaPago } from '@/domain/entities/cuota-pago.entity'
import type { ActualizarCuotaPagoDto } from '@/application/dtos/cuota-pago.dto'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosCuotaPagoRepository implements CuotaPagoRepository {
  async listarPorFinanciamiento(financiamientoId: number): Promise<CuotaPago[]> {
    try {
      const { data } = await apiClient.get(`/cuotas-pago/?financiamiento=${financiamientoId}&page_size=100`)
      return extraerResultados<CuotaPago>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async actualizar(id: number, dto: ActualizarCuotaPagoDto): Promise<CuotaPago> {
    try {
      const { data } = await apiClient.patch<CuotaPago>(`/cuotas-pago/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}