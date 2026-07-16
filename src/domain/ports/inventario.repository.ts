// src/domain/ports/inventario.repository.ts

import type { Inventario } from '../entities/inventario.entity'
import type { CrudRepository } from './crud.repository'

/** Datos aceptados al crear/editar un registro de inventario. */
export interface InventarioInput {
  moto: number
  sucursal: number
  cantidad: number
  ubicacion_bodega: string
}

/**
 * Contrato de acceso a datos de Inventario. Para el <Autocomplete> de motos
 * del formulario se reutiliza MotoRepository, y para el <Select> de
 * sucursales se reutiliza SucursalRepository.
 */
export type InventarioRepository = CrudRepository<Inventario, InventarioInput, InventarioInput>
