// src/domain/entities/repuesto.entity.ts

export interface Repuesto {
  id: number
  nombre: string
  marca_compatible: number | null
  /** Calculado por el backend. */
  marca_compatible_nombre: string | null
  stock: number
  /** Decimal serializado como string por el backend. */
  precio: string
}
