// src/presentation/pages/auth/ProfilePage.tsx

import { useState, useEffect } from 'react'
import {
  Box, Typography, Container, Grid, TextField,
  Button, Alert, CircularProgress, Divider, Avatar, Chip, Card,
} from '@mui/material'
import { Edit, Save, Cancel } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { useAuthStore } from '@/presentation/store/auth.store'
import { clienteUseCase } from '@/infrastructure/factories/cliente.factory'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import type { Cliente } from '@/domain/entities/cliente.entity'

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

function StatCard({ label, value, dark = false }: { label: string, value: string | number, dark?: boolean }) {
  return (
    <Card sx={{
      p: 2.5, borderRadius: 1,
      bgcolor: dark ? colors.primary : colors.surface,
      border: `1px solid ${colors.border}`,
    }}>
      <Typography variant="caption" sx={{
        color: colors.textSecondary,
        fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1,
      }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: dark ? colors.accent : colors.textPrimary }}>
        {value}
      </Typography>
    </Card>
  )
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const isStaff = user?.is_staff ?? false

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [totalCompras, setTotalCompras] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
  })

  useEffect(() => {
    if (isStaff) {
      setLoading(false)
      return
    }

    Promise.all([
      clienteUseCase.getMe(),
      ventaUseCase.listarMisCompras().catch(() => []),
    ]).then(([data, ventas]) => {
      setCliente(data)
      setForm({
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono ?? '',
        direccion: data.direccion ?? '',
      })
      setTotalCompras(Array.isArray(ventas) ? ventas.length : 0)
    }).catch(() => setError('No se pudo cargar tu perfil.'))
      .finally(() => setLoading(false))
  }, [isStaff])

  function handleChange(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await clienteUseCase.updateMe({
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        direccion: form.direccion,
      })
      setCliente(updated)
      setEditing(false)
      setSuccess(true)
    } catch (err) {
      const apiErr = err as { detail?: string }
      setError(apiErr.detail ?? 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono ?? '',
        direccion: cliente.direccion ?? '',
      })
    }
    setEditing(false)
    setError(null)
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress sx={{ color: colors.accent }} />
    </Box>
  )

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">

        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ bgcolor: colors.primary, width: 72, height: 72, fontSize: 28, fontWeight: 800 }}>
              {user ? getInitials(user.username) : '?'}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                {isStaff ? user?.rol ?? 'Staff' : 'Cliente'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, lineHeight: 1.2 }}>
                {cliente ? `${cliente.nombre} ${cliente.apellido}` : user?.username}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>

          {!isStaff && !editing && (
            <Button
              startIcon={<Edit />}
              variant="outlined"
              onClick={() => setEditing(true)}
              sx={{ borderColor: colors.border, color: colors.textPrimary, fontWeight: 700,borderRadius: 1 }}
            >
              Editar perfil
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 3, borderRadius: 2 }}>
            Perfil actualizado correctamente
          </Alert>
        )}

        {/* ── Stats solo cliente ── */}
        {!isStaff && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Motos compradas" value={totalCompras} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Reseñas escritas" value="—" />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Estado de cuenta" value="Al día" dark />
            </Grid>
          </Grid>
        )}

        {/* ── Datos de cuenta ── */}
        <Box sx={{ bgcolor: colors.surface,borderRadius: 1, border: `1px solid ${colors.border}`, p: 3, mb: 3 }}>
          <Typography variant="caption" sx={{
            color: colors.accent, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 2,
          }}>
            Datos de cuenta
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Usuario
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                {user?.username}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Correo
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                {user?.email}
              </Typography>
            </Grid>
            {isStaff && user?.rol && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Rol
                </Typography>
                <Chip
                  label={user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                  size="small"
                  sx={{ bgcolor: colors.accentLight, color: colors.accent, fontWeight: 700 }}
                />
              </Grid>
            )}
            {cliente?.cedula && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Cédula
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                  {cliente.cedula}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* ── Datos personales editables solo cliente ── */}
        {!isStaff && (
          <Box sx={{ bgcolor: colors.surface,borderRadius: 1, border: `1px solid ${colors.border}`, p: 3 }}>
            <Typography variant="caption" sx={{
              color: colors.accent, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 2,
            }}>
              Datos personales
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Nombre
                </Typography>
                {editing
                  ? <TextField fullWidth value={form.nombre} onChange={handleChange('nombre')} sx={{ mt: 0.5 }} />
                  : <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>{cliente?.nombre ?? '—'}</Typography>
                }
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Apellido
                </Typography>
                {editing
                  ? <TextField fullWidth value={form.apellido} onChange={handleChange('apellido')} sx={{ mt: 0.5 }} />
                  : <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>{cliente?.apellido ?? '—'}</Typography>
                }
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Teléfono
                </Typography>
                {editing
                  ? <TextField fullWidth value={form.telefono} onChange={handleChange('telefono')} sx={{ mt: 0.5 }} />
                  : <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>{cliente?.telefono ?? '—'}</Typography>
                }
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Dirección
                </Typography>
                {editing
                  ? <TextField fullWidth value={form.direccion} onChange={handleChange('direccion')} sx={{ mt: 0.5 }} />
                  : <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>{cliente?.direccion ?? '—'}</Typography>
                }
              </Grid>
            </Grid>

            {editing && (
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained" fullWidth
                  startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    bgcolor: colors.primary, color: colors.textOnPrimary,
                    fontWeight: 700, py: 1.5,borderRadius: 1,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button
                  variant="outlined" fullWidth
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  sx={{ borderColor: colors.border, color: colors.textSecondary, fontWeight: 700, py: 1.5,borderRadius: 1 }}
                >
                  Cancelar
                </Button>
              </Box>
            )}
          </Box>
        )}

      </Container>
    </Box>
  )
}