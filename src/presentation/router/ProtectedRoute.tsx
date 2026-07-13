// src/presentation/router/ProtectedRoute.tsx
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'

type Rol = 'admin' | 'vendedor' | 'bodeguero'

interface ProtectedRouteProps {
  /** Contenido a renderizar si la autorización es correcta. */
  children: ReactNode
  /**
   * Si es true, además de estar autenticado el usuario debe tener is_staff = true.
   * Los usuarios normales autenticados son redirigidos a /.
   */
  requireStaff?: boolean
  /**
   * Roles de staff que NO deben poder entrar, aunque is_staff sea true.
   * Espeja exactamente los permission_classes del backend por sección
   * (ej. IsVendedorOrAdmin excluye a 'bodeguero' de Ventas/DetalleVenta).
   * No es un invento de UX: refleja 1:1 lo que la API ya rechaza.
   */
  excludeRoles?: Rol[]
}

/**
 * Ruta protegida por autenticación (y opcionalmente por rol de staff).
 *
 * Comportamiento:
 * - No autenticado → redirige a /login guardando la ruta actual en location.state.from
 * - Autenticado + requireStaff=true + user.is_staff=false → redirige a /admin
 * - Autenticado + staff + rol incluido en excludeRoles → redirige a /admin
 * - Autenticado (y staff/rol permitido si se requiere) → renderiza children
 */
export default function ProtectedRoute({
  children,
  requireStaff = false,
  excludeRoles = [],
}: ProtectedRouteProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  // Mientras loadSession() está en curso, no redirigir aún
  // (evita un flash de redirect al recargar con sesión válida)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Sin autenticar: ir al login guardando la ruta de origen
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Autenticado pero sin permisos de staff
  if (requireStaff && !user.is_staff) {
    return <Navigate to="/" replace />
  }

  // Staff, pero con un rol que el backend excluye explícitamente para esta sección
  if (requireStaff && user.rol && excludeRoles.includes(user.rol)) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}