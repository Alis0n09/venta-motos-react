// src/presentation/store/auth.store.ts

import { create } from 'zustand'
import { authUseCase } from '@/infrastructure/factories/auth.factory'
import { AUTH_EXPIRED_EVENT } from '@/infrastructure/http/axios-client'
import { useNotificacionesStore } from '@/presentation/store/notificaciones.store'
import type { LoggedUser } from '@/domain/entities/logged-user.entity'
import type { AuthTokens } from '@/domain/entities/auth-tokens.entity'

// ─── Tipos del store ──────────────────────────────────────────────────────────

interface AuthState {
  user: LoggedUser | null
  tokens: AuthTokens | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login(username: string, password: string): Promise<void>
  register(
    username: string,
    email: string,
    password: string,
    cedula?: string,
    telefono?: string,
  ): Promise<void>
  logout(): Promise<void>
  loadSession(): Promise<void>
  clearError(): void
  _clearSession(): void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>((set, get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_EXPIRED_EVENT, () => {
      get()._clearSession()
    })
  }

  return {
    user: null,
    tokens: null,
    isLoading: false,
    error: null,

    async login(username, password) {
      set({ isLoading: true, error: null })
      try {
        const { user, tokens } = await authUseCase.login({ username, password })
        set({ user, tokens, isLoading: false })
        if (!user.is_staff) {
          useNotificacionesStore.getState().cargar()
        }
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al iniciar sesión',
        })
        throw err
      }
    },

    async register(username, email, password, cedula, telefono) {
      set({ isLoading: true, error: null })
      try {
        const { user, tokens } = await authUseCase.register({
          username,
          email,
          password,
          cedula,
          telefono,
        })
        set({ user, tokens, isLoading: false })
        if (!user.is_staff) {
          useNotificacionesStore.getState().cargar()
        }
      } catch (err: unknown) {
        const apiErr = err as { detail?: string; message?: string }
        set({
          isLoading: false,
          error: apiErr.detail ?? apiErr.message ?? 'Error al registrarse',
        })
        throw err
      }
    },

    async logout() {
      set({ isLoading: true })
      await authUseCase.logout()
      set({ user: null, tokens: null, isLoading: false, error: null })
    },

    async loadSession() {
      set({ isLoading: true })
      const session = await authUseCase.restoreSession()
      if (session) {
        set({ user: session.user, tokens: session.tokens, isLoading: false })
        if (!session.user.is_staff) {
          useNotificacionesStore.getState().cargar()
        }
      } else {
        set({ user: null, tokens: null, isLoading: false })
      }
    },

    clearError() {
      set({ error: null })
    },

    _clearSession() {
      authUseCase.clearLocalSession()
      set({ user: null, tokens: null, isLoading: false, error: null })
    },
  }
})

// ─── Selectores ───────────────────────────────────────────────────────────────

export const selectIsAuthenticated = (state: AuthState) => state.user !== null

export const selectIsStaff = (state: AuthState) => state.user?.is_staff === true

export const selectRol = (state: AuthState) => state.user?.rol ?? null

export const selectIsCliente = (state: AuthState) =>
  state.user !== null && state.user.is_staff === false

export const selectIsAdmin = (state: AuthState) => state.user?.rol === 'admin'

export const selectIsVendedor = (state: AuthState) => state.user?.rol === 'vendedor'

export const selectIsBodeguero = (state: AuthState) => state.user?.rol === 'bodeguero'