// src/infrastructure/adapters/axios-categoria.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { CategoriaRepository } from '@/domain/ports/categoria.repository'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { CrearCategoriaDto, ActualizarCategoriaDto } from '@/application/dtos/categoria.dto'

function extraerResultados<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

export class AxiosCategoriaRepository implements CategoriaRepository {
  async listar(): Promise<Categoria[]> {
    try {
      const { data } = await apiClient.get('/categorias/?page_size=100')
      return extraerResultados<Categoria>(data)
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async crear(dto: CrearCategoriaDto): Promise<Categoria> {
    try {
      const { data } = await apiClient.post<Categoria>('/categorias/', dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async actualizar(id: number, dto: ActualizarCategoriaDto): Promise<Categoria> {
    try {
      const { data } = await apiClient.patch<Categoria>(`/categorias/${id}/`, dto)
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await apiClient.delete(`/categorias/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}