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


  if (!user) {
    return <Navigate to="/login" replace />
  }


  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">
          Unable to load your account.
        </p>
      </div>
    )
  }


  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }


  return <Outlet />
}


export default RoleRoute