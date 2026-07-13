// src/domain/ports/cliente.repository.ts

import type { Cliente } from '../entities/cliente.entity'

/** Resultado resumido de un cliente, usado por buscadores/autocompletes. */
export interface ClienteOption {
  id: number
  nombre: string
  apellido: string
  cedula: string
}

export interface ClienteRepository {

  search(term: string): Promise<ClienteOption[]>

  getById(id: number | string): Promise<ClienteOption>

  listar(): Promise<Cliente[]>

  getMe(): Promise<Cliente>

  updateMe(data: Partial<Cliente>): Promise<Cliente>
}
