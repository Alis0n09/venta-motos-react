// src/domain/ports/financiamiento.repository.ts

import type { Financiamiento } from '../entities/financiamiento.entity'
import type {
  CrearFinanciamientoDto, ActualizarFinanciamientoDto, AprobarFinanciamientoDto,
} from '@/application/dtos/financiamiento.dto'

export interface FinanciamientoRepository {
  listarTodos(): Promise<Financiamiento[]>
  listarPorVenta(ventaId: number): Promise<Financiamiento[]>
  crear(dto: CrearFinanciamientoDto): Promise<Financiamiento>
  actualizar(id: number, dto: ActualizarFinanciamientoDto): Promise<Financiamiento>
  eliminar(id: number): Promise<void>
  /** El admin aprueba una solicitud pendiente, fijando la tasa de interés (queda 'activo'). */
  aprobar(id: number, dto: AprobarFinanciamientoDto): Promise<Financiamiento>
  /** El admin rechaza una solicitud de financiamiento pendiente (queda 'cancelado'). */
  rechazar(id: number): Promise<Financiamiento>
}