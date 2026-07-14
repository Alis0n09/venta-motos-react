// src/presentation/router/AppRouter.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/presentation/store/auth.store'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/AppShell'
import PlaceholderPage from '../pages/PlaceholderPage'
import HomePage from '../pages/catalog/HomePage'
import CatalogPage from '../pages/catalog/CatalogPage'
import MotoDetailPage from '../pages/catalog/MotoDetailPage'
import ProfilePage from '../pages/auth/ProfilePage'
import ContactPage from '../pages/ContactPage'
import MisGarantiasPage from '../pages/client/MisGarantiasPage'
import AdminGarantiasPage from '../pages/admin/AdminGarantiasPage' 
import AdminHistorialPrecioPage from '../pages/admin/AdminHistorialPrecioPage'

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

const CarritoPage = lazy(() => import('../pages/catalog/CarritoPage'))
const MisComprasPage = lazy(() => import('../pages/client/MisComprasPage'))
const MisFavoritosPage = lazy(() => import('../pages/client/MisFavoritosPage'))
const FinanciamientoClientePage = lazy(() => import('../pages/client/FinanciamientoClientePage'))
const HistorialClientePage = lazy(() => import('../pages/client/HistorialClientePage'))
const AdminMarcasPage = lazy(() => import('../pages/admin/AdminMarcasPage'))
const AdminCategoriasPage = lazy(() => import('../pages/admin/AdminCategoriasPage'))
const AdminVentasPage = lazy(() => import('../pages/admin/AdminVentasPage'))
const AdminFinanciamientosPage = lazy(() => import('../pages/admin/AdminFinanciamientosPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))


const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))


function PageLoader() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '4px solid #FF2D78', borderTopColor: 'transparent',
        animation: 'spin 1s linear infinite',
      }} />
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
            <Route path="/" element={<HomePage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/catalogo/:id" element={<MotoDetailPage />} />
            <Route path="/repuestos" element={<RepuestosCatalogoPage />} />

            {/* ── Cliente autenticado ── */}
            <Route path="/carrito" element={
              <ProtectedRoute>
                <CarritoPage />
              </ProtectedRoute>
            } />
            <Route path="/mis-compras" element={
              <ProtectedRoute>
                <MisComprasPage />
              </ProtectedRoute>
            } />
            <Route path="/favoritos" element={
              <ProtectedRoute>
                <MisFavoritosPage />
              </ProtectedRoute>
            } />
            <Route path="/mis-compras/:id" element={
              <ProtectedRoute>
                <PlaceholderPage title="Detalle de Compra" />
              </ProtectedRoute>
            } />
            <Route path="/financiamiento" element={
              <ProtectedRoute>
                <FinanciamientoClientePage />
              </ProtectedRoute>
            } />
            <Route path="/mi-historial" element={
              <ProtectedRoute>
                <HistorialClientePage />
              </ProtectedRoute>
            } />
            <Route path="/garantias" element={
              <ProtectedRoute>
                <MisGarantiasPage />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <ProfilePage/>
              </ProtectedRoute>
            } />

            {/* ── Staff ── */}
            <Route path="/admin" element={
              <ProtectedRoute requireStaff>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/motos" element={
              <ProtectedRoute requireStaff>
                <PlaceholderPage title="Gestión de Motos" />
              </ProtectedRoute>
            } />
            <Route path="/admin/marcas" element={
              <ProtectedRoute requireStaff>
                <AdminMarcasPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/categorias" element={
              <ProtectedRoute requireStaff>
                <AdminCategoriasPage />
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
                <AdminVentasPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/financiamientos" element={
              <ProtectedRoute requireStaff>
                <AdminFinanciamientosPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute requireStaff>
                <PlaceholderPage title="Gestión de Usuarios" />
              </ProtectedRoute>
            } />
            <Route path="/admin/garantias" element={
              <ProtectedRoute requireStaff>
                <AdminGarantiasPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/historial-precios" element={
              <ProtectedRoute requireStaff>
                <AdminHistorialPrecioPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}