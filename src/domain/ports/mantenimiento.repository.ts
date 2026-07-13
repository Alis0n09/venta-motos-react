// src/domain/ports/mantenimiento.repository.ts

import type { Mantenimiento } from '../entities/mantenimiento.entity'
import type { CrudRepository } from './crud.repository'

/** Datos aceptados al crear/editar un mantenimiento. `cliente` es opcional en el backend. */
export interface MantenimientoInput {
  moto: number
  cliente?: number
  fecha: string
  tipo: string
  costo: string
}

/**
 * Contrato de acceso a datos de Mantenimiento. Para el <Autocomplete> de
 * motos se reutiliza MotoRepository, y para el de cliente, ClienteRepository.
 */
export type MantenimientoRepository = CrudRepository<Mantenimiento, MantenimientoInput, MantenimientoInput>
