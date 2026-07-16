// src/domain/entities/log-actividad.entity.ts

export interface LogActividad {
  id: number
  usuario: number | null
  accion: string
  entidad: string
  datos_antes: Record<string, unknown> | null
  datos_despues: Record<string, unknown> | null
  fecha: string
}
