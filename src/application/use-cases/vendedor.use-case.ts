// src/application/use-cases/vendedor.use-case.ts

import type { VendedorRepository } from '@/domain/ports/vendedor.repository'
import type { Vendedor } from '@/domain/entities/cliente.entity'

export class VendedorUseCase {
  private readonly repo: VendedorRepository

  constructor(repo: VendedorRepository) {
    this.repo = repo
  }

  listar(): Promise<Vendedor[]> {
    return this.repo.listar()
  }
}