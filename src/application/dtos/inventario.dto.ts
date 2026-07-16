// src/application/dtos/inventario.dto.ts

import { z } from 'zod'

/**
 * Replica las validaciones del backend (/api/inventario/):
 * - moto: FK requerida (id > 0, seleccionada en el Autocomplete)
 * - sucursal: FK requerida (id > 0, seleccionada en el Select)
 * - cantidad: entero >= 0, requerido
 * - ubicacion_bodega: opcional
 */
export const inventarioFormSchema = z.object({
  moto: z.number({ message: 'Selecciona una moto' }).int().positive('Selecciona una moto'),
  sucursal: z.number({ message: 'Selecciona una sucursal' }).int().positive('Selecciona una sucursal'),
  cantidad: z.coerce
    .number({ message: 'La cantidad es obligatoria' })
    .int('La cantidad debe ser un número entero')
    .min(0, 'La cantidad debe ser mayor o igual a 0'),
  ubicacion_bodega: z.string().trim(),
})

export type InventarioFormValues = z.infer<typeof inventarioFormSchema>
