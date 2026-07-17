// src/presentation/pages/auth/RegisterPage.tsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Grid,
  IconButton, InputAdornment, CircularProgress, Alert,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuthStore } from '@/presentation/store/auth.store'
import { colors } from '@/presentation/theme/colors'
import { apiClient } from '@/infrastructure/http/axios-client'
import { localTokenStorage } from '@/infrastructure/storage/local-token-storage'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { clearError } = useAuthStore()

  const [form, setForm] = useState({
    nombre: '', apellido: '', cedula: '',
    telefono: '', username: '', email: '',
    password: '', password2: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    setIsLoading(true)
    setError(null)
    clearError()
    try {
      const { data } = await apiClient.post('/auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
        nombre: form.nombre,
        apellido: form.apellido,
        cedula: form.cedula,
        telefono: form.telefono,
      })
      const user = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        is_staff: data.is_staff,
        rol: null,
      }
      localTokenStorage.setTokens(data.access, data.refresh)
      localTokenStorage.setUser(user)
      useAuthStore.setState({ user, tokens: { access: data.access, refresh: data.refresh } })
      navigate('/', { replace: true })
    } catch (err) {
      const apiErr = err as { detail?: string; fieldErrors?: Record<string, string[]> }
      if (apiErr.fieldErrors && Object.keys(apiErr.fieldErrors).length > 0) {
        const messages = Object.entries(apiErr.fieldErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join(' | ')
        setError(messages)
      } else {
        setError(apiErr.detail ?? 'Error al registrarse')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = form.nombre && form.apellido && form.cedula &&
    form.username && form.email && form.password && form.password2

  const labelSx = {
    color: colors.textSecondary, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase' as const,
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>

      {/* ── Imagen izquierda ── */}
      <Box sx={{
        display: { xs: 'none', md: 'block' },
        flex: 1,
        backgroundImage: 'url(/foto7.jpg)',
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
        width: { xs: '100%', md: 560 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.background,
        p: { xs: 3, md: 6 },
        overflowY: 'auto',
      }}>
        <Box sx={{ width: '100%', maxWidth: 480 }}>

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
            Registrate
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 3 }}>
            Crea tu cuenta
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Nombre</Typography>
                <TextField fullWidth placeholder="Camila" value={form.nombre} onChange={handleChange('nombre')} required sx={{ mt: 0.5 }} />
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Apellido</Typography>
                <TextField fullWidth placeholder="Torres" value={form.apellido} onChange={handleChange('apellido')} required sx={{ mt: 0.5 }} />
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Cédula</Typography>
                <TextField fullWidth placeholder="1723456789" value={form.cedula} onChange={handleChange('cedula')} required slotProps={{ htmlInput: { maxLength: 10 } }} sx={{ mt: 0.5 }} />
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Teléfono</Typography>
                <TextField fullWidth placeholder="099 123 4567" value={form.telefono} onChange={handleChange('telefono')} sx={{ mt: 0.5 }} />
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Usuario</Typography>
                <TextField fullWidth placeholder="camila.torres" value={form.username} onChange={handleChange('username')} required sx={{ mt: 0.5 }} />
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Correo electrónico</Typography>
                <TextField fullWidth type="email" placeholder="camila@mail.com" value={form.email} onChange={handleChange('email')} required sx={{ mt: 0.5 }} />
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Contraseña</Typography>
                <TextField
                  fullWidth type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password}
                  onChange={handleChange('password')} required sx={{ mt: 0.5 }}
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
              </Grid>

              <Grid size={6}>
                <Typography variant="caption" sx={labelSx}>Confirma contraseña</Typography>
                <TextField
                  fullWidth type={showPassword2 ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password2}
                  onChange={handleChange('password2')} required sx={{ mt: 0.5 }}
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
              </Grid>

              <Grid size={12}>
                <Button
                  type="submit" variant="contained" fullWidth
                  disabled={isLoading || !isValid}
                  sx={{
                    mt: 1, py: 1.5,
                    bgcolor: colors.primary, color: '#fff',
                    fontWeight: 700, fontSize: 16, borderRadius: 3,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                    '&:disabled': { opacity: 0.6 },
                  }}
                >
                  {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Crear cuenta'}
                </Button>
              </Grid>

            </Grid>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: colors.textSecondary }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: colors.accent, fontWeight: 700, textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
          </Typography>

        </Box>
      </Box>
    </Box>
  )
}