import { Outlet } from 'react-router-dom'

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  )
}

export default CustomerLayout