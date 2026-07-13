// src/domain/ports/sucursal-staff.repository.ts

import type { SucursalStaff } from '../entities/sucursal-staff.entity'
import type { CrudRepository } from './crud.repository'

/** Datos aceptados al crear/editar una asignación de staff a sucursal. */
export interface SucursalStaffInput {
  staff: number
  sucursal: number
}

/**
 * Resultado resumido de un miembro de staff, usado por el buscador del
 * formulario. Viene del endpoint /api/vendedores/, que pese al nombre
 * expone TODO el staff (no solo rol "vendedor") con el id real de Staff
 * (distinto del id de Usuario, que es lo que necesita la FK `staff`).
 */
export interface StaffOption {
  id: number
  nombre: string
  apellido: string
  cedula: string
  rol: string
}

/**
 * Contrato de acceso a datos de SucursalStaff. Extiende CrudRepository con
 * searchStaff, necesario para el <Autocomplete> de staff del formulario. Para
 * el <Select> de sucursal se reutiliza SucursalRepository.
 */
export interface SucursalStaffRepository
  extends CrudRepository<SucursalStaff, SucursalStaffInput, SucursalStaffInput> {
  searchStaff(term: string): Promise<StaffOption[]>
}
