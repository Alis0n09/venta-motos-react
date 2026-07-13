// src/domain/entities/sucursal-staff.entity.ts

export interface SucursalStaff {
  id: number
  staff: number
  /** Calculado por el backend. */
  staff_nombre: string
  sucursal: number
  /** Calculado por el backend. */
  sucursal_nombre: string
  /** La pone el backend al crear (auto_now_add); no se envía. */
  fecha_asignacion: string
}
