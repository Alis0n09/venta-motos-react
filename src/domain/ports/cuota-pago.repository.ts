// src/domain/ports/cuota-pago.repository.ts

import type { CuotaPago } from '../entities/cuota-pago.entity'
import type { ActualizarCuotaPagoDto } from '@/application/dtos/cuota-pago.dto'

export interface CuotaPagoRepository {
  listarPorFinanciamiento(financiamientoId: number): Promise<CuotaPago[]>
  actualizar(id: number, dto: ActualizarCuotaPagoDto): Promise<CuotaPago>
}