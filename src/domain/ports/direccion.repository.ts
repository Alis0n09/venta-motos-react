// src/domain/ports/direccion.repository.ts

import type { Direccion } from '../entities/direccion.entity'
import type { CrudRepository } from './crud.repository'

/** Datos aceptados al crear/editar una dirección. */
export interface DireccionInput {
  cliente: number
  calle: string
  ciudad: string
  provincia: string
  principal: boolean
}

/**
 * Contrato de acceso a datos de Direccion. El backend no calcula un nombre
 * de cliente en la respuesta (a diferencia de Inventario/Mantenimiento), así
 * que para mostrarlo se reutiliza ClienteRepository (search + getById).
 */
export type DireccionRepository = CrudRepository<Direccion, DireccionInput, DireccionInput>
