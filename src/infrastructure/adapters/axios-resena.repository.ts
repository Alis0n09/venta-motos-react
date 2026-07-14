// src/infrastructure/adapters/axios-resena.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { ResenaRepository } from '@/domain/ports/resena.repository'
import type { Resena } from '@/domain/entities/resena.entity'

export class AxiosResenaRepository implements ResenaRepository {

  async getByMoto(motoId: number): Promise<Resena[]> {
    try {
      const { data } = await apiClient.get(`/resenas/?moto=${motoId}&page_size=100`)
      return Array.isArray(data) ? data : data.results ?? []
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async create(motoId: number, rating: number, comentario: string): Promise<Resena> {
    try {
      const { data } = await apiClient.post<Resena>('/resenas/', {
        moto: motoId,
        rating,
        comentario,
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/resenas/${id}/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}