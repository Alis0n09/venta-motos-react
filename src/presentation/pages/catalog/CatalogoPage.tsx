// src/presentation/pages/catalog/CatalogoPage.tsx

import { useState, useEffect } from 'react'
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Chip, Skeleton,
} from '@mui/material'
import { TwoWheeler, Favorite, FavoriteBorder } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { motoUseCase } from '@/infrastructure/factories/moto.factory'
import { formatPrice } from '@/presentation/utils/formatters'
import { useFavoritosStore } from '@/presentation/store/favoritos.store'
import { useAuthStore } from '@/presentation/store/auth.store'
import type { Moto } from '@/domain/entities/moto.entity'

function MotoCatalogCard({ moto }: { moto: Moto }) {
  const toggleFavorito = useFavoritosStore((s) => s.toggleFavorito)
  const esFavorito = useFavoritosStore((s) => s.esFavorito(moto.id))
  const user = useAuthStore((s) => s.user)

  const sinStock = moto.stock <= 0
  const stockLabel = sinStock ? 'Sin stock' : moto.stock <= 3 ? 'Pocas u.' : 'En stock'
  const stockColor = sinStock ? colors.error : moto.stock <= 3 ? colors.warning : colors.success

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', bgcolor: colors.border, height: 190 }}>
        {moto.imagen_url ? (
          <Box component="img" src={moto.imagen_url} alt={moto.modelo}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TwoWheeler sx={{ fontSize: 56, color: colors.textSecondary, opacity: 0.3 }} />
          </Box>
        )}
        {user && !user.is_staff && (
          <Box
            onClick={() => toggleFavorito(moto)}
            sx={{
              position: 'absolute', top: 8, right: 8, width: 34, height: 34,
              borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', '&:hover': { bgcolor: '#fff' },
            }}
          >
            {esFavorito ? (
              <Favorite sx={{ fontSize: 20, color: colors.accent }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 20, color: colors.textSecondary }} />
            )}
          </Box>
        )}
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
          {moto.marca_nombre} · {moto.cilindraje}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
          {moto.modelo}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: colors.accent }}>
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

export default function CatalogoPage() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    motoUseCase.listarDisponibles()
      .then(setMotos)
      .catch(() => setError('No se pudo cargar el catálogo de motos.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 4 }}>
          Catálogo de Motos
        </Typography>

        {error && <Typography sx={{ color: colors.error, mb: 3 }}>{error}</Typography>}

        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={340} />
              </Grid>
            ))
          ) : motos.length > 0 ? (
            motos.map((moto) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={moto.id}>
                <MotoCatalogCard moto={moto} />
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
  )
}