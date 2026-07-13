// src/presentation/router/ProtectedRoute.tsx
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/presentation/store/auth.store'

interface ProtectedRouteProps {
  /** Contenido a renderizar si la autorización es correcta. */
  children: ReactNode
  /**
   * Si es true, además de estar autenticado el usuario debe tener is_staff = true.
   * Los usuarios normales autenticados son redirigidos a /.
   */
  requireStaff?: boolean
  /**
   * Si es true, además de estar autenticado el usuario debe tener rol 'admin'.
   * Implica requireStaff. El staff no-admin es redirigido a /admin (no a /,
   * porque sí tiene acceso al panel, solo no a esta pantalla en particular).
   */
  requireAdmin?: boolean
}

/**
 * Ruta protegida por autenticación (y opcionalmente por rol de staff/admin).
 *
 * Comportamiento:
 * - No autenticado → redirige a /login guardando la ruta actual en location.state.from
 * - Autenticado + requireStaff=true + user.is_staff=false → redirige a /
 * - Autenticado + requireAdmin=true + user.rol!=='admin' → redirige a /admin
 * - Autenticado (y staff/admin si se requiere) → renderiza children
 */
export default function ProtectedRoute({
  children,
  requireStaff = false,
  requireAdmin = false,
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

  // Autenticado y staff, pero sin rol de admin
  if (requireAdmin && user.rol !== 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}