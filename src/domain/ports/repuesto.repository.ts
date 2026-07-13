// src/domain/ports/repuesto.repository.ts

import type { Repuesto } from '../entities/repuesto.entity'
import type { CrudRepository } from './crud.repository'

/** Datos aceptados al crear/editar un repuesto. `marca_compatible` es opcional en el backend. */
export interface RepuestoInput {
  nombre: string
  marca_compatible?: number
  stock: number
  precio: string
}

/** Resultado resumido de una marca, usado por el <Select> del formulario. */
export interface MarcaOption {
  id: number
  nombre: string
}

/**
 * Contrato de acceso a datos de Repuesto. Extiende CrudRepository con
 * listMarcas, necesario para el <Select> de marca compatible (no hay CRUD
 * de Marca en esta parte del sistema, solo se consulta para referenciarla).
 */
export interface RepuestoRepository
  extends CrudRepository<Repuesto, RepuestoInput, RepuestoInput> {
  listMarcas(): Promise<MarcaOption[]>
}
