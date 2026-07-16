// src/application/dtos/repuesto.dto.ts

import { z } from 'zod'

/**
 * Replica las validaciones del backend (/api/repuestos/):
 * - nombre: requerido, no vacío
 * - marca_compatible: FK opcional (0 = no seleccionada, se omite del payload)
 * - stock: entero >= 0, requerido
 * - precio: decimal >= 0, requerido
 */
export const repuestoFormSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  marca_compatible: z.number().int().nonnegative('Selecciona una marca válida'),
  stock: z.coerce
    .number({ message: 'El stock es obligatorio' })
    .int('El stock debe ser un número entero')
    .nonnegative('El stock debe ser mayor o igual a 0'),
  precio: z.coerce
    .number({ message: 'El precio es obligatorio' })
    .nonnegative('El precio debe ser mayor o igual a 0'),
})

export type RepuestoFormValues = z.infer<typeof repuestoFormSchema>
