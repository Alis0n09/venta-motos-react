// src/application/use-cases/resena.use-case.ts

import type { ResenaRepository } from '@/domain/ports/resena.repository'
import type { CreateResenaDto } from '../dtos/resena.dto'

export class ResenaUseCase {
  private readonly repo: ResenaRepository

  constructor(repo: ResenaRepository) {
    this.repo = repo
  }

  getByMoto(motoId: number) {
    return this.repo.getByMoto(motoId)
  }

  create(dto: CreateResenaDto) {
    return this.repo.create(dto.moto, dto.rating, dto.comentario)
  }

  delete(id: number) {
    return this.repo.delete(id)
  }
}