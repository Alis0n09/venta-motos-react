// src/presentation/pages/auth/LoginPage.tsx

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, TextField, Button,
  IconButton, InputAdornment, CircularProgress, Alert,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuthStore } from '@/presentation/store/auth.store'
import { colors } from '@/presentation/theme/colors'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch {
      // el error ya está en el store
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>

      {/* ── Imagen izquierda ── */}
      <Box sx={{
        display: { xs: 'none', md: 'block' },
        flex: 1,
        backgroundImage: 'url(/foto9.jpg)',
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

          <Typography variant="caption" sx={{
            color: colors.accent, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase',
            display: 'block', mb: 1,
          }}>
            Bienvenido de nuevo
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 4 }}>
            Inicia sesión
          </Typography>

          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            <Box>
              <Typography variant="caption" sx={{
                color: colors.textSecondary, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase',
              }}>
                Usuario
              </Typography>
              <TextField
                fullWidth
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required autoFocus
                sx={{ mt: 0.5 }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{
                color: colors.textSecondary, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase',
              }}>
                Contraseña
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mt: 0.5 }}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography
                component={Link}
                to="/recuperar-password"
                variant="caption"
                sx={{ color: colors.accent, fontWeight: 600, textDecoration: 'none' }}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !username || !password}
              sx={{
                mt: 1, py: 1.5,
                bgcolor: colors.primary,
                color: '#fff',
                fontWeight: 700, fontSize: 16, borderRadius: 3,
                border: `1.5px solid ${colors.accent}`,
                '&:hover': { bgcolor: colors.primaryDark },
                '&:disabled': { opacity: 0.6 },
              }}
            >
              {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Ingresar'}
            </Button>

          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: colors.textSecondary }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: colors.accent, fontWeight: 700, textDecoration: 'none' }}>
              Registrate
            </Link>
          </Typography>

        </Box>
      </Box>
    </Box>
  )
}