export interface PasswordResetDto {
  username: string
}

export interface PasswordResetConfirmDto {
  codigo: string
  new_password: string
  new_password2: string
}