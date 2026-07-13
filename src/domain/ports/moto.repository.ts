// src/domain/ports/moto.repository.ts

/** Resultado resumido de una moto, usado por buscadores/autocompletes. */
export interface MotoOption {
  id: number
  marca_nombre: string
  modelo: string
  anio: number
}

/**
 * Contrato de acceso a datos de Moto, de solo consulta: esta parte del
 * sistema no gestiona el catálogo de motos, solo las busca/consulta para
 * referenciarlas desde Inventario y Compras.
 * Implementado por infrastructure/adapters/axios-moto.repository.ts
 */
export interface MotoRepository {
  search(term: string): Promise<MotoOption[]>
  getById(id: number | string): Promise<MotoOption>
}
