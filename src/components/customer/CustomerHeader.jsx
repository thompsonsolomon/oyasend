import { Bell, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../services/auth'

function CustomerHeader() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  async function handleLogout() {
    try {
      await logoutUser()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <button
          onClick={() => navigate('/customer')}
          className="text-xl font-extrabold tracking-tight text-green-600"
        >
          OYA SEND
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">

          <button
            onClick={() => navigate('/customer/notifications')}
            className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Notifications"
          >
            <Bell size={20} />

            {/* Notification indicator */}
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button
            onClick={() => navigate('/customer/profile')}
            className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-gray-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
              <User size={18} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {profile?.fullName || 'Customer'}
              </p>

              <p className="text-xs text-gray-500">
                Customer
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="hidden rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:block"
          >
            <span className="flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </span>
          </button>

        </div>

      </div>
    </header>
  )
}

export default CustomerHeader