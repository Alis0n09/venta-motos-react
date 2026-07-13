// src/domain/entities/cliente.entity.ts

export interface Cliente {
  id: number
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  correo: string
  direccion: string | null
}

export interface Vendedor {
  id: number
  usuario: number
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  correo: string
  rol: string
}