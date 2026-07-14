// src/presentation/pages/catalog/HomePage.tsx

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Box, Typography, Button, Container, Grid,
  Card, CardContent, Chip, IconButton, Skeleton,
} from '@mui/material'
import {
  ArrowForward, ArrowBack, ArrowForwardIos,
  TwoWheeler, LocalOffer, FavoriteBorder, Favorite,
} from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { apiClient } from '@/infrastructure/http/axios-client'
import { formatPrice } from '@/presentation/utils/formatters'
import { useAuthStore } from '@/presentation/store/auth.store'
import { useFavoritosStore } from '@/presentation/store/favoritos.store'
import type { Moto } from '@/domain/entities/moto.entity'

// ─── Carrusel ────────────────────────────────────────────────────────────────

const HERO_IMAGES = [
  { src: '/public/foto2.jpg', title: 'VICTAL', accent: 'SPEED', sub: 'Concesionario de motocicletas en Quito · Ecuador' },
  { src: '/public/foto3.jpg', title: 'ENCUENTRA', accent: 'TU MOTO', sub: 'Las mejores marcas al mejor precio' },
  { src: '/public/foto4.jpg', title: 'FINANCIA', accent: 'A TU MEDIDA', sub: 'Hasta 48 meses con las mejores tasas' },
  { src: '/public/foto5.jpg', title: 'SERVICIO', accent: 'TÉCNICO', sub: 'Mantenimiento y garantía respaldados' },
  { src: '/public/foto6.jpg', title: 'VISÍTANOS', accent: 'HOY', sub: 'Quito · Ecuador · Tel: 2-256-9853' },
]

