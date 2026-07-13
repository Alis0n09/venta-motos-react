// src/domain/ports/moto.repository.ts

import type { Moto, Marca, Categoria } from '../entities/moto.entity'
import type { PaginatedResponse } from '../entities/pagination.entity'

export interface MotoFilters {
  search?: string
  marca?: string
  categoria?: string
  estado?: string
  precio_min?: number
  precio_max?: number
  ordering?: string
  page?: number
  page_size?: number
}

export interface MotoRepository {
  getAll(filters: MotoFilters): Promise<PaginatedResponse<Moto>>
  getById(id: number): Promise<Moto>
  create(data: FormData): Promise<Moto>
  update(id: number, data: FormData): Promise<Moto>
  delete(id: number): Promise<void>
  getMarcas(): Promise<Marca[]>
  getCategorias(): Promise<Categoria[]>
}