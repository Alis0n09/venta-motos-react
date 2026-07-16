// src/domain/ports/sucursal.repository.ts

import type { Sucursal } from '../entities/sucursal.entity'
import type { CrudRepository } from './crud.repository'

/** Datos aceptados al crear/editar una sucursal. */
export interface SucursalInput {
  nombre: string
  direccion: string
  ciudad: string
  telefono: string
}

/**
 * Contrato de acceso a datos de Sucursal.
 * Implementado por infrastructure/adapters/axios-sucursal.repository.ts
 */
export type SucursalRepository = CrudRepository<Sucursal, SucursalInput, SucursalInput>
