// src/domain/ports/moto.repository.ts

import type { Moto } from '../entities/moto.entity'

export interface MotoRepository {
  /** Motos con estado 'disponible', para el catálogo público. */
  listarDisponibles(): Promise<Moto[]>
  /** Todas las motos, sin filtrar, para selects de administración. */
  listarTodas(): Promise<Moto[]>
}