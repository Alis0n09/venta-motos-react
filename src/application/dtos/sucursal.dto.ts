// src/application/dtos/sucursal.dto.ts

import { z } from 'zod'

/**
 * Replica las validaciones del backend (/api/sucursales/):
 * - nombre: requerido, no vacío
 * - direccion: requerido (el modelo no admite blank)
 * - ciudad: requerido, no vacía
 * - telefono: opcional
 */
export const sucursalFormSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre no puede estar vacío'),
  direccion: z.string().trim().min(1, 'La dirección es obligatoria'),
  ciudad: z.string().trim().min(1, 'La ciudad no puede estar vacía'),
  telefono: z.string().trim(),
})

export type SucursalFormValues = z.infer<typeof sucursalFormSchema>
