// src/domain/entities/auth-tokens.entity.ts

/** Par de tokens JWT devuelto por /auth/login/ */
export interface AuthTokens {
  access: string
  refresh: string
}