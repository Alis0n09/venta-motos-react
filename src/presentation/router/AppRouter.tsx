// src/presentation/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/AppShell'
import PlaceholderPage from '../pages/PlaceholderPage'
import HomePage from '../pages/catalog/HomePage'

const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const SucursalesListPage = lazy(() => import('../pages/admin/sucursales/SucursalesListPage'))
const ProveedoresPage = lazy(() => import('../pages/admin/proveedores/ProveedoresPage'))
const InventarioPage = lazy(() => import('../pages/admin/inventario/InventarioPage'))
const ComprasPage = lazy(() => import('../pages/admin/compras/ComprasPage'))
const NuevaCompraPage = lazy(() => import('../pages/admin/compras/NuevaCompraPage'))
const CompraDetallePage = lazy(() => import('../pages/admin/compras/CompraDetallePage'))
const MantenimientosPage = lazy(() => import('../pages/admin/mantenimientos/MantenimientosPage'))
const RepuestosPage = lazy(() => import('../pages/admin/repuestos/RepuestosPage'))
const RepuestosCatalogoPage = lazy(() => import('../pages/catalog/RepuestosPage'))
const DireccionesPage = lazy(() => import('../pages/admin/direcciones/DireccionesPage'))
const SucursalStaffPage = lazy(() => import('../pages/admin/sucursal-staff/SucursalStaffPage'))
const LogsActividadPage = lazy(() => import('../pages/admin/logs-actividad/LogsActividadPage'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function AppRouter() {
  const loadSession = useAuthStore((state) => state.loadSession)

  useEffect(() => {
    loadSession()
  }, [loadSession])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Auth (sin AppShell) ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recuperar-password" element={<PlaceholderPage title="Recuperar contraseña" />} />

          <Route element={<AppShell />}>
            {/* ── Públicas ── */}
            <Route path="/" element={<HomePage/>} />
            <Route path="/contacto" element={<PlaceholderPage title="Contacto" />} />
            <Route path="/catalogo" element={<PlaceholderPage title="Catálogo de Motos" />} />
            <Route path="/catalogo/:id" element={<PlaceholderPage title="Detalle de Moto" />} />
            <Route path="/repuestos" element={<RepuestosCatalogoPage />} />

            {/* ── Cliente autenticado ── */}
            <Route path="/carrito" element={
              <ProtectedRoute>
                <PlaceholderPage title="Carrito" />
              </ProtectedRoute>
            } />
            <Route path="/mis-compras" element={
              <ProtectedRoute>
                <PlaceholderPage title="Mis Compras" />
              </ProtectedRoute>
            } />
            <Route path="/mis-compras/:id" element={
              <ProtectedRoute>
                <PlaceholderPage title="Detalle de Compra" />
              </ProtectedRoute>
            } />
            <Route path="/financiamiento" element={
              <ProtectedRoute>
                <PlaceholderPage title="Mi Financiamiento" />
              </ProtectedRoute>
            } />
            <Route path="/garantias" element={
              <ProtectedRoute>
                <PlaceholderPage title="Mis Garantías" />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <PlaceholderPage title="Mi Perfil" />
              </ProtectedRoute>
            } />

            {/* ── Staff ── */}
            <Route path="/admin" element={
              <ProtectedRoute requireStaff>
                <PlaceholderPage title="Dashboard Admin" />
              </ProtectedRoute>
            } />
            <Route path="/admin/motos" element={
              <ProtectedRoute requireStaff>
                <PlaceholderPage title="Gestión de Motos" />
              </ProtectedRoute>
            } />
            <Route path="/admin/inventario" element={
              <ProtectedRoute requireStaff>
                <InventarioPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/sucursales" element={
              <ProtectedRoute requireStaff>
                <SucursalesListPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/proveedores" element={
              <ProtectedRoute requireStaff>
                <ProveedoresPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/compras" element={
              <ProtectedRoute requireStaff>
                <ComprasPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/compras/nueva" element={
              <ProtectedRoute requireStaff>
                <NuevaCompraPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/compras/:id" element={
              <ProtectedRoute requireStaff>
                <CompraDetallePage />
              </ProtectedRoute>
            } />
            <Route path="/admin/mantenimientos" element={
              <ProtectedRoute requireStaff>
                <MantenimientosPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/repuestos" element={
              <ProtectedRoute requireStaff>
                <RepuestosPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/direcciones" element={
              <ProtectedRoute requireStaff>
                <DireccionesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/sucursal-staff" element={
              <ProtectedRoute requireStaff>
                <SucursalStaffPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs-actividad" element={
              <ProtectedRoute requireStaff requireAdmin>
                <LogsActividadPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/ventas" element={
              <ProtectedRoute requireStaff>
                <PlaceholderPage title="Gestión de Ventas" />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute requireStaff>
                <PlaceholderPage title="Gestión de Usuarios" />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}