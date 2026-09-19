import { useEffect, useState } from 'react'
import {
  doc,
  getDoc,
} from 'firebase/firestore'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { auth, db } from '../../config/firebase'
import { Clock3, Package, Plus, User } from 'lucide-react'


const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    description: 'Your order has been received and is waiting to be assigned.',
  },

  assigned: {
    label: 'Rider Assigned',
    description: 'A rider has been assigned to your delivery.',
  },

  accepted: {
    label: 'Accepted',
    description: 'The rider has accepted your delivery request.',
  },

  picked_up: {
    label: 'Picked Up',
    description: 'Your package has been picked up by the rider.',
  },

  in_transit: {
    label: 'In Transit',
    description: 'Your package is currently on its way to the receiver.',
  },

  delivered: {
    label: 'Delivered',
    description: 'Your package has been successfully delivered.',
  },

  declined: {
    label: 'Declined',
    description: 'The assigned rider declined this delivery.',
  },

  cancelled: {
    label: 'Cancelled',
    description: 'This delivery has been cancelled.',
  },
}


function getDateValue(timestamp) {
  if (!timestamp) return null

  if (typeof timestamp?.toDate === 'function') {
    return timestamp.toDate()
  }

  if (timestamp instanceof Date) {
    return timestamp
  }

  if (
    typeof timestamp === 'string' ||
    typeof timestamp === 'number'
  ) {
    const date = new Date(timestamp)

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return null
}


function formatDate(timestamp) {
  const date = getDateValue(timestamp)

  if (!date) return 'Not available'

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}


function formatDateTime(timestamp) {
  const date = getDateValue(timestamp)

  if (!date) return 'Not available'

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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


function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status
        ? status.replaceAll('_', ' ')
        : 'Unknown',
      description: 'Order status unavailable.',
    }
  )
}


function getTimeline(order) {
  return [
    {
      key: 'pending',
      title: 'Order Created',
      description: 'Your delivery request was created.',
      timestamp: order.createdAt,
      completed: true,
    },

    {
      key: 'accepted',
      title: 'Rider Accepted',
      description: 'A rider accepted your delivery.',
      timestamp: order.acceptedAt,
      completed: [
        'accepted',
        'picked_up',
        'in_transit',
        'delivered',
      ].includes(order.status),
    },

    {
      key: 'picked_up',
      title: 'Package Picked Up',
      description: 'The rider picked up your package.',
      timestamp: order.pickedUpAt,
      completed: [
        'picked_up',
        'in_transit',
        'delivered',
      ].includes(order.status),
    },

    {
      key: 'in_transit',
      title: 'In Transit',
      description: 'Your package is on the way.',
      timestamp: order.inTransitAt,
      completed: [
        'in_transit',
        'delivered',
      ].includes(order.status),
    },

    {
      key: 'delivered',
      title: 'Delivered',
      description: 'Your package was delivered successfully.',
      timestamp: order.deliveredAt,
      completed: order.status === 'delivered',
    },
  ]
}


function CustomerOrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError('')

        const currentUser = auth.currentUser

        if (!currentUser) {
          navigate('/login', { replace: true })
          return
        }

        if (!id) {
          setError('Order ID is missing.')
          return
        }

        const orderRef = doc(db, 'orders', id)
        const orderSnap = await getDoc(orderRef)

        if (!orderSnap.exists()) {
          setError('This order could not be found.')
          return
        }

        const orderData = orderSnap.data()

        // Important security check
        if (orderData.customerId !== currentUser.uid) {
          setError(
            'You do not have permission to view this order.'
          )
          return
        }

        setOrder({
          id: orderSnap.id,
          ...orderData,
        })
      } catch (err) {
        console.error(
          'Failed to load customer order:',
          err
        )

        setError(
          err?.message ||
          'Unable to load this order. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id, navigate])


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] px-4 py-6">
        <div className="mx-auto max-w-5xl animate-pulse">

          <div className="h-5 w-28 rounded bg-gray-200" />

          <div className="mt-5 h-8 w-52 rounded bg-gray-200" />

          <div className="mt-6 rounded-2xl bg-white p-6">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="mt-5 h-32 rounded-xl bg-gray-100" />
          </div>

        </div>
      </div>
    )
  }


  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] px-4 py-10">
        <div className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-[#012220]">
            Unable to load order
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || 'This order is unavailable.'}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/customer/orders')
            }
            className="mt-6 rounded-xl bg-[#012220] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Orders
          </button>

        </div>
      </div>
    )
  }


  const status = getStatusConfig(order.status)
  const timeline = getTimeline(order)

  const isCompleted =
    order.status === 'delivered'

  const isCancelled =
    ['cancelled', 'declined'].includes(
      order.status
    )


  return (
    <div className="min-h-screen bg-[#F6F8F6] px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* ================= BACK ================= */}

        <button
          type="button"
          onClick={() =>
            navigate('/customer/orders')
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#012220]"
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
              d="M15 18l-6-6 6-6"
            />
          </svg>

          Back to Orders
        </button>


        {/* ================= HEADER ================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <p className="text-sm font-medium text-[#20948B]">
              Order Details
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#012220] sm:text-3xl">
              {order.id}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Created {formatDateTime(order.createdAt)}
            </p>
          </div>


          <div className="rounded-full border border-[#B8DAD5] bg-white px-4 py-2 text-sm font-semibold text-[#012220]">
            {status.label}
          </div>

        </div>


        {/* ================= STATUS ================= */}

        <div className="mt-6 rounded-2xl bg-[#012220] p-5 text-white sm:p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">

              {isCompleted ? (
                <svg
                  className="h-6 w-6 text-[#C8EA80]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12l4 4L19 6"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-[#C8EA80]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                </svg>
              )}

            </div>


            <div>
              <p className="text-lg font-bold">
                {status.label}
              </p>

              <p className="mt-1 text-sm leading-6 text-white/70">
                {status.description}
              </p>
            </div>

          </div>

        </div>


        {/* ================= MAIN GRID ================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">


          {/* ================= LEFT ================= */}

          <div className="space-y-6">

            {/* Route */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

              <h2 className="text-base font-bold text-[#012220]">
                Delivery Route
              </h2>

              <div className="mt-6 flex gap-4">

                <div className="flex flex-col items-center">

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7F5F2] text-[#20948B]">

                    <span className="h-2.5 w-2.5 rounded-full bg-[#20948B]" />

                  </span>

                  <span className="my-1 h-16 w-px bg-gray-200" />

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F7E4] text-[#58751C]">

                    <span className="h-2.5 w-2.5 rounded-full bg-[#C8EA80]" />

                  </span>

                </div>


                <div className="flex-1 space-y-8">

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Pickup
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {order.pickup ||
                        order.pickupAddress ||
                        'Pickup unavailable'}
                    </p>

                    {order.pickupAddress &&
                      order.pickupAddress !==
                        order.pickup && (
                        <p className="mt-1 text-sm text-gray-500">
                          {order.pickupAddress}
                        </p>
                      )}
                  </div>


                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Destination
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {order.destination ||
                        order.destinationAddress ||
                        'Destination unavailable'}
                    </p>

                    {order.destinationAddress &&
                      order.destinationAddress !==
                        order.destination && (
                        <p className="mt-1 text-sm text-gray-500">
                          {order.destinationAddress}
                        </p>
                      )}
                  </div>

                </div>

              </div>

            </section>


            {/* Receiver */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

              <h2 className="text-base font-bold text-[#012220]">
                Receiver Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-[#F8FAF9] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Receiver
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {order.receiver ||
                      'Not provided'}
                  </p>
                </div>


                <div className="rounded-xl bg-[#F8FAF9] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Phone Number
                  </p>

                  {order.receiverPhone ? (
                    <a
                      href={`tel:${order.receiverPhone}`}
                      className="mt-1 block text-sm font-semibold text-[#20948B]"
                    >
                      {order.receiverPhone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      Not provided
                    </p>
                  )}
                </div>

              </div>

            </section>


            {/* Package */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

              <h2 className="text-base font-bold text-[#012220]">
                Package Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-[#F8FAF9] p-4">

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Package
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {order.package ||
                      'Not provided'}
                  </p>

                </div>


                <div className="rounded-xl bg-[#F8FAF9] p-4">

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Delivery Fee
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#012220]">
                    {formatPrice(order.price)}
                  </p>

                </div>

              </div>

            </section>


            {/* Rider */}

            {order.riderId && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

                <h2 className="text-base font-bold text-[#012220]">
                  Rider Information
                </h2>

                <div className="mt-5 flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F5F2] font-bold text-[#20948B]">
                    {(order.riderName ||
                      'Rider')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {order.riderName ||
                        'Rider assigned'}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {order.riderPhone ||
                        'Your rider is handling this delivery.'}
                    </p>
                  </div>

                </div>

              </section>
            )}

          </div>


          {/* ================= RIGHT ================= */}

          <div className="space-y-6">

            {/* Timeline */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

              <h2 className="text-base font-bold text-[#012220]">
                Delivery Progress
              </h2>

              <div className="mt-6">

                {timeline.map((item, index) => {

                  const isLast =
                    index === timeline.length - 1

                  return (
                    <div
                      key={item.key}
                      className="flex gap-3"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            item.completed
                              ? 'bg-[#012220] text-[#C8EA80]'
                              : 'border border-gray-200 bg-white text-gray-300'
                          }`}
                        >

                          {item.completed ? (
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 12l4 4L19 6"
                              />
                            </svg>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-current" />
                          )}

                        </div>

                        {!isLast && (
                          <div
                            className={`my-1 min-h-[55px] w-px ${
                              item.completed
                                ? 'bg-[#012220]'
                                : 'bg-gray-200'
                            }`}
                          />
                        )}

                      </div>


                      <div className="pb-7">

                        <p
                          className={`text-sm font-semibold ${
                            item.completed
                              ? 'text-[#012220]'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {item.description}
                        </p>

                        {item.timestamp && (
                          <p className="mt-2 text-[11px] font-medium text-gray-400">
                            {formatDateTime(
                              item.timestamp
                            )}
                          </p>
                        )}

                      </div>

                    </div>
                  )
                })}

              </div>

            </section>


            {/* Payment Summary */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

              <h2 className="text-base font-bold text-[#012220]">
                Payment Summary
              </h2>

              <div className="mt-5 space-y-3">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Delivery fee
                  </span>

                  <span className="font-medium text-gray-800">
                    {formatPrice(order.price)}
                  </span>
                </div>


                <div className="border-t border-gray-100 pt-3">

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-semibold text-gray-700">
                      Total
                    </span>

                    <span className="text-lg font-bold text-[#012220]">
                      {formatPrice(order.price)}
                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* Status notice */}

            {!isCompleted &&
              !isCancelled && (
                <div className="rounded-2xl border border-[#DCEFEA] bg-[#F0F8F6] p-5">

                  <div className="flex gap-3">

                    <div className="mt-0.5 text-[#20948B]">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 11v5"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8h.01"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#012220]">
                        Delivery in progress
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        We'll keep your order status updated as your package moves through the delivery process.
                      </p>
                    </div>

                  </div>

                </div>
              )}

          </div>

        </div>
   {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 md:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            to="/customer"
            className="flex flex-col items-center gap-1 text-xs font-bold"
            // style={{ color: BRAND.primary }}
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

    </div>
  )
}


export default CustomerOrderDetails