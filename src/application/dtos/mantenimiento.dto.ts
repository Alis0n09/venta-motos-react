// src/application/dtos/mantenimiento.dto.ts

import { z } from 'zod'

/**
 * Replica las validaciones del backend (/api/mantenimientos/):
 * - moto: FK requerida
 * - cliente: FK opcional (0 = no seleccionado, se omite del payload)
 * - fecha: requerida
 * - tipo: requerido, no vacío
 * - costo: decimal >= 0, requerido
 */
export const mantenimientoFormSchema = z.object({
  moto: z.number({ message: 'Selecciona una moto' }).int().positive('Selecciona una moto'),
  cliente: z.number().int().nonnegative('Selecciona un cliente válido'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  tipo: z.string().trim().min(1, 'El tipo es obligatorio'),
  costo: z.coerce
    .number({ message: 'El costo es obligatorio' })
    .nonnegative('El costo debe ser mayor o igual a 0'),
})

export type MantenimientoFormValues = z.infer<typeof mantenimientoFormSchema>
