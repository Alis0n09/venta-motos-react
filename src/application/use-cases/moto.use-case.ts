// src/application/use-cases/moto.use-case.ts

import type { MotoRepository } from '@/domain/ports/moto.repository'
import type { Moto } from '@/domain/entities/moto.entity'

export class MotoUseCase {
  private readonly repo: MotoRepository

  constructor(repo: MotoRepository) {
    this.repo = repo
  }

  listarDisponibles(): Promise<Moto[]> {
    return this.repo.listarDisponibles()
  }

  listarTodas(): Promise<Moto[]> {
    return this.repo.listarTodas()
  }
}