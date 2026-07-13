// src/application/use-cases/cliente.use-case.ts

import type { ClienteRepository } from '@/domain/ports/cliente.repository'
import type { Cliente } from '@/domain/entities/cliente.entity'

export class ClienteUseCase {
  private readonly repo: ClienteRepository

  constructor(repo: ClienteRepository) {
    this.repo = repo
  }

  listar(): Promise<Cliente[]> {
    return this.repo.listar()
  }
}