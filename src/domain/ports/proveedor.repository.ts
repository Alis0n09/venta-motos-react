// src/domain/ports/proveedor.repository.ts

import type { Proveedor } from '../entities/proveedor.entity'
import type { CrudRepository } from './crud.repository'

/** Datos aceptados al crear/editar un proveedor (sin id). */
export interface ProveedorInput {
  empresa: string
  contacto: string
  correo: string
  pais: string
}

/**
 * Contrato de acceso a datos de Proveedor.
 * Implementado por infrastructure/adapters/axios-proveedor.repository.ts
 */
export type ProveedorRepository = CrudRepository<Proveedor, ProveedorInput, ProveedorInput>
