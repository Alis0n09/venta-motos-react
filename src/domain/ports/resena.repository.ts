// src/domain/ports/resena.repository.ts

import type { Resena } from '../entities/resena.entity'

export interface ResenaRepository {
  getByMoto(motoId: number): Promise<Resena[]>
  create(motoId: number, rating: number, comentario: string): Promise<Resena>
  delete(id: number): Promise<void>
}