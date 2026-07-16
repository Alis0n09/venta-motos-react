// src/application/use-cases/financiamiento.use-case.ts

import type { FinanciamientoRepository } from '@/domain/ports/financiamiento.repository'
import type { Financiamiento } from '@/domain/entities/financiamiento.entity'
import type { CrearFinanciamientoDto, ActualizarFinanciamientoDto } from '../dtos/financiamiento.dto'

export class FinanciamientoUseCase {
  private readonly repo: FinanciamientoRepository

  constructor(repo: FinanciamientoRepository) {
    this.repo = repo
  }

  listarTodos(): Promise<Financiamiento[]> {
    return this.repo.listarTodos()
  }

  listarPorVenta(ventaId: number): Promise<Financiamiento[]> {
    return this.repo.listarPorVenta(ventaId)
  }

  crear(dto: CrearFinanciamientoDto): Promise<Financiamiento> {
    return this.repo.crear(dto)
  }

  actualizar(id: number, dto: ActualizarFinanciamientoDto): Promise<Financiamiento> {
    return this.repo.actualizar(id, dto)
  }

  eliminar(id: number): Promise<void> {
    return this.repo.eliminar(id)
  }

  aprobar(id: number): Promise<Financiamiento> {
    return this.repo.aprobar(id)
  }

  rechazar(id: number): Promise<Financiamiento> {
    return this.repo.rechazar(id)
  }
}