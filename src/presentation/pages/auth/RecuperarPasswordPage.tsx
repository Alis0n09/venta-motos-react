// src/presentation/pages/auth/RecuperarPasswordPage.tsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box, Typography, TextField, Button,
  CircularProgress, Alert, InputAdornment, IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material'
import { authUseCase } from '@/infrastructure/factories/auth.factory'
import { colors } from '@/presentation/theme/colors'

export default function RecuperarPasswordPage() {
  const [paso, setPaso] = useState<1 | 2>(1)
  const [username, setUsername] = useState('')
  const [codigo, setCodigo] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handlePaso1(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await authUseCase.resetPassword({ username })
      setPaso(2)
    } catch (err) {
      const apiErr = err as { detail?: string }
      setError(apiErr.detail ?? 'No se encontró el usuario. Verifica el nombre.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePaso2(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== newPassword2) {
      setError('Las contraseñas no coinciden')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await authUseCase.resetPasswordConfirm({
        codigo,
        new_password: newPassword,
        new_password2: newPassword2,
      })
      setSuccess(true)
    } catch (err) {
      const apiErr = err as { detail?: string }
      setError(apiErr.detail ?? 'Código inválido o expirado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>

      {/* ── Imagen izquierda ── */}
      <Box sx={{
        display: { xs: 'none', md: 'block' },
        flex: 1,
        backgroundImage: 'url(/foto2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.5))',
        },
      }}>
        <Box sx={{ position: 'absolute', bottom: 40, left: 40, zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>
            Victal<span style={{ color: colors.accent }}>Speed</span>
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            Concesionario de motocicletas · Quito, Ecuador
          </Typography>
        </Box>
      </Box>

      {/* ── Formulario derecha ── */}
      <Box sx={{
        width: { xs: '100%', md: 480 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.background,
        p: { xs: 3, md: 6 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>

          {/* Logo mobile */}
          <Box sx={{ display: { md: 'none' }, mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: colors.textPrimary }}>
              Victal<span style={{ color: colors.accent }}>Speed</span>
            </Typography>
          </Box>

          {success ? (
            // ── Éxito ──
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%',
                bgcolor: `${colors.success}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3,
              }}>
                <LockReset sx={{ fontSize: 36, color: colors.success }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 2 }}>
                ¡Contraseña actualizada!
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 4 }}>
                Tu contraseña se cambió correctamente. Ya puedes iniciar sesión.
              </Typography>
              <Button
                component={Link} to="/login"
                variant="contained" fullWidth
                sx={{
                  bgcolor: colors.accent, color: '#fff',
                  fontWeight: 700, borderRadius: 3, py: 1.5,
                  '&:hover': { bgcolor: '#e0265e' },
                }}
              >
                Ir al login
              </Button>
            </Box>

          ) : paso === 1 ? (
            // ── Paso 1 ──
            <>
              <Typography variant="caption" sx={{
                color: colors.accent, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase',
                display: 'block', mb: 1,
              }}>
                Recuperar cuenta
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 1 }}>
                ¿Olvidaste tu contraseña?
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 4 }}>
                Ingresa tu nombre de usuario y te enviaremos un código a tu correo.
              </Typography>

              {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePaso1} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Usuario
                  </Typography>
                  <TextField
                    fullWidth placeholder="tu_usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required autoFocus sx={{ mt: 0.5 }}
                  />
                </Box>

                <Button
                  type="submit" variant="contained" fullWidth
                  disabled={isLoading || !username}
                  sx={{
                    py: 1.5, bgcolor: colors.primary, color: '#fff',
                    fontWeight: 700, fontSize: 16, borderRadius: 3,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                  }}
                >
                  {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Enviar código'}
                </Button>
              </Box>

              <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: colors.textSecondary }}>
                <Link to="/login" style={{ color: colors.accent, fontWeight: 700, textDecoration: 'none' }}>
                  Volver al login
                </Link>
              </Typography>
            </>

          ) : (
            // ── Paso 2 ──
            <>
              <Typography variant="caption" sx={{
                color: colors.accent, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase',
                display: 'block', mb: 1,
              }}>
                Recuperar cuenta
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 1 }}>
                Nueva contraseña
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 4 }}>
                Revisa tu correo y pega el código que recibiste.
              </Typography>

              {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePaso2} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Código de verificación
                  </Typography>
                  <TextField
                    fullWidth placeholder="Pega el código de tu correo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required autoFocus sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Nueva contraseña
                  </Typography>
                  <TextField
                    fullWidth type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required sx={{ mt: 0.5 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Confirma contraseña
                  </Typography>
                  <TextField
                    fullWidth type={showPassword2 ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    required sx={{ mt: 0.5 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                              {showPassword2 ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit" variant="contained" fullWidth
                  disabled={isLoading || !codigo || !newPassword || !newPassword2}
                  sx={{
                    py: 1.5, bgcolor: colors.primary, color: '#fff',
                    fontWeight: 700, fontSize: 16, borderRadius: 3,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                  }}
                >
                  {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Cambiar contraseña'}
                </Button>

                <Button
                  onClick={() => { setPaso(1); setError(null) }}
                  sx={{ color: colors.textSecondary, fontWeight: 600 }}
                >
                  ← Volver
                </Button>
              </Box>
            </>
          )}

        </Box>
      </Box>
    </Box>
  )
}