function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((c) => (c + 1) % HERO_IMAGES.length), [])
  const prev = () => setCurrent((c) => (c - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = HERO_IMAGES[current]

  return (
    <Box sx={{ position: 'relative', height: { xs: 820, md: 880 } , overflow: 'hidden' }}>
      {/* Imagen de fondo */}
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${slide.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.6s ease',
        '&::after': {
          content: '""', position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
        },
      }} />

      {/* Contenido */}
      <Box sx={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', px: 3,
      }}>
        <Typography variant="h1" sx={{
          fontSize: { xs: 48, md: 96 },
          fontWeight: 900, lineHeight: 1,
          color: colors.textOnPrimary,
          textTransform: 'uppercase',
          '& span': { color: colors.accent },
        }}>
          {slide.title} <span>{slide.accent}</span>
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 2, fontSize: 18 }}>
          {slide.sub}
        </Typography>
        <Button
          component={Link} to="/catalogo"
          variant="outlined"
          sx={{
            mt: 4, px: 4, py: 1.5,
            color: colors.textOnPrimary,
            borderColor: colors.textOnPrimary,
            fontWeight: 700, fontSize: 14,
            letterSpacing: 2, textTransform: 'uppercase',
            borderRadius: 0,
            '&:hover': { bgcolor: colors.accent, borderColor: colors.accent },
          }}
        >
          Catálogo
        </Button>
      </Box>

      {/* Controles */}
      <IconButton onClick={prev} sx={{
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
        zIndex: 2, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff',
        '&:hover': { bgcolor: colors.accent },
      }}>
        <ArrowBack />
      </IconButton>
      <IconButton onClick={next} sx={{
        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
        zIndex: 2, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff',
        '&:hover': { bgcolor: colors.accent },
      }}>
        <ArrowForwardIos />
      </IconButton>

      {/* Dots */}
      <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1, zIndex: 2 }}>
        {HERO_IMAGES.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrent(i)}
            sx={{
              width: i === current ? 24 : 8, height: 8,
              borderRadius: 4, cursor: 'pointer',
              bgcolor: i === current ? colors.accent : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

// ─── Card de moto ─────────────────────────────────────────────────────────────

function MotoCard({ moto }: { moto: Moto }) {
  const user = useAuthStore((s) => s.user)
  const toggleFavorito = useFavoritosStore((s) => s.toggleFavorito)
  const esFavorito = useFavoritosStore((s) => s.esFavorito(moto.id))

  const stockLabel = moto.stock === 0 ? 'Sin stock' : moto.stock <= 3 ? 'Pocas u.' : 'En stock'
  const stockColor = moto.stock === 0 ? colors.error : moto.stock <= 3 ? colors.warning : colors.success

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
      transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' },
    }}
      component={Link} to={`/catalogo/${moto.id}`}
      style={{ textDecoration: 'none' }}
    >
      {/* Imagen */}
      <Box sx={{ position: 'relative', bgcolor: colors.border, height: 200 }}>
        {moto.imagen_url ? (
          <Box component="img" src={moto.imagen_url} alt={moto.modelo}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TwoWheeler sx={{ fontSize: 64, color: colors.textSecondary, opacity: 0.3 }} />
          </Box>
        )}
        {moto.estado === 'disponible' && moto.stock > 0 && (
          <Chip label="Nueva" size="small" sx={{
            position: 'absolute', top: 10, left: 10,
            bgcolor: colors.accent, color: '#fff', fontWeight: 700, fontSize: 11,
          }} />
        )}

        {user && !user.is_staff && (
          <IconButton
            onClick={(e) => { e.preventDefault(); toggleFavorito(moto) }}
            sx={{
              position: 'absolute', top: 8, right: 8,
              bgcolor: 'rgba(255,255,255,0.9)', width: 32, height: 32,
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            {esFavorito
              ? <Favorite sx={{ fontSize: 18, color: colors.accent }} />
              : <FavoriteBorder sx={{ fontSize: 18, color: colors.textSecondary }} />
            }
          </IconButton>
        )}
      </Box>

      {/* Info */}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
          {moto.marca_nombre} · {moto.cilindraje}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
          {moto.modelo}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: colors.accent }}>
            {formatPrice(Number(moto.precio))}
          </Typography>
          <Chip label={stockLabel} size="small" sx={{
            bgcolor: `${stockColor}20`, color: stockColor, fontWeight: 600, fontSize: 11,
          }} />
        </Box>
      </CardContent>
    </Card>
  )
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/motos/?estado=disponible&page_size=7')
      .then((res) => {
        const data = res.data
        setMotos(Array.isArray(data) ? data.slice(0, 7) : (data.results ?? []).slice(0, 7))
      })
      .catch(() => setMotos([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      {/* ── Hero Carrusel ── */}
      <HeroCarousel />

      {/* ── Motos destacadas ── */}
      <Box sx={{ bgcolor: colors.background, py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                Catálogo
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
                Motos destacadas
              </Typography>
            </Box>
            <Button
              component={Link} to="/catalogo"
              endIcon={<ArrowForward />}
              sx={{ color: colors.textPrimary, fontWeight: 700, borderBottom: `2px solid ${colors.accent}`, borderRadius: 0 }}
            >
              Ver todo el catálogo
            </Button>
          </Box>

          <Grid container spacing={3}>
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Skeleton variant="rounded" height={320} />
                </Grid>
              ))
            ) : motos.length > 0 ? (
              motos.map((moto) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={moto.id}>
                  <MotoCard moto={moto} />
                </Grid>
              ))
            ) : (
              <Grid size={12}>
                <Typography sx={{ textAlign: 'center', color: colors.textSecondary }}>
                  No hay motos disponibles por el momento.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* ── Banner promoción ── */}
      <Box sx={{ bgcolor: colors.primary, py: 8, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{
          position: 'absolute', right: -60, top: -60,
          width: 300, height: 300, borderRadius: '50%',
          bgcolor: colors.accent, opacity: 0.15,
        }} />
        <Box sx={{
          position: 'absolute', right: 40, bottom: -40,
          width: 200, height: 200, borderRadius: '50%',
          bgcolor: colors.accent, opacity: 0.25,
        }} />
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 600, position: 'relative', zIndex: 1 }}>
            <Chip
              icon={<LocalOffer sx={{ color: `${colors.textOnPrimary} !important` }} />}
              label="Promoción de julio"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: colors.textOnPrimary, mb: 3, fontWeight: 600 }}
            />
            <Typography variant="h3" sx={{ color: colors.textOnPrimary, fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
              Hasta 15% de descuento financiando a 24 meses
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 4 }}>
              Válido en modelos seleccionados Yamaha, Honda y KTM. Aplica para clientes nuevos y recurrentes.
            </Typography>
            <Button
              component={Link} to="/catalogo"
              variant="contained"
              sx={{
                bgcolor: colors.accent, color: '#fff',
                fontWeight: 700, px: 4, py: 1.5, borderRadius: 3,
                '&:hover': { bgcolor: '#e0265e' },
              }}
            >
              Quiero la promo
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}