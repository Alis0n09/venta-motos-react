// src/application/use-cases/cuota-pago.use-case.ts

import type { CuotaPagoRepository } from '@/domain/ports/cuota-pago.repository'
import type { CuotaPago } from '@/domain/entities/cuota-pago.entity'
import type { ActualizarCuotaPagoDto } from '../dtos/cuota-pago.dto'

export class CuotaPagoUseCase {
  private readonly repo: CuotaPagoRepository

  constructor(repo: CuotaPagoRepository) {
    this.repo = repo
  }

  listarPorFinanciamiento(financiamientoId: number): Promise<CuotaPago[]> {
    return this.repo.listarPorFinanciamiento(financiamientoId)
  }

  actualizar(id: number, dto: ActualizarCuotaPagoDto): Promise<CuotaPago> {
    return this.repo.actualizar(id, dto)
  }
}