// src/application/dtos/financiamiento.dto.ts

import type { EstadoFinanciamiento } from '@/domain/entities/financiamiento.entity'

export interface CrearFinanciamientoDto {
  venta: number
  monto_financiado: string
  tasa_interes: string
  plazo_meses: number
  fecha_inicio: string
  fecha_fin: string
  estado: EstadoFinanciamiento
}

export type ActualizarFinanciamientoDto = Partial<CrearFinanciamientoDto>

/** El admin fija la tasa de interés al aprobar una solicitud pendiente del cliente. */
export interface AprobarFinanciamientoDto {
  tasa_interes: number
}