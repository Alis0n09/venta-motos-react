// src/application/dtos/sucursal-staff.dto.ts

import { z } from 'zod'

/**
 * Replica las validaciones del backend (/api/sucursal-staff/):
 * - staff: FK requerida
 * - sucursal: FK requerida
 * (`fecha_asignacion` la pone el backend, no forma parte del formulario)
 */
export const sucursalStaffFormSchema = z.object({
  staff: z.number({ message: 'Selecciona un miembro del staff' }).int().positive('Selecciona un miembro del staff'),
  sucursal: z.number({ message: 'Selecciona una sucursal' }).int().positive('Selecciona una sucursal'),
})

export type SucursalStaffFormValues = z.infer<typeof sucursalStaffFormSchema>
