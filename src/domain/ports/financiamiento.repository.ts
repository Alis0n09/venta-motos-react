// src/domain/ports/financiamiento.repository.ts

import type { Financiamiento } from '../entities/financiamiento.entity'
import type {
  CrearFinanciamientoDto, ActualizarFinanciamientoDto,
} from '@/application/dtos/financiamiento.dto'

export interface FinanciamientoRepository {
  listarTodos(): Promise<Financiamiento[]>
  listarPorVenta(ventaId: number): Promise<Financiamiento[]>
  crear(dto: CrearFinanciamientoDto): Promise<Financiamiento>
  actualizar(id: number, dto: ActualizarFinanciamientoDto): Promise<Financiamiento>
  eliminar(id: number): Promise<void>
}