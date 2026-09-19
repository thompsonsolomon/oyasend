import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const {
    user,
    loading,
  } = useAuth()

  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading...
        </p>
      </div>
    )
  }

  // Not logged in → login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Logged in → allow protected route
  return <Outlet />
}

export default ProtectedRoute




export function GuestRoute() {
  const {
    user,
    profile,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading...
        </p>
      </div>
    )
  }

  // Not logged in → allow public pages
  if (!user) {
    return <Outlet />
  }

  // Logged in but profile is still unavailable
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">
          Unable to load your account.
        </p>
      </div>
    )
  }

  // Customer
  if (profile.role === 'customer') {
    return <Navigate to="/customer" replace />
  }

  // Rider
  if (profile.role === 'rider') {
    return <Navigate to="/rider" replace />
  }

  // Admin
  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  // Unknown role
  return <Navigate to="/login" replace />
}

