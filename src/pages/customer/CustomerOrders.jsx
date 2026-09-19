import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'

import { auth, db } from '../../config/firebase'
import { Clock3, Package, Plus, User } from 'lucide-react'


const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },

  assigned: {
    label: 'Rider Assigned',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },

  accepted: {
    label: 'Accepted',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },

  picked_up: {
    label: 'Picked Up',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },

  in_transit: {
    label: 'In Transit',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },

  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },

  declined: {
    label: 'Declined',
    className: 'bg-red-50 text-red-700 border-red-200',
  },

  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}


const FILTERS = [
  {
    key: 'all',
    label: 'All Orders',
  },
  {
    key: 'active',
    label: 'Active',
  },
  {
    key: 'delivered',
    label: 'Delivered',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
  },
]


function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status
        ? status.replaceAll('_', ' ')
        : 'Unknown',
      className: 'bg-gray-100 text-gray-600 border-gray-200',
    }
  )
}


function getDateValue(timestamp) {
  if (!timestamp) return null

  if (typeof timestamp?.toDate === 'function') {
    return timestamp.toDate()
  }

  if (timestamp instanceof Date) {
    return timestamp
  }

  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp)

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return null
}


function formatDate(timestamp) {
  const date = getDateValue(timestamp)

  if (!date) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}


function formatTime(timestamp) {
  const date = getDateValue(timestamp)

  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}


