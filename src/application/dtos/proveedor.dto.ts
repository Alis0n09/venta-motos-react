// src/application/dtos/proveedor.dto.ts

import { z } from 'zod'

/**
 * Replica las validaciones del backend (/api/proveedores/):
 * - empresa: requerido, no vacío
 * - contacto: opcional
 * - correo: opcional, debe contener "@" si se envía
 * - pais: opcional
 */
export const proveedorFormSchema = z.object({
  empresa: z.string().trim().min(1, 'La empresa es obligatoria'),
  contacto: z.string().trim(),
  correo: z.string().trim().refine((value) => value === '' || value.includes('@'), {
    message: 'El correo debe contener "@"',
  }),
  pais: z.string().trim(),
})

export type ProveedorFormValues = z.infer<typeof proveedorFormSchema>
