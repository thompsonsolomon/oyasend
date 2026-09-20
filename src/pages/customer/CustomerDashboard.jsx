import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Plus,
  ShoppingCart,
  User,
} from 'lucide-react'

import { onAuthStateChanged } from 'firebase/auth'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import Logo from '../../components/ui/Logo'



const BRAND = {
  primary: '#087443',
  dark: '#061A14',
  yellow: '#F4D500',
  background: '#F6F8F6',
}


function CustomerDashboard() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      console.log(currentUser)
    })
    return () => unsubscribe()
  }, [])


  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    )

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setOrders(data)
        setLoading(false)
      },
      (error) => {
        console.error('Failed to load orders:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])


  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there'


  const activeOrder = orders.find((order) =>
    ['pending', 'accepted', 'picked_up', 'in_transit'].includes(
      order.status
    )
  )


  const getStatusLabel = (status) => {
    const statuses = {
      pending: 'Pending',
      accepted: 'Rider accepted',
      picked_up: 'Package picked up',
      in_transit: 'On the way',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }

    return statuses[status] || 'Processing'
  }


  const getStatusIcon = (status) => {
    if (status === 'delivered' || status === 'completed') {
      return <CheckCircle2 size={16} />
    }

    return <Clock3 size={16} />
  }


  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: BRAND.background }}
    >

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link to="/customer" className="flex items-center gap-2">

          <Logo />

            <div>
              <p
                className="text-lg font-black leading-none"
                style={{ color: BRAND.dark }}
              >
                OYA<span style={{ color: BRAND.primary }}>SEND</span>
              </p>

              <p className="mt-1 text-[10px] font-semibold tracking-widest text-gray-400">
                WE DELIVER. YOU RELAX.
              </p>
            </div>

          </Link>


          <div className="flex items-center gap-3">

            <Link
              to="/customer/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
            >
              <Bell size={19} />
            </Link>


            <Link
              to="/customer/profile"
              className="flex h-10 w-10 items-center TTW justify-center rounded-full text-white"
              style={{ backgroundColor: BRAND.dark }}
            >
              <User size={18} />
            </Link>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Welcome */}
        <section className="mb-8">

          <p className="text-sm font-medium text-gray-500">
            Welcome back 👋
          </p>

          <h1
            className="mt-1 text-3xl font-black sm:text-4xl"
            style={{ color: BRAND.dark }}
          >
            Hello, {firstName}
          </h1>

          <p className="mt-2 max-w-xl text-gray-500">
            What can OYASEND help you with today?
          </p>

        </section>


        {/* Services */}
        <section className="mb-10">

          <div className="mb-4 flex items-center justify-between">

            <h2
              className="text-lg font-bold"
              style={{ color: BRAND.dark }}
            >
              What do you need?
            </h2>

          </div>


          <div className="grid gap-4 sm:grid-cols-2">

            {/* Send Package */}
            <Link
              to="/customer/send-package"
              className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: BRAND.primary }}
            >

              <div className="relative z-10">

                <div className="mb-8 flex h-12 w-12 TTW items-center justify-center rounded-2xl bg-white/15">
                  <Package size={25} />
                </div>

                <h3 className="text-2xl text-white font-black">
                  Send a Package
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">
                  Send a package from one location to another quickly and safely.
                </p>

                <div className="mt-6 text-white/75   inline-flex items-center gap-2 text-sm font-bold">
                  Create delivery
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </div>

              </div>

            </Link>


            {/* Go To Market */}
            <Link
              to="/customer/go-to-market"
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${BRAND.yellow}25`,
                  color: BRAND.primary,
                }}
              >
                <ShoppingCart size={25} />
              </div>

              <h3
                className="text-2xl font-black"
                style={{ color: BRAND.dark }}
              >
                Go to Market
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Tell us what you need and we'll buy it from the market and deliver it to you.
              </p>

              <div
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: BRAND.primary }}
              >
                Create market order
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </div>

            </Link>

          </div>

        </section>


        {/* Active Order */}
        {activeOrder && (
          <section className="mb-10">

            <div className="mb-4 flex items-center justify-between">

              <h2
                className="text-lg font-bold"
                style={{ color: BRAND.dark }}
              >
                Active order
              </h2>

              <Link
                to={`/customer/orders/${activeOrder.id}`}
                className="text-sm font-bold"
                style={{ color: BRAND.primary }}
              >
                View details
              </Link>

            </div>


            <Link
              to={`/customer/orders/${activeOrder.id}`}
              className="block rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-4">

                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: `${BRAND.primary}15`,
                      color: BRAND.primary,
                    }}
                  >
                    {activeOrder.type === 'market'
                      ? <ShoppingCart size={22} />
                      : <Package size={22} />
                    }
                  </div>

                  <div>

                    <p className="text-xs font-medium text-gray-400">
                      ORDER #{activeOrder.id.slice(0, 8).toUpperCase()}
                    </p>

                    <h3
                      className="mt-1 font-bold"
                      style={{ color: BRAND.dark }}
                    >
                      {activeOrder.type === 'market'
                        ? 'Go to Market'
                        : 'Package Delivery'}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={15} />
                      {activeOrder.receiverLocation || 'Delivery in progress'}
                    </div>

                  </div>

                </div>


                <div
                  className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: `${BRAND.yellow}25`,
                    color: BRAND.dark,
                  }}
                >
                  {getStatusIcon(activeOrder.status)}
                  {getStatusLabel(activeOrder.status)}
                </div>

              </div>

            </Link>

          </section>
        )}


        {/* Recent Orders */}
        <section>

          <div className="mb-4 flex items-center justify-between">

            <h2
              className="text-lg font-bold"
              style={{ color: BRAND.dark }}
            >
              Recent orders
            </h2>

            <Link
              to="/customer/orders"
              className="text-sm font-bold"
              style={{ color: BRAND.primary }}
            >
              View all
            </Link>

          </div>


          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

            {loading ? (

              <div className="p-8 text-center text-sm text-gray-500">
                Loading your orders...
              </div>

            ) : orders.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `${BRAND.primary}12`,
                    color: BRAND.primary,
                  }}
                >
                  <Package size={25} />
                </div>

                <h3
                  className="mt-4 font-bold"
                  style={{ color: BRAND.dark }}
                >
                  No orders yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  Your deliveries and market orders will appear here.
                </p>

                <Link
                  to="/customer/send-package"
                  className="mt-5 inline-flex TTW items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  <Plus size={17} />
                  Send a package
                </Link>

              </div>

            ) : (

              <div className="divide-y divide-gray-100">

                {orders.map((order) => (

                  <Link
                    key={order.id}
                    to={`/customer/orders/${order.id}`}
                    className="flex flex-col gap-3 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${BRAND.primary}12`,
                          color: BRAND.primary,
                        }}
                      >
                        {order.type === 'market'
                          ? <ShoppingCart size={19} />
                          : <Package size={19} />
                        }
                      </div>

                      <div>

                        <p
                          className="font-bold"
                          style={{ color: BRAND.dark }}
                        >
                          {order.type === 'market'
                            ? 'Market Order'
                            : 'Package Delivery'}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>

                      </div>

                    </div>


                    <div className="flex items-center justify-between gap-5 sm:justify-end">

                      <span className="text-sm font-semibold text-gray-600">
                        {getStatusLabel(order.status)}
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-gray-400"
                      />

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </div>

        </section>

      </main>


      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 md:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            to="/customer"
            className="flex flex-col items-center gap-1 text-xs font-bold"
            style={{ color: BRAND.primary }}
          >
            <Package size={20} />
            Home
          </Link>

          <Link
            to="/customer/send-package"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
          >
            <Plus size={21} />
            Send
          </Link>

          <Link
            to="/customer/orders"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
          >
            <Clock3 size={20} />
            Orders
          </Link>

          <Link
            to="/customer/profile"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
          >
            <User size={20} />
            Profile
          </Link>

        </div>

      </nav>

    </div>
  )
}


export default CustomerDashboard