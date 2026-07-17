// src/application/use-cases/auth.use-case.ts

import type { AuthRepository, AuthSession } from '@/domain/ports/auth.repository'
import type { LoginDto } from '../dtos/login.dto'
import type { RegisterDto } from '../dtos/register.dto'
import type { PasswordResetConfirmDto, PasswordResetDto } from '../dtos/password-reset.dto'

export class AuthUseCase {
  private readonly authRepository: AuthRepository

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
  }

  login(dto: LoginDto): Promise<AuthSession> {
    return this.authRepository.login(dto.username, dto.password)
  }

  register(dto: RegisterDto): Promise<AuthSession> {
    return this.authRepository.register(
      dto.username,
      dto.email,
      dto.password,
      dto.cedula,
      dto.telefono,
    )
  }

  logout(): Promise<void> {
    return this.authRepository.logout()
  }

  async restoreSession(): Promise<AuthSession | null> {
    const tokens = this.authRepository.getStoredTokens()
    if (!tokens) return null
    try {
      const user = await this.authRepository.getCurrentUser()
      return { user, tokens }
    } catch {
      this.authRepository.clearLocalSession()
      return null
    }
  }

  clearLocalSession(): void {
    this.authRepository.clearLocalSession()
  }

  resetPassword(dto: PasswordResetDto) {
  return this.authRepository.resetPassword(dto)
  }

  resetPasswordConfirm(dto: PasswordResetConfirmDto) {
    return this.authRepository.resetPasswordConfirm(dto)
  }
}