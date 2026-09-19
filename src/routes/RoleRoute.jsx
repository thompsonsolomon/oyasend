import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RoleRoute({ allowedRoles }) {
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

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is logged in but profile hasn't loaded
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">
          Unable to load your account.
        </p>
      </div>
    )
  }

  // User doesn't have permission for this section
  if (!allowedRoles.includes(profile.role)) {

    if (profile.role === 'customer') {
      return <Navigate to="/customer" replace />
    }

    if (profile.role === 'rider') {
      return <Navigate to="/rider" replace />
    }

    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RoleRoute