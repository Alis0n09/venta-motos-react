// src/domain/ports/cliente.repository.ts

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
 * referenciarlos desde Mantenimiento y Direccion.
 * Implementado por infrastructure/adapters/axios-cliente.repository.ts
 */
export interface ClienteRepository {
  search(term: string): Promise<ClienteOption[]>
  getById(id: number | string): Promise<ClienteOption>
}
