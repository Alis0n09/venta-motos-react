// src/infrastructure/adapters/axios-auth.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'
import type { AuthRepository, AuthSession } from '@/domain/ports/auth.repository'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

/** Forma real de la respuesta de /auth/login/ de tu backend */
interface LoginResponse {
  access: string
  refresh: string
  user_id: number
  username: string
  email: string
  is_staff: boolean
  rol: 'admin' | 'vendedor' | 'bodeguero' | null
}

export class AxiosAuthRepository implements AuthRepository {

  async login(username: string, password: string): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login/', {
        username,
        password,
      })
      const tokens: AuthTokens = { access: data.access, refresh: data.refresh }
      const user: LoggedUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        is_staff: data.is_staff,
        rol: data.rol,
      }
      localTokenStorage.setTokens(tokens.access, tokens.refresh)
      localTokenStorage.setUser(user)
      return { user, tokens }
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async register(
    username: string,
    email: string,
    password: string,
    cedula?: string,
    telefono?: string,
  ): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/register/', {
        username,
        email,
        password,
        ...(cedula && { cedula }),
        ...(telefono && { telefono }),
      })
      const tokens: AuthTokens = { access: data.access, refresh: data.refresh }
      const user: LoggedUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        is_staff: data.is_staff,
        rol: data.rol,
      }
      localTokenStorage.setTokens(tokens.access, tokens.refresh)
      localTokenStorage.setUser(user)
      return { user, tokens }
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async logout(): Promise<void> {
    const refresh = localTokenStorage.getRefreshToken()
    if (refresh) {
      try {
        await apiClient.post('/auth/logout/', { refresh })
      } catch {
        // Si falla, limpiar igual
      }
    }
    localTokenStorage.clearTokens()
  }

  async getCurrentUser(): Promise<LoggedUser> {
    try {
      const stored = localTokenStorage.getUser<LoggedUser>()
      if (stored) return stored
      // Si no hay user en storage, llama al perfil
      const { data } = await apiClient.get<LoggedUser>('/auth/perfil/')
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }

  getStoredTokens(): AuthTokens | null {
    return localTokenStorage.getTokens()
  }

  clearLocalSession(): void {
    localTokenStorage.clearTokens()
  }
}