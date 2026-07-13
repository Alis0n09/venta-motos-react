// src/domain/entities/logged-user.entity.ts

/** Usuario autenticado tal como lo devuelve tu endpoint /auth/login/ */
export interface LoggedUser {
  user_id: number
  username: string
  email: string
  is_staff: boolean
  rol: 'admin' | 'vendedor' | 'bodeguero' | null
}