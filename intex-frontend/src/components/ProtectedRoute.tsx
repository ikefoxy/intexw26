import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export function ProtectedRoute({ requiredRole }: { requiredRole?: string }) {
  const { token, hasRole } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/impact" replace />
  }

  return <Outlet />
}

