// src/application/dtos/cuota-pago.dto.ts

import type { EstadoCuota } from '@/domain/entities/cuota-pago.entity'

export interface ActualizarCuotaPagoDto {
  estado: EstadoCuota
  fecha_pago: string | null
}