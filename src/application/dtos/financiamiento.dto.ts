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