import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import CustomerLayout from '../layouts/CustomerLayout'
import RiderLayout from '../layouts/RiderLayout'
import AdminLayout from '../layouts/AdminLayout'

import ProtectedRoute, { GuestRoute } from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import Register from '../pages/public/Register'
import Login from '../pages/public/Login'
import ForgotPassword from '../pages/public/ForgotPassword'
import CustomerDashboard from '../pages/customer/CustomerDashboard'
import SendPackage from '../pages/customer/SendPackage'
import DispatchOrderReview from '../pages/customer/DispatchOrderReview'
import Payment from '../pages/customer/Payment'
import OrderSuccess from '../pages/customer/Order-success'
import Home from '../pages/public/LandingPage'
import RiderDashboard from '../pages/rider/RidersDashboard'
import RiderOrders from '../pages/rider/RiderOrders'
import RiderOrderDetails from '../pages/rider/RiderOrderDetails'
import RiderProfile from '../pages/rider/RiderProfile'
import CustomerOrders from '../pages/customer/CustomerOrders'
import CustomerOrderDetails from '../pages/customer/CustomerOrderDetails'
import CustomerProfile from '../pages/customer/CustomerProfile'

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================= PUBLIC ================= */}

        {/* <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={
              <Home />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

        </Route> */}

        <Route element={<GuestRoute />}>
          <Route element={<PublicLayout />}>

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

          </Route>
        </Route>


        {/* ================= CUSTOMER ================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['customer']} />}>

            <Route element={<CustomerLayout />}>

              <Route
                path="/customer"
                element={<CustomerDashboard />}
              />
              <Route
                path="/customer/orders"
                element={<CustomerOrders />}
              />
              <Route
                path="/customer/send-package"
                element={<SendPackage />}
              />
              <Route
                path="/customer/orders/:id"
                element={<CustomerOrderDetails />}
              />

              <Route
                path="/customer/profile"
                element={<CustomerProfile />}
              />


              <Route
                path="/customer/send-package/review"
                element={<DispatchOrderReview />}
              />
              <Route
                path="/customer/payment"
                element={<Payment />}
              />
              <Route
                path="/customer/order-success"
                element={<OrderSuccess />}
              />

            </Route>

          </Route>
        </Route>


        {/* ================= RIDER ================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['rider']} />}>

            <Route element={<RiderLayout />}>

              <Route
                path="/rider"
                element={<RiderDashboard />}
              />
              <Route path="/rider/orders" element={<RiderOrders />} />
              <Route
                path="/rider/orders/:id"
                element={<RiderOrderDetails />}
              />
              <Route
                path="/rider/profile"
                element={<RiderProfile />}
              />
            </Route>

          </Route>
        </Route>


        {/* ================= ADMIN ================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['admin']} />}>

            <Route element={<AdminLayout />}>

              <Route
                path="/admin"
                element={<div>Admin Dashboard</div>}
              />

            </Route>

          </Route>
        </Route>


        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export { AppRoutes }