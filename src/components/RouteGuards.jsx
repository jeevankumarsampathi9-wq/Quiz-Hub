import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to="/" replace state={{ from: location.pathname }} />
}

export function PublicOnly({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export function CreatorOnly() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
}
