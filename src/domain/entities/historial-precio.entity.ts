export interface HistorialPrecio {
  id: number
  moto: number
  moto_nombre: string
  precio_anterior: string
  precio_nuevo: string
  fecha: string
  usuario: number
  usuario_nombre: string
}

export interface HistorialPrecioStats {
  total: number
}