// src/application/dtos/direccion.dto.ts

import { z } from 'zod'

/**
 * Replica las validaciones del backend (/api/direcciones/):
 * - cliente: FK requerida
 * - calle: requerida, no vacía
 * - ciudad: requerida, no vacía
 * - provincia: requerida
 * - principal: booleano
 */
export const direccionFormSchema = z.object({
  cliente: z.number({ message: 'Selecciona un cliente' }).int().positive('Selecciona un cliente'),
  calle: z.string().trim().min(1, 'La calle es obligatoria'),
  ciudad: z.string().trim().min(1, 'La ciudad es obligatoria'),
  provincia: z.string().trim().min(1, 'La provincia es obligatoria'),
  principal: z.boolean(),
})

export type DireccionFormValues = z.infer<typeof direccionFormSchema>