function formatPrice(price) {
  const amount = Number(price)

  if (Number.isNaN(amount)) {
    return '₦0'
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}


function getActiveStatus(status) {
  return [
    'pending',
    'assigned',
    'accepted',
    'picked_up',
    'in_transit',
  ].includes(status)
}


function getFilterCount(orders, filter) {
  if (filter === 'all') {
    return orders.length
  }

  if (filter === 'active') {
    return orders.filter((order) =>
      getActiveStatus(order.status)
    ).length
  }

  if (filter === 'delivered') {
    return orders.filter(
      (order) => order.status === 'delivered'
    ).length
  }

  if (filter === 'cancelled') {
    return orders.filter((order) =>
      ['cancelled', 'declined'].includes(order.status)
    ).length
  }

  return 0
}


function CustomerOrders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)


  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const currentUser = auth.currentUser

      if (!currentUser) {
        navigate('/login', { replace: true })
        return
      }

      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(ordersQuery)

      const fetchedOrders = snapshot.docs.map((orderDoc) => ({
        id: orderDoc.id,
        ...orderDoc.data(),
      }))

      setOrders(fetchedOrders)
    } catch (err) {
      console.error('Failed to load customer orders:', err)

      setError(
        err?.message ||
        'Unable to load your orders. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }


  useEffect(() => {
    fetchOrders()
  }, [])


  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return orders
    }

    if (activeFilter === 'active') {
      return orders.filter((order) =>
        getActiveStatus(order.status)
      )
    }

    if (activeFilter === 'delivered') {
      return orders.filter(
        (order) => order.status === 'delivered'
      )
    }

    if (activeFilter === 'cancelled') {
      return orders.filter((order) =>
        ['cancelled', 'declined'].includes(order.status)
      )
    }

    return orders
  }, [orders, activeFilter])


  const handleViewOrder = (orderId) => {
    navigate(`/customer/orders/${orderId}`)
  }


  return (
    <div className="min-h-screen bg-[#F6F8F6] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="mb-1 text-sm font-medium text-[#20948B]">
              Delivery history
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#012220] sm:text-3xl">
              My Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track and manage all your deliveries.
            </p>
          </div>


          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#20948B] hover:text-[#20948B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h5"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 20v-5h-5"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.5 15a7 7 0 0111.95-7.95L20 11"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.5 9a7 7 0 01-11.95 7.95L4 13"
                />
              </svg>

              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>


            <button
              type="button"
              onClick={() => navigate('/customer/send-package')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#012220] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A3D33]"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5v14"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14"
                />
              </svg>

              New Delivery
            </button>

          </div>

        </div>


        {/* ================= FILTERS ================= */}

        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-2xl border border-gray-200 bg-white p-2">

            {FILTERS.map((filter) => {
              const count = getFilterCount(
                orders,
                filter.key
              )

              const isActive =
                activeFilter === filter.key

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter.key)
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#012220] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}

                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}

          </div>
        </div>


        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">

              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div className="flex-1">
                <p className="font-semibold text-red-800">
                  Unable to load orders
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => fetchOrders()}
                  className="mt-3 text-sm font-semibold text-red-700 underline"
                >
                  Try again
                </button>
              </div>

            </div>
          </div>
        )}


        {/* ================= LOADING ================= */}

        {loading && (
          <div className="space-y-4">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="mt-3 h-5 w-48 rounded bg-gray-200" />
                    <div className="mt-4 h-4 w-72 max-w-full rounded bg-gray-100" />
                  </div>

                  <div className="h-7 w-24 rounded-full bg-gray-200" />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="h-14 rounded-xl bg-gray-100" />
                  <div className="h-14 rounded-xl bg-gray-100" />
                  <div className="h-14 rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}

          </div>
        )}


        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          filteredOrders.length === 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F7F5] text-[#20948B]">

                <svg
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7m16 0l-8 4m-8-4l8 4m0 0v10"
                  />
                </svg>

              </div>


              <h2 className="mt-5 text-lg font-bold text-[#012220]">
                {activeFilter === 'all'
                  ? 'No orders yet'
                  : `No ${FILTERS.find(
                      (filter) =>
                        filter.key === activeFilter
                    )?.label.toLowerCase()} found`}
              </h2>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {activeFilter === 'all'
                  ? 'Your delivery orders will appear here once you create your first delivery.'
                  : 'There are no orders matching this filter right now.'}
              </p>


              {activeFilter === 'all' && (
                <button
                  type="button"
                  onClick={() =>
                    navigate('/customer/send-package')
                  }
                  className="mt-6 rounded-xl bg-[#012220] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A3D33]"
                >
                  Send a Package
                </button>
              )}

            </div>
          )}


        {/* ================= ORDERS ================= */}

        {!loading &&
          !error &&
          filteredOrders.length > 0 && (
            <div className="space-y-4">

              {filteredOrders.map((order) => {
                const status = getStatusConfig(
                  order.status
                )

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#B8DAD5] hover:shadow-md sm:p-6"
                  >

                    {/* Top row */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-sm font-bold text-[#012220]">
                            {order.id}
                          </p>

                          <span className="text-xs text-gray-400">
                            •
                          </span>

                          <p className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                            {formatTime(order.createdAt) &&
                              ` · ${formatTime(order.createdAt)}`}
                          </p>

                        </div>


                        <div className="mt-4 flex items-start gap-3">

                          <div className="mt-1 flex flex-col items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#20948B]" />

                            <span className="my-1 h-8 w-px bg-gray-200" />

                            <span className="h-2.5 w-2.5 rounded-full bg-[#C8EA80]" />
                          </div>


                          <div className="min-w-0 space-y-4">

                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                Pickup
                              </p>

                              <p className="mt-1 truncate text-sm font-medium text-gray-800">
                                {order.pickup ||
                                  order.pickupAddress ||
                                  'Pickup location unavailable'}
                              </p>
                            </div>


                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                Destination
                              </p>

                              <p className="mt-1 truncate text-sm font-medium text-gray-800">
                                {order.destination ||
                                  order.destinationAddress ||
                                  'Destination unavailable'}
                              </p>
                            </div>

                          </div>

                        </div>

                      </div>


                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>

                        <p className="text-sm font-bold text-[#012220]">
                          {formatPrice(order.price)}
                        </p>

                      </div>

                    </div>


                    {/* Details */}

                    <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">

                      <div className="rounded-xl bg-[#F8FAF9] p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          Receiver
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                          {order.receiver ||
                            'Not provided'}
                        </p>
                      </div>


                      <div className="rounded-xl bg-[#F8FAF9] p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          Package
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                          {order.package ||
                            'Package details unavailable'}
                        </p>
                      </div>


                      <div className="rounded-xl bg-[#F8FAF9] p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          Rider
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                          {order.riderName ||
                            (order.riderId
                              ? 'Rider assigned'
                              : 'Not assigned')}
                        </p>
                      </div>

                    </div>


                    {/* Bottom actions */}

                    <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-2 text-xs text-gray-500">

                        {getActiveStatus(order.status) && (
                          <>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#20948B]" />

                            <span>
                              Delivery is in progress
                            </span>
                          </>
                        )}

                        {order.status === 'delivered' && (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />

                            <span>
                              Delivery completed
                            </span>
                          </>
                        )}

                        {['cancelled', 'declined'].includes(
                          order.status
                        ) && (
                          <>
                            <span className="h-2 w-2 rounded-full bg-red-500" />

                            <span>
                              Delivery was not completed
                            </span>
                          </>
                        )}

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          handleViewOrder(order.id)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#012220] px-4 py-2.5 text-sm font-semibold text-[#012220] transition hover:bg-[#012220] hover:text-white"
                      >
                        View Order

                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                    </div>

                  </article>
                )
              })}

            </div>
          )}


   {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 md:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            to="/customer"
            className="flex flex-col items-center gap-1 text-xs font-bold"
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
                        style={{ color:"#087443"}}

          >
             <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ backgroundColor:"#087443" }}
            >

            <Clock3 size={20} />
            </div>
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
    </div>
  )
}


export default CustomerOrders