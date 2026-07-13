// src/presentation/pages/catalog/MotoDetailPage.tsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Container, Grid, Button, Chip,
  Skeleton, Alert, IconButton, Breadcrumbs,
} from '@mui/material'
import {
  TwoWheeler, ShoppingCart, FavoriteBorder,
  WhatsApp, ArrowBack,
} from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { formatPrice } from '@/presentation/utils/formatters'
import { useAuthStore, selectIsAdmin, selectIsBodeguero } from '@/presentation/store/auth.store'
import { motoUseCase } from '@/infrastructure/factories/moto.factory'
import type { Moto } from '@/domain/entities/moto.entity'
import MotoFormModal from '@/presentation/components/motos/MotoFormModal'

function SpecItem({ label, value }: { label: string, value: string }) {
  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="caption" sx={{
        color: colors.textSecondary, fontWeight: 700,
        letterSpacing: 1, textTransform: 'uppercase', display: 'block',
      }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function MotoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore(selectIsAdmin)
  const isBodeguero = useAuthStore(selectIsBodeguero)
  const canEdit = isAdmin || isBodeguero

  const [moto, setMoto] = useState<Moto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function loadMoto() {
    motoUseCase.getById(Number(id))
      .then(setMoto)
      .catch(() => setError('No se pudo cargar la moto.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMoto()
  }, [id])

  const stockLabel = moto?.stock === 0
    ? 'Agotado'
    : moto?.stock && moto.stock <= 3
      ? 'Pocas unidades'
      : 'En stock'

  const stockColor = moto?.stock === 0
    ? colors.error
    : moto?.stock && moto.stock <= 3
      ? colors.warning
      : colors.success

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={400} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={200} />
        </Grid>
      </Grid>
    </Container>
  )

  if (error || !moto) return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Alert severity="error">{error ?? 'Moto no encontrada'}</Alert>
      <Button component={Link} to="/catalogo" startIcon={<ArrowBack />} sx={{ mt: 2 }}>
        Volver al catálogo
      </Button>
    </Container>
  )

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        <Breadcrumbs sx={{ mb: 1 }}>
          <Typography
            component={Link} to="/catalogo"
            sx={{ color: colors.textSecondary, textDecoration: 'none', fontSize: 14, '&:hover': { color: colors.accent } }}
          >
            Catálogo
          </Typography>
          {moto.categoria_nombre && (
            <Typography sx={{ color: colors.textSecondary, fontSize: 14 }}>
              {moto.categoria_nombre}
            </Typography>
          )}
          <Typography sx={{ color: colors.accent, fontWeight: 700, fontSize: 14 }}>
            {moto.marca_nombre} {moto.modelo}
          </Typography>
        </Breadcrumbs>

        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: colors.textSecondary, mb: 3, fontWeight: 600 }}
        >
          Volver al catálogo
        </Button>

        <Grid container spacing={4}>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{
              borderRadius: 3, overflow: 'hidden',
              bgcolor: colors.border, height: 380,
              position: 'relative',
            }}>
              {moto.imagen_url ? (
                <Box component="img" src={moto.imagen_url} alt={moto.modelo}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box sx={{
                  width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                }}>
                  <TwoWheeler sx={{ fontSize: 96, color: colors.textSecondary, opacity: 0.2 }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary, opacity: 0.5 }}>
                    Sin imagen disponible
                  </Typography>
                </Box>
              )}

              {moto.anio >= 2024 && moto.stock > 0 && (
                <Chip label="Nueva" size="small" sx={{
                  position: 'absolute', top: 12, left: 12,
                  bgcolor: colors.accent, color: '#fff', fontWeight: 700,
                }} />
              )}

              <IconButton sx={{
                position: 'absolute', top: 8, right: 8,
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: '#fff' },
              }}>
                <FavoriteBorder sx={{ color: colors.accent }} />
              </IconButton>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>

            <Typography variant="caption" sx={{
              color: colors.accent, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 0.5,
            }}>
              {moto.categoria_nombre} · {moto.cilindraje} cc
            </Typography>

            <Typography variant="h3" sx={{
              fontWeight: 800, color: colors.textPrimary,
              lineHeight: 1.2, mb: 2,
            }}>
              {moto.marca_nombre} {moto.modelo}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 32, color: colors.accent }}>
                {formatPrice(Number(moto.precio))}
              </Typography>
              <Chip
                label={stockLabel}
                sx={{ bgcolor: `${stockColor}20`, color: stockColor, fontWeight: 700 }}
              />
            </Box>

            <Box sx={{
              border: `1px solid ${colors.border}`,
              borderRadius: 2, overflow: 'hidden', mb: 3,
            }}>
              <Grid container>
                <Grid size={6} sx={{ borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
                  <SpecItem label="Cilindraje" value={`${moto.cilindraje} cc`} />
                </Grid>
                <Grid size={6} sx={{ borderBottom: `1px solid ${colors.border}` }}>
                  <SpecItem label="Año" value={String(moto.anio)} />
                </Grid>
                <Grid size={6} sx={{ borderRight: `1px solid ${colors.border}` }}>
                  <SpecItem label="Color" value={moto.color} />
                </Grid>
                <Grid size={6}>
                  <SpecItem
                    label="Estado"
                    value={moto.estado.charAt(0).toUpperCase() + moto.estado.slice(1)}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {user && !user.is_staff && moto.stock > 0 && (
                <Button
                  variant="contained" fullWidth
                  startIcon={<ShoppingCart />}
                  sx={{
                    bgcolor: colors.primary, color: colors.textOnPrimary,
                    fontWeight: 700, py: 1.5, borderRadius: 3,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                  }}
                >
                  Agregar al carrito
                </Button>
              )}

              {!user && (
                <Button
                  component={Link} to="/login"
                  variant="contained" fullWidth
                  sx={{
                    bgcolor: colors.primary, color: colors.textOnPrimary,
                    fontWeight: 700, py: 1.5, borderRadius: 3,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                  }}
                >
                  Inicia sesión para comprar
                </Button>
              )}

              {(!user || !user.is_staff) && (
                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  href="https://wa.me/593999999999"
                  target="_blank"
                  sx={{
                    bgcolor: '#25D366', color: '#fff',
                    fontWeight: 700, py: 1.5, borderRadius: 3,
                    minWidth: 140,
                    '&:hover': { bgcolor: '#1ebe5d' },
                  }}
                >
                  WhatsApp
                </Button>
              )}
            </Box>

            {canEdit && (
              <Button
                onClick={() => setModalOpen(true)}
                variant="outlined" fullWidth
                sx={{
                  mt: 2,
                  borderColor: colors.accent, color: colors.accent,
                  fontWeight: 700, py: 1.5, borderRadius: 3,
                  '&:hover': { bgcolor: colors.accentLight },
                }}
              >
                Editar moto
              </Button>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="caption" sx={{
            color: colors.accent, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Opiniones
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mt: 0.5 }}>
            Reseñas de clientes
          </Typography>
          <Box sx={{
            mt: 3, p: 4, borderRadius: 3,
            border: `1px solid ${colors.border}`,
            textAlign: 'center',
          }}>
            <Typography sx={{ color: colors.textSecondary }}>
              Las reseñas estarán disponibles próximamente.
            </Typography>
          </Box>
        </Box>

        <MotoFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          moto={moto}
          onSuccess={loadMoto}
        />

      </Container>
    </Box>
  )
}