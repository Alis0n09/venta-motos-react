// src/infrastructure/adapters/axios-venta.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { VentaRepository } from '@/domain/ports/venta.repository'
import type { Venta } from '@/domain/entities/venta.entity'
import type { ComprarDto } from '@/application/dtos/comprar.dto'
import type {
  CrearVentaDto, ActualizarVentaDto, CrearDetalleVentaDto,
} from '@/application/dtos/venta.dto'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosVentaRepository implements VentaRepository {
  async comprar(dto: ComprarDto): Promise<Venta> {
    try {
      const { data } = await apiClient.post<Venta>('/ventas/comprar/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listarMisCompras(): Promise<Venta[]> {
    try {
      const { data } = await apiClient.get('/ventas/mis-compras/?page_size=100')
      return extraerResultados<Venta>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listarTodas(): Promise<Venta[]> {
    try {
      const { data } = await apiClient.get('/ventas/?page_size=100&ordering=-fecha_venta')
      return extraerResultados<Venta>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async crear(dto: CrearVentaDto): Promise<Venta> {
    try {
      const { data } = await apiClient.post<Venta>('/ventas/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async actualizar(id: number, dto: ActualizarVentaDto): Promise<Venta> {
    try {
      const { data } = await apiClient.patch<Venta>(`/ventas/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await apiClient.delete(`/ventas/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async agregarDetalle(dto: CrearDetalleVentaDto): Promise<void> {
    try {
      await apiClient.post('/detalle-ventas/', dto)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}