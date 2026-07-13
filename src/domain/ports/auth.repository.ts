// src/domain/ports/auth.repository.ts

import type { LoggedUser } from '../entities/logged-user.entity'
import type { AuthTokens } from '../entities/auth-tokens.entity'

/** Resultado de un login exitoso. */
export interface AuthSession {
  user: LoggedUser
  tokens: AuthTokens
}

/**
 * Contrato de acceso a datos de autenticación.
 * Implementado por infrastructure/adapters/axios-auth.repository.ts
 */
export interface AuthRepository {
  login(username: string, password: string): Promise<AuthSession>
  register(
    username: string,
    email: string,
    password: string,
    cedula?: string,
    telefono?: string,
  ): Promise<AuthSession>
  logout(): Promise<void>
  getCurrentUser(): Promise<LoggedUser>
  getStoredTokens(): AuthTokens | null
  clearLocalSession(): void
}