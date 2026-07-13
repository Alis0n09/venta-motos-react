// src/application/dtos/register.dto.ts

export interface RegisterDto {
  username: string
  email: string
  password: string
  cedula?: string
  telefono?: string
}