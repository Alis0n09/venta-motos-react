// src/domain/ports/moto.repository.ts

import type { Moto } from '../entities/moto.entity'

/** Resultado resumido de una moto, usado por buscadores/autocompletes. */
export interface MotoOption {
  id: number
  marca_nombre: string
  modelo: string
  anio: number
}

/**
 * Contrato de acceso a datos de Moto, de solo consulta: esta parte del
 * sistema no gestiona el catálogo de motos, solo las busca/consulta para
 * referenciarlas desde Inventario, Compras, Mantenimiento, Ventas y el
 * catálogo público.
 * Implementado por infrastructure/adapters/axios-moto.repository.ts
 */
export interface MotoRepository {
  /** Búsqueda por texto libre, para autocompletes (Inventario/Compras/Mantenimiento). */
  search(term: string): Promise<MotoOption[]>
  /** Una moto puntual, para resolver nombres a partir de un id (Compras). */
  getById(id: number | string): Promise<MotoOption>
  /** Motos con estado 'disponible', para el catálogo público. */
  listarDisponibles(): Promise<Moto[]>
  /** Todas las motos, sin filtrar, para selects de administración (Ventas). */
  listarTodas(): Promise<Moto[]>
}
