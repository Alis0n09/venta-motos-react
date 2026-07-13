// src/domain/entities/historial-cliente.entity.ts

export interface HistorialCliente {
  id: number
  cliente: number
  cliente_nombre: string | null
  cliente_cedula: string | null
  tipo_evento: string
  detalle: Record<string, unknown>
  fecha: string
}