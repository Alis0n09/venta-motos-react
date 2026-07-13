// src/domain/ports/cliente.repository.ts

import type { Cliente } from '../entities/cliente.entity'

/** Resultado resumido de un cliente, usado por buscadores/autocompletes. */
export interface ClienteOption {
  id: number
  nombre: string
  apellido: string
  cedula: string
}

/**
 * Contrato de acceso a datos de Cliente, de solo consulta: esta parte del
 * sistema no gestiona el CRUD de clientes, solo los busca/consulta para
 * referenciarlos desde Mantenimiento, Direccion y Ventas.
 * Implementado por infrastructure/adapters/axios-cliente.repository.ts
 */
export interface ClienteRepository {
  /** Búsqueda por texto libre, para autocompletes (Mantenimiento/Direccion). */
  search(term: string): Promise<ClienteOption[]>
  /** Un cliente puntual, para resolver nombres a partir de un id (Direccion). */
  getById(id: number | string): Promise<ClienteOption>
  /** Todos los clientes, para el select de Ventas. */
  listar(): Promise<Cliente[]>
}
