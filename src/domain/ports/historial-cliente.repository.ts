// src/domain/ports/historial-cliente.repository.ts

import type { HistorialCliente } from '../entities/historial-cliente.entity'

export interface HistorialClienteRepository {
  listarMiHistorial(): Promise<HistorialCliente[]>
}