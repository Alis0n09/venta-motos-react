// src/domain/ports/vendedor.repository.ts

import type { Vendedor } from '../entities/cliente.entity'

export interface VendedorRepository {
  listar(): Promise<Vendedor[]>
}