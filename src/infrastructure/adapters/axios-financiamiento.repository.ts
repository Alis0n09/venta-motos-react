// src/infrastructure/adapters/axios-financiamiento.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { FinanciamientoRepository } from '@/domain/ports/financiamiento.repository'
import type { Financiamiento } from '@/domain/entities/financiamiento.entity'
import type {
  CrearFinanciamientoDto, ActualizarFinanciamientoDto,
} from '@/application/dtos/financiamiento.dto'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosFinanciamientoRepository implements FinanciamientoRepository {
  async listarTodos(): Promise<Financiamiento[]> {
    try {
      const { data } = await apiClient.get('/financiamientos/?page_size=100')
      return extraerResultados<Financiamiento>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listarPorVenta(ventaId: number): Promise<Financiamiento[]> {
    try {
      const { data } = await apiClient.get(`/financiamientos/?venta=${ventaId}`)
      return extraerResultados<Financiamiento>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async crear(dto: CrearFinanciamientoDto): Promise<Financiamiento> {
    try {
      const { data } = await apiClient.post<Financiamiento>('/financiamientos/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async actualizar(id: number, dto: ActualizarFinanciamientoDto): Promise<Financiamiento> {
    try {
      const { data } = await apiClient.patch<Financiamiento>(`/financiamientos/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await apiClient.delete(`/financiamientos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async aprobar(id: number): Promise<Financiamiento> {
    try {
      const { data } = await apiClient.patch<Financiamiento>(`/financiamientos/${id}/aprobar/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async rechazar(id: number): Promise<Financiamiento> {
    try {
      const { data } = await apiClient.patch<Financiamiento>(`/financiamientos/${id}/rechazar/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}