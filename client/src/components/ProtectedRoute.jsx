// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ role }) {
  const { user } = useSelector(s => s.auth)

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />

  // Vendor trying to access customer pages → go to vendor dashboard
  if (role === 'customer' && user.role === 'vendor')
    return <Navigate to="/vendor" replace />

  // Vendor trying to access admin pages → go to vendor dashboard
  if (role === 'admin' && user.role === 'vendor')
    return <Navigate to="/vendor" replace />

  // Customer trying to access vendor pages → go to home
  if (role === 'vendor' && user.role === 'customer')
    return <Navigate to="/" replace />

  // Customer trying to access admin pages → go to home
  if (role === 'admin' && user.role === 'customer')
    return <Navigate to="/" replace />

  // Admin can access everything
  if (user.role === 'admin') return <Outlet />

  // Role matches → allow
  if (!role || user.role === role) return <Outlet />

  // Fallback
  return <Navigate to="/" replace />
} 