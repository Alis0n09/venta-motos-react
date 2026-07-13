// src/infrastructure/storage/local-token-storage.ts

export interface LocalTokens {
  access: string
  refresh: string
}

const KEYS = {
  ACCESS: 'victal_access',
  REFRESH: 'victal_refresh',
  USER: 'victal_user',
} as const

export const localTokenStorage = {
  getTokens(): LocalTokens | null {
    const access = localStorage.getItem(KEYS.ACCESS)
    const refresh = localStorage.getItem(KEYS.REFRESH)
    if (!access || !refresh) return null
    return { access, refresh }
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(KEYS.ACCESS, access)
    localStorage.setItem(KEYS.REFRESH, refresh)
  },

  clearTokens(): void {
    localStorage.removeItem(KEYS.ACCESS)
    localStorage.removeItem(KEYS.REFRESH)
    localStorage.removeItem(KEYS.USER)
  },

  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.ACCESS)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH)
  },

  setUser(user: object): void {
    localStorage.setItem(KEYS.USER, JSON.stringify(user))
  },

  getUser<T>(): T | null {
    const raw = localStorage.getItem(KEYS.USER)
    return raw ? (JSON.parse(raw) as T) : null
  },

  clearUser(): void {
    localStorage.removeItem(KEYS.USER)
  },
}