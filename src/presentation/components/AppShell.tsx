// src/presentation/components/AppShell.tsx

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Box, IconButton, Button,
  Avatar, Menu, MenuItem, Divider, ListItemIcon, Container,
  Drawer, List, ListItemButton, ListItemText,
} from '@mui/material'
import {
  ShoppingCart, Person, Logout, Dashboard,
  Menu as MenuIcon, DirectionsBike, HistoryOutlined,
} from '@mui/icons-material'
import { useState } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import { useCarritoStore, selectCarritoCount } from '@/presentation/store/carrito.store'
import { colors } from '@/presentation/theme/colors'

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const cartItemCount = useCarritoStore(selectCarritoCount)

  async function handleLogout() {
    setAnchorEl(null)
    await logout()
    navigate('/login', { replace: true })
  }

  const navLinks = [
    { label: 'Catálogo', path: '/catalogo' },
    { label: 'Repuestos', path: '/repuestos' },
    { label: 'Contacto', path: '/contacto' },
  ]

  const clientLinks = user && !user.is_staff ? [
    { label: 'Mis Compras', path: '/mis-compras' },
    { label: 'Favoritos', path: '/favoritos' },
    { label: 'Financiamiento', path: '/financiamiento' },
    { label: 'Garantías', path: '/garantias' },
    { label: 'Mi Historial', path: '/mi-historial' },
  ] : []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: colors.background }}>

      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: colors.primary,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 } }}>

          <IconButton
            color="inherit"
            sx={{ display: { md: 'none' }, mr: 1 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              fontWeight: 800,
              color: colors.textOnPrimary,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '& span': { color: colors.accent },
            }}
          >
            Victal<span>Speed</span>
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 4 }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  color: location.pathname === link.path ? colors.accent : colors.textOnPrimary,
                  fontWeight: location.pathname === link.path ? 700 : 400,
                  '&:hover': { color: colors.accent },
                }}
              >
                {link.label}
              </Button>
            ))}
            {clientLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  color: location.pathname === link.path ? colors.accent : colors.textOnPrimary,
                  fontWeight: location.pathname === link.path ? 700 : 400,
                  '&:hover': { color: colors.accent },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user && !user.is_staff && (
            <IconButton component={Link} to="/carrito" sx={{ color: colors.textOnPrimary, mr: 1 }}>
              <ShoppingCart />
              {cartItemCount > 0 && (
                <Box sx={{
                  position: 'absolute', top: 6, right: 6,
                  bgcolor: colors.accent, color: '#fff',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartItemCount}
                </Box>
              )}
            </IconButton>
          )}

          {user ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ bgcolor: colors.accent, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                  {getInitials(user.username)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2 } } }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{user.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  {user.rol && (
                    <Typography variant="caption" sx={{ display: 'block', color: colors.accent, fontWeight: 600 }}>
                      {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                    </Typography>
                  )}
                </Box>
                <Divider />
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/perfil') }}>
                  <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                  Mi Perfil
                </MenuItem>
                {user && !user.is_staff && (
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/mi-historial') }}>
                    <ListItemIcon><HistoryOutlined fontSize="small" /></ListItemIcon>
                    Mi Historial
                  </MenuItem>
                )}
                {user.is_staff && (
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin') }}>
                    <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                    Panel Admin
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: colors.error }}>
                  <ListItemIcon><Logout fontSize="small" sx={{ color: colors.error }} /></ListItemIcon>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="small"
              sx={{
                bgcolor: colors.accent,
                color: colors.textOnAccent,
                fontWeight: 700,
                borderRadius: 3,
                '&:hover': { bgcolor: '#e0265e' },
              }}
            >
              Iniciar sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 1, fontWeight: 800 }}>
            Victal<span style={{ color: colors.accent }}>Speed</span>
          </Typography>
          <Divider />
          <List>
            {[...navLinks, ...clientLinks].map((link) => (
              <ListItemButton
                key={link.path}
                component={Link}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
                selected={location.pathname === link.path}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            {user?.is_staff && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItemButton component={Link} to="/admin" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon><DirectionsBike sx={{ color: colors.accent }} /></ListItemIcon>
                  <ListItemText primary="Panel Admin" />
                </ListItemButton>
                {user?.rol !== 'bodeguero' && (
                  <ListItemButton component={Link} to="/admin/ventas" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Gestión de Ventas" sx={{ pl: 4 }} />
                  </ListItemButton>
                )}
                <ListItemButton component={Link} to="/admin/marcas" onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary="Gestión de Marcas" sx={{ pl: 4 }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/categorias" onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary="Gestión de Categorías" sx={{ pl: 4 }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/financiamientos" onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary="Gestión de Financiamientos" sx={{ pl: 4 }} />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
      </Box>

      <Box component="footer" sx={{
        borderTop: `1px solid ${colors.border}`,
        py: 3,
        textAlign: 'center',
        bgcolor: colors.primary,
      }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Victal<span style={{ color: colors.accent }}>Speed</span> &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  )
}