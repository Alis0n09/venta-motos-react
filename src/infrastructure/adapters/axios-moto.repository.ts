// src/infrastructure/adapters/axios-moto.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { MotoRepository, MotoFilters, MotoOption } from '@/domain/ports/moto.repository'
import type { Moto, Marca, Categoria } from '@/domain/entities/moto.entity'
import type { PaginatedResponse } from '@/domain/entities/pagination.entity'

export class AxiosMotoRepository implements MotoRepository {

  async search(term: string): Promise<MotoOption[]> {
    try {
      const { data } = await apiClient.get<PaginatedResponse<MotoOption> | MotoOption[]>('/motos/', {
        params: { search: term },
      })
      return Array.isArray(data) ? data : data.results
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getByIdOption(id: number | string): Promise<MotoOption> {
    try {
      const { data } = await apiClient.get<MotoOption>(`/motos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getAll(filters: MotoFilters): Promise<PaginatedResponse<Moto>> {
    try {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', String(filters.page))
      if (filters.page_size) params.set('page_size', String(filters.page_size))
      if (filters.search) params.set('search', filters.search)
      if (filters.marca) params.set('marca', filters.marca)
      if (filters.categoria) params.set('categoria', filters.categoria)
      if (filters.estado) params.set('estado', filters.estado)
      if (filters.precio_min) params.set('precio_min', String(filters.precio_min))
      if (filters.precio_max) params.set('precio_max', String(filters.precio_max))
      if (filters.ordering) params.set('ordering', filters.ordering)

      const { data } = await apiClient.get<PaginatedResponse<Moto>>(`/motos/?${params}`)
      if (Array.isArray(data)) {
        return { count: data.length, next: null, previous: null, results: data }
      }
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getById(id: number): Promise<Moto> {
    try {
      const { data } = await apiClient.get<Moto>(`/motos/${id}/`)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(formData: FormData): Promise<Moto> {
    try {
      const { data } = await apiClient.post<Moto>('/motos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async update(id: number, formData: FormData): Promise<Moto> {
    try {
      const { data } = await apiClient.patch<Moto>(`/motos/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/motos/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getMarcas(): Promise<Marca[]> {
    try {
      const { data } = await apiClient.get('/marcas/?page_size=100')
      return Array.isArray(data) ? data : data.results ?? []
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async getCategorias(): Promise<Categoria[]> {
    try {
      const { data } = await apiClient.get('/categorias/?page_size=100')
      return Array.isArray(data) ? data : data.results ?? []
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async listarDisponibles(): Promise<Moto[]> {
    const result = await this.getAll({ page_size: 100, estado: 'disponible' })
    return result.results
  }

  async listarTodas(): Promise<Moto[]> {
    const result = await this.getAll({ page_size: 200 })
    return result.results
  }
}
