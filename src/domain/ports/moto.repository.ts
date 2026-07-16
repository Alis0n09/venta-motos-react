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

/** Resultado resumido de una moto, usado por buscadores/autocompletes. */
export interface MotoOption {
  id: number
  marca_nombre: string
  modelo: string
  anio: number
}

/**
 * Contrato de acceso a datos de Moto: catálogo completo (CRUD + filtros,
 * usado por administración de Motos y el catálogo público) más un modo
 * ligero de búsqueda por autocompletes (usado por Inventario/Compras/
 * Mantenimiento, que solo necesitan id/marca/modelo/año, no el objeto Moto
 * completo — por eso getByIdOption existe aparte de getById).
 * Implementado por infrastructure/adapters/axios-moto.repository.ts
 */
export interface MotoRepository {
  /** Búsqueda por texto libre, para autocompletes (Inventario/Compras/Mantenimiento). */
  search(term: string): Promise<MotoOption[]>
  /** Una moto puntual resumida, para resolver nombres a partir de un id (Compras). */
  getByIdOption(id: number | string): Promise<MotoOption>

  /** Listado paginado con filtros, para la administración de Motos. */
  getAll(filters: MotoFilters): Promise<PaginatedResponse<Moto>>
  /** Una moto completa, para el detalle del catálogo público y edición en admin. */
  getById(id: number): Promise<Moto>
  create(data: FormData): Promise<Moto>
  update(id: number, data: FormData): Promise<Moto>
  delete(id: number): Promise<void>
  getMarcas(): Promise<Marca[]>
  getCategorias(): Promise<Categoria[]>
  /** Motos con estado 'disponible', para el catálogo público. */
  listarDisponibles(): Promise<Moto[]>
  /** Todas las motos, sin filtrar, para selects de administración (Ventas). */
  listarTodas(): Promise<Moto[]>
}
