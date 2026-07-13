// src/application/use-cases/historial-cliente.use-case.ts

import type { HistorialClienteRepository } from '@/domain/ports/historial-cliente.repository'
import type { HistorialCliente } from '@/domain/entities/historial-cliente.entity'

export class HistorialClienteUseCase {
  private readonly repo: HistorialClienteRepository

  constructor(repo: HistorialClienteRepository) {
    this.repo = repo
  }

  listarMiHistorial(): Promise<HistorialCliente[]> {
    return this.repo.listarMiHistorial()
  }
}