// src/presentation/pages/catalog/MotoDetailPage.tsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Container, Grid, Button, Chip,
  Skeleton, Alert, IconButton, Breadcrumbs, Avatar,
  Rating, TextField, CircularProgress, Snackbar,
} from '@mui/material'
import {
  TwoWheeler, ShoppingCart, FavoriteBorder, Favorite,
  WhatsApp, ArrowBack, Star, Delete,
} from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { formatPrice, formatDate } from '@/presentation/utils/formatters'
import { useAuthStore, selectIsAdmin, selectIsBodeguero } from '@/presentation/store/auth.store'
import { useCarritoStore } from '@/presentation/store/carrito.store'
import { useFavoritosStore } from '@/presentation/store/favoritos.store'
import { motoUseCase } from '@/infrastructure/factories/moto.factory'
import { resenaUseCase } from '@/infrastructure/factories/resena.factory'
import type { Moto } from '@/domain/entities/moto.entity'
import type { Resena } from '@/domain/entities/resena.entity'
import MotoFormModal from '@/presentation/components/motos/MotoFormModal'

// ─── SpecItem ─────────────────────────────────────────────────────────────────

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

// ─── MotoDetailPage ───────────────────────────────────────────────────────────

export default function MotoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore(selectIsAdmin)
  const isBodeguero = useAuthStore(selectIsBodeguero)
  const canEdit = isAdmin || isBodeguero

  const agregarItem = useCarritoStore((s) => s.agregarItem)
  const toggleFavorito = useFavoritosStore((s) => s.toggleFavorito)
  const esFavorito = useFavoritosStore((s) => s.esFavorito(Number(id)))

  const [moto, setMoto] = useState<Moto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [carritoFeedback, setCarritoFeedback] = useState(false)

  const [resenas, setResenas] = useState<Resena[]>([])
  const [resenaLoading, setResenaLoading] = useState(true)
  const [formResena, setFormResena] = useState({ rating: 5, comentario: '' })
  const [resenaError, setResenaError] = useState<string | null>(null)
  const [resenaSaving, setResenaSaving] = useState(false)
  const [resenaSuccess, setResenaSuccess] = useState(false)

  function loadMoto() {
    motoUseCase.getById(Number(id))
      .then(setMoto)
      .catch(() => setError('No se pudo cargar la moto.'))
      .finally(() => setLoading(false))
  }

  function loadResenas() {
    resenaUseCase.getByMoto(Number(id))
      .then(setResenas)
      .catch(() => {})
      .finally(() => setResenaLoading(false))
  }

  useEffect(() => {
    loadMoto()
    loadResenas()
  }, [id])

  async function handleSubmitResena(e: React.FormEvent) {
    e.preventDefault()
    if (!formResena.comentario.trim()) return
    setResenaSaving(true)
    setResenaError(null)
    try {
      await resenaUseCase.create({
        moto: Number(id),
        rating: formResena.rating,
        comentario: formResena.comentario,
      })
      setFormResena({ rating: 5, comentario: '' })
      setResenaSuccess(true)
      loadResenas()
    } catch (err) {
      const apiErr = err as { detail?: string }
      setResenaError(apiErr.detail ?? 'Error al enviar la reseña')
    } finally {
      setResenaSaving(false)
    }
  }

  function handleAgregarCarrito() {
    if (!moto) return
    agregarItem(moto, 1)
    setCarritoFeedback(true)
  }

  const promedioRating = resenas.length > 0
    ? resenas.reduce((acc, r) => acc + r.rating, 0) / resenas.length
    : 0

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

        {/* ── Breadcrumb ── */}
        <Breadcrumbs sx={{ mb: 1 }}>
          <Typography component={Link} to="/catalogo"
            sx={{ color: colors.textSecondary, textDecoration: 'none', fontSize: 14, '&:hover': { color: colors.accent } }}>
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

        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}
          sx={{ color: colors.textSecondary, mb: 3, fontWeight: 600 }}>
          Volver al catálogo
        </Button>

        <Grid container spacing={4}>

          {/* ── Imagen ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: colors.border, height: 380, position: 'relative' }}>
              {moto.imagen_url ? (
                <Box component="img" src={moto.imagen_url} alt={moto.modelo}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
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

              {user && !user.is_staff && (
                <IconButton
                  onClick={() => toggleFavorito(moto)}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
                >
                  {esFavorito
                    ? <Favorite sx={{ color: colors.accent }} />
                    : <FavoriteBorder sx={{ color: colors.accent }} />
                  }
                </IconButton>
              )}

              {(!user || user.is_staff) && (
                <IconButton
                  onClick={(e) => e.preventDefault()}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
                >
                  <FavoriteBorder sx={{ color: colors.accent }} />
                </IconButton>
              )}
            </Box>
          </Grid>

          {/* ── Info ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{
              color: colors.accent, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 0.5,
            }}>
              {moto.categoria_nombre} · {moto.cilindraje} cc
            </Typography>

            <Typography variant="h3" sx={{ fontWeight: 800, color: colors.textPrimary, lineHeight: 1.2, mb: 2 }}>
              {moto.marca_nombre} {moto.modelo}
            </Typography>

            {resenas.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={promedioRating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {promedioRating.toFixed(1)} · {resenas.length} reseña{resenas.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 32, color: colors.accent }}>
                {formatPrice(Number(moto.precio))}
              </Typography>
              <Chip label={stockLabel} sx={{ bgcolor: `${stockColor}20`, color: stockColor, fontWeight: 700 }} />
            </Box>

            {/* ── Especificaciones ── */}
            <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: 2, overflow: 'hidden', mb: 3 }}>
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
                  <SpecItem label="Estado" value={moto.estado.charAt(0).toUpperCase() + moto.estado.slice(1)} />
                </Grid>
              </Grid>
            </Box>

            {/* ── Acciones ── */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {user && !user.is_staff && moto.stock > 0 && (
                <Button variant="contained" fullWidth startIcon={<ShoppingCart />}
                  onClick={handleAgregarCarrito}
                  sx={{
                    bgcolor: colors.primary, color: colors.textOnPrimary,
                    fontWeight: 700, py: 1.5, borderRadius: 3,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                  }}>
                  Agregar al carrito
                </Button>
              )}

              {!user && (
                <Button component={Link} to="/login" variant="contained" fullWidth
                  sx={{
                    bgcolor: colors.primary, color: colors.textOnPrimary,
                    fontWeight: 700, py: 1.5, borderRadius: 3,
                    border: `1.5px solid ${colors.accent}`,
                    '&:hover': { bgcolor: colors.primaryDark },
                  }}>
                  Inicia sesión para comprar
                </Button>
              )}

              {(!user || !user.is_staff) && (
                <Button variant="contained" startIcon={<WhatsApp />}
                  href="https://wa.me/593999999999" target="_blank"
                  sx={{
                    bgcolor: '#25D366', color: '#fff',
                    fontWeight: 700, py: 1.5, borderRadius: 3, minWidth: 140,
                    '&:hover': { bgcolor: '#1ebe5d' },
                  }}>
                  WhatsApp
                </Button>
              )}
            </Box>

            {canEdit && (
              <Button onClick={() => setModalOpen(true)} variant="outlined" fullWidth
                sx={{
                  mt: 2, borderColor: colors.accent, color: colors.accent,
                  fontWeight: 700, py: 1.5, borderRadius: 3,
                  '&:hover': { bgcolor: colors.accentLight },
                }}>
                Editar moto
              </Button>
            )}
          </Grid>
        </Grid>

        {/* ── Reseñas ── */}
        <Box sx={{ mt: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                Opiniones
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mt: 0.5 }}>
                Reseñas de clientes
              </Typography>
            </Box>
            {resenas.length > 0 && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.textPrimary }}>
                  {promedioRating.toFixed(1)}
                </Typography>
                <Rating value={promedioRating} precision={0.5} readOnly size="small" />
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                  {resenas.length} reseña{resenas.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Formulario nueva reseña */}
          {user && !user.is_staff && (
            <Box component="form" onSubmit={handleSubmitResena} sx={{
              bgcolor: colors.surface, borderRadius: 3,
              border: `1px solid ${colors.border}`, p: 3, mb: 4,
            }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2 }}>
                Escribe tu reseña
              </Typography>

              {resenaError && (
                <Alert severity="error" onClose={() => setResenaError(null)} sx={{ mb: 2 }}>
                  {resenaError}
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Calificación
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Rating
                    value={formResena.rating}
                    onChange={(_, val) => setFormResena((p) => ({ ...p, rating: val ?? 5 }))}
                    size="large"
                  />
                </Box>
              </Box>

              <TextField
                fullWidth multiline rows={3}
                placeholder="Comparte tu experiencia con esta moto..."
                value={formResena.comentario}
                onChange={(e) => setFormResena((p) => ({ ...p, comentario: e.target.value }))}
                sx={{ mb: 2 }}
              />

              <Button type="submit" variant="contained"
                disabled={resenaSaving || !formResena.comentario.trim()}
                sx={{
                  bgcolor: colors.primary, color: colors.textOnPrimary,
                  fontWeight: 700, borderRadius: 3,
                  border: `1.5px solid ${colors.accent}`,
                  '&:hover': { bgcolor: colors.primaryDark },
                }}>
                {resenaSaving
                  ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                  : 'Publicar reseña'
                }
              </Button>
            </Box>
          )}

          {/* Lista de reseñas */}
          {resenaLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: colors.accent }} />
            </Box>
          ) : resenas.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {resenas.map((resena) => (
                <Box key={resena.id} sx={{
                  bgcolor: colors.surface, borderRadius: 3,
                  border: `1px solid ${colors.border}`, p: 3,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar sx={{ bgcolor: colors.primary, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                      {resena.cliente_nombre.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                        {resena.cliente_nombre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {formatDate(resena.fecha)}
                      </Typography>
                    </Box>
                    <Rating value={resena.rating} readOnly size="small" />
                    {user?.rol === 'admin' && (
                      <IconButton size="small" sx={{ color: colors.error }}
                        onClick={async () => {
                          await resenaUseCase.delete(resena.id)
                          loadResenas()
                        }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                    {resena.comentario}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 4, borderRadius: 3, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: colors.textSecondary, opacity: 0.3, mb: 1 }} />
              <Typography sx={{ color: colors.textSecondary }}>
                Aún no hay reseñas. ¡Sé el primero en opinar!
              </Typography>
            </Box>
          )}
        </Box>

        <Snackbar
          open={resenaSuccess}
          autoHideDuration={3000}
          onClose={() => setResenaSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            ¡Reseña publicada exitosamente!
          </Alert>
        </Snackbar>

        <Snackbar
          open={carritoFeedback}
          autoHideDuration={2000}
          onClose={() => setCarritoFeedback(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            {moto.modelo} agregada al carrito
          </Alert>
        </Snackbar>

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