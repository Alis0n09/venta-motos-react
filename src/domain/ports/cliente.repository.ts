// src/domain/ports/cliente.repository.ts

import type { Cliente } from '../entities/cliente.entity'

export interface ClienteRepository {
  listar(): Promise<Cliente[]>
}