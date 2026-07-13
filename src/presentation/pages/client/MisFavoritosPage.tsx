// src/presentation/pages/client/MisFavoritosPage.tsx

import { Link } from 'react-router-dom'
import {
  Box, Typography, Container, Grid, Card, CardContent, IconButton, Chip, Button,
} from '@mui/material'
import { TwoWheeler, Favorite, AddShoppingCart, FavoriteBorderOutlined } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { formatPrice } from '@/presentation/utils/formatters'
import { useFavoritosStore } from '@/presentation/store/favoritos.store'
import { useCarritoStore } from '@/presentation/store/carrito.store'
import type { Moto } from '@/domain/entities/moto.entity'

export default function MisFavoritosPage() {
  const items = useFavoritosStore((s) => s.items)
  const quitarFavorito = useFavoritosStore((s) => s.quitarFavorito)
  const agregarItem = useCarritoStore((s) => s.agregarItem)

  function handleAgregarAlCarrito(motoId: number) {
    const item = items.find((i) => i.motoId === motoId)
    if (!item) return

    // El carrito necesita la forma de Moto; la reconstruimos desde el favorito guardado.
    const motoParaCarrito: Moto = {
      id: item.motoId,
      modelo: item.modelo,
      precio: String(item.precio),
      estado: item.estado,
      imagen_url: item.imagenUrl,
      cilindraje: '',
      marca_nombre: item.marcaNombre,
      categoria_nombre: null,
      stock: item.stock,
    }
    agregarItem(motoParaCarrito, 1)
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 4 }}>
          Mis Favoritos
        </Typography>

        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FavoriteBorderOutlined sx={{ fontSize: 64, color: colors.accent, opacity: 0.4 }} />
            <Typography sx={{ color: colors.textSecondary, mt: 2, mb: 3 }}>
              Todavía no has marcado ninguna moto como favorita.
            </Typography>
            <Button component={Link} to="/catalogo" variant="contained"
              sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}>
              Ir al catálogo
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {items.map((item) => {
              const sinStock = item.stock <= 0
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.motoId}>
                  <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ position: 'relative', bgcolor: colors.border, height: 190 }}>
                      {item.imagenUrl ? (
                        <Box component="img" src={item.imagenUrl} alt={item.modelo}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TwoWheeler sx={{ fontSize: 56, color: colors.textSecondary, opacity: 0.3 }} />
                        </Box>
                      )}
                      <IconButton
                        onClick={() => quitarFavorito(item.motoId)}
                        sx={{
                          position: 'absolute', top: 8, right: 8,
                          bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' },
                        }}
                      >
                        <Favorite sx={{ fontSize: 20, color: colors.accent }} />
                      </IconButton>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                        {item.marcaNombre}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
                        {item.modelo}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 18, color: colors.accent }}>
                          {formatPrice(item.precio)}
                        </Typography>
                        {sinStock && (
                          <Chip label="Sin stock" size="small" sx={{ bgcolor: `${colors.error}20`, color: colors.error, fontWeight: 600, fontSize: 11 }} />
                        )}
                      </Box>
                      <Button
                        fullWidth variant="contained" disabled={sinStock}
                        startIcon={<AddShoppingCart />}
                        onClick={() => handleAgregarAlCarrito(item.motoId)}
                        sx={{ bgcolor: colors.accent, color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#e0265e' } }}
                      >
                        {sinStock ? 'Sin stock' : 'Agregar al carrito'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Container>
    </Box>
  )
}