// src/presentation/pages/admin/AdminDashboardPage.tsx

import { Link } from 'react-router-dom'
import {
  Box, Typography, Container, Grid, Card, CardActionArea, CardContent, Chip,
} from '@mui/material'
import {
  TwoWheeler, LocalOfferOutlined, CategoryOutlined, Inventory2Outlined,
  ReceiptLongOutlined, AccountBalanceOutlined, PeopleAltOutlined,
} from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { useAuthStore } from '@/presentation/store/auth.store'

interface AdminSection {
  title: string
  description: string
  icon: React.ReactNode
  path: string
  disponible: boolean
  /**
   * Roles a los que el backend les bloquea esta sección aunque sean staff.
   * Solo Ventas tiene esto hoy: IsVendedorOrAdmin excluye explícitamente a
   * 'bodeguero'. Todo lo demás (Marcas, Categorías, Financiamientos) usa
   * IsStaffOrPublicReadOnly / IsStaffOrReadOnly, que no distingue por rol,
   * así que cualquier staff (admin, vendedor o bodeguero) puede entrar.
   */
  excludeRoles?: Array<'admin' | 'vendedor' | 'bodeguero'>
}

const SECCIONES: AdminSection[] = [
  {
    title: 'Motos',
    description: 'Crear, editar y dar de baja motos del catálogo.',
    icon: <TwoWheeler />,
    path: '/admin/motos',
    disponible: false,
  },
  {
    title: 'Marcas',
    description: 'Gestionar las marcas disponibles y su estado activo/inactivo.',
    icon: <LocalOfferOutlined />,
    path: '/admin/marcas',
    disponible: true,
  },
  {
    title: 'Categorías',
    description: 'Gestionar las categorías de motos (naked, deportiva, urbana, etc.).',
    icon: <CategoryOutlined />,
    path: '/admin/categorias',
    disponible: true,
  },
  {
    title: 'Inventario',
    description: 'Ver y ajustar el stock por sucursal.',
    icon: <Inventory2Outlined />,
    path: '/admin/inventario',
    disponible: false,
  },
  {
    title: 'Ventas',
    description: 'Ver todas las ventas, crear ventas manuales y asignar vendedor.',
    icon: <ReceiptLongOutlined />,
    path: '/admin/ventas',
    disponible: true,
    excludeRoles: ['bodeguero'],
  },
  {
    title: 'Financiamientos',
    description: 'Gestionar financiamientos y marcar cuotas como pagadas o vencidas.',
    icon: <AccountBalanceOutlined />,
    path: '/admin/financiamientos',
    disponible: true,
  },
  {
    title: 'Usuarios',
    description: 'Gestionar clientes, vendedores y roles de acceso.',
    icon: <PeopleAltOutlined />,
    path: '/admin/usuarios',
    disponible: false,
  },
]

function SeccionCard({ seccion, bloqueadaPorRol }: { seccion: AdminSection; bloqueadaPorRol: boolean }) {
  const habilitada = seccion.disponible && !bloqueadaPorRol

  const contenido = (
    <Card sx={{
      borderRadius: 3, height: '100%',
      opacity: habilitada ? 1 : 0.6,
      transition: 'transform 0.15s ease',
      '&:hover': habilitada ? { transform: 'translateY(-3px)' } : undefined,
    }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2, bgcolor: colors.accentLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent,
          }}>
            {seccion.icon}
          </Box>
          {!seccion.disponible && (
            <Chip label="Próximamente" size="small" sx={{ bgcolor: colors.border, color: colors.textSecondary, fontWeight: 600 }} />
          )}
          {seccion.disponible && bloqueadaPorRol && (
            <Chip label="Sin acceso" size="small" sx={{ bgcolor: `${colors.error}20`, color: colors.error, fontWeight: 600 }} />
          )}
        </Box>
        <Typography sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
          {seccion.title}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          {seccion.description}
        </Typography>
      </CardContent>
    </Card>
  )

  if (!habilitada) {
    return contenido
  }

  return (
    <CardActionArea component={Link} to={seccion.path} sx={{ borderRadius: 3, height: '100%' }}>
      {contenido}
    </CardActionArea>
  )
}

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 1 }}>
          Panel de {user?.rol === 'vendedor' ? 'Vendedor' : user?.rol === 'bodeguero' ? 'Bodega' : 'Administración'}
        </Typography>
        <Typography sx={{ color: colors.textSecondary, mb: 4 }}>
          Elige una sección para gestionar.
        </Typography>

        <Grid container spacing={3}>
          {SECCIONES.map((seccion) => {
            const bloqueadaPorRol = !!(user?.rol && seccion.excludeRoles?.includes(user.rol))
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={seccion.path}>
                <SeccionCard seccion={seccion} bloqueadaPorRol={bloqueadaPorRol} />
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}