// src/infrastructure/factories/sucursal-staff.factory.ts
import { AxiosSucursalStaffRepository } from '@/infrastructure/adapters/axios-sucursal-staff.repository'

/**
 * Instancia única del repositorio de SucursalStaff. El resto de la app
 * importa `sucursalStaffRepository` y nunca instancia
 * AxiosSucursalStaffRepository directamente.
 */
export const sucursalStaffRepository = new AxiosSucursalStaffRepository()
