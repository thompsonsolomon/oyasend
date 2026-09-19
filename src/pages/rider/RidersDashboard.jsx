
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  Power,
  RefreshCw,
  UserRound,
  Wallet,
  X,
  AlertCircle,
} from 'lucide-react'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'

import { auth, db } from '../../config/firebase'

/*
|--------------------------------------------------------------------------
| TEMPORARY DEVELOPMENT DATA
|--------------------------------------------------------------------------
|
| Set this to false when the customer/backend flow is ready.
|
| true  = If Firestore has no orders, show dummy rider data/orders.
| false = Only use real Firestore data.
|
*/

const USE_DUMMY_DATA = true

/*
|--------------------------------------------------------------------------
| TEMPORARY DUMMY DATA
|--------------------------------------------------------------------------
|
| This follows the SAME structure that the real backend/customer flow
| will eventually create in Firestore.
|
*/

const DUMMY_ORDERS = [
  {
    id: 'OY-10001',
    customerId: 'demo-customer-001',
    riderId: 'demo-rider',
    status: 'assigned',
    pickup: 'Lekki Phase 1',
    destination: 'Ikeja GRA',
    receiver: 'Michael Johnson',
    receiverPhone: '08031234567',
    package: 'Medium parcel',
    price: 4500,
    distance: '18.4 km',
    createdAt: new Date(),
    acceptedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
  },
]

const RiderDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [isAvailable, setIsAvailable] = useState(false)

  const [rider, setRider] = useState({
    name: '',
    deliveriesToday: 0,
    earningsToday: 0,
  })

  const [pendingOrder, setPendingOrder] = useState(null)
  const [recentDeliveries, setRecentDeliveries] = useState([])

  /*
  |--------------------------------------------------------------------------
  | CURRENT FIREBASE USER
  |--------------------------------------------------------------------------
  */

  const getCurrentUser = () => {
    const user = auth.currentUser

    if (!user) {
      throw new Error('You are not logged in.')
    }

    return user
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD RIDER PROFILE
  |--------------------------------------------------------------------------
  */

  const loadRiderProfile = async () => {
    const user = getCurrentUser()

    const riderRef = doc(db, 'users', user.uid)
    const riderSnapshot = await getDoc(riderRef)

    if (!riderSnapshot.exists()) {
      throw new Error(
        'Your rider profile could not be found.'
      )
    }

    const riderData = riderSnapshot.data()

    if (riderData.role !== 'rider') {
      throw new Error(
        'This account is not registered as a rider.'
      )
    }

    return riderData
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD ORDERS
  |--------------------------------------------------------------------------
  */

  const loadOrders = async () => {
    const user = getCurrentUser()

    /*
     * Real Firestore query.
     *
     * This gets orders allocated to THIS rider.
     */

    const ordersRef = collection(db, 'orders')

    const ordersQuery = query(
      ordersRef,
      where('riderId', '==', user.uid)
    )

    const snapshot = await getDocs(ordersQuery)

    const orders = snapshot.docs.map((orderDoc) => ({
      id: orderDoc.id,
      ...orderDoc.data(),
    }))

    /*
     * ---------------------------------------------------------------
     * TEMPORARY DEVELOPMENT FALLBACK
     * ---------------------------------------------------------------
     *
     * If the backend/customer system hasn't created real orders yet,
     * use our dummy order.
     */

    if (
      orders.length === 0 &&
      USE_DUMMY_DATA
    ) {
      return DUMMY_ORDERS
    }

    return orders
  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const getDate = (value) => {
    if (!value) return null

    if (
      typeof value?.toDate === 'function'
    ) {
      return value.toDate()
    }

    if (value instanceof Date) {
      return value
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return null
    }

    return date
  }

  /*
  |--------------------------------------------------------------------------
  | IS TODAY
  |--------------------------------------------------------------------------
  */

  const isToday = (value) => {
    const date = getDate(value)

    if (!date) return false

    const now = new Date()

    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD DASHBOARD
  |--------------------------------------------------------------------------
  */

  const loadDashboard = async (
    showRefresh = false
  ) => {
    try {
      setError('')

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const riderData =
        await loadRiderProfile()

      const orders =
        await loadOrders()

      /*
       * ---------------------------------------------------------------
       * RIDER PROFILE
       * ---------------------------------------------------------------
       */

      const name =
        riderData.fullName ||
        riderData.name ||
        'Rider'

      /*
       * ---------------------------------------------------------------
       * AVAILABILITY
       * ---------------------------------------------------------------
       */

      setIsAvailable(
        Boolean(
          riderData.isAvailable
        )
      )

      /*
       * ---------------------------------------------------------------
       * COMPLETED ORDERS TODAY
       * ---------------------------------------------------------------
       */

      const completedToday =
        orders.filter(
          (order) =>
            order.status ===
              'delivered' &&
            isToday(
              order.deliveredAt ||
                order.createdAt
            )
        )

      /*
       * ---------------------------------------------------------------
       * TODAY'S EARNINGS
       * ---------------------------------------------------------------
       */

      const earningsToday =
        completedToday.reduce(
          (total, order) =>
            total +
            Number(order.price || 0),
          0
        )

      setRider({
        name,
        deliveriesToday:
          completedToday.length,
        earningsToday,
      })

      /*
       * ---------------------------------------------------------------
       * NEW DELIVERY REQUEST
       * ---------------------------------------------------------------
       */

      const assignedOrder =
        orders.find(
          (order) =>
            order.status === 'assigned'
        )

      setPendingOrder(
        assignedOrder || null
      )

      /*
       * ---------------------------------------------------------------
       * RECENT DELIVERIES
       * ---------------------------------------------------------------
       */

      const completedOrders =
        orders
          .filter(
            (order) =>
              order.status ===
              'delivered'
          )
          .sort((a, b) => {
            const dateA =
              getDate(
                a.deliveredAt ||
                  a.createdAt
              )

            const dateB =
              getDate(
                b.deliveredAt ||
                  b.createdAt
              )

            return (
              (dateB?.getTime() || 0) -
              (dateA?.getTime() || 0)
            )
          })
          .slice(0, 5)

      setRecentDeliveries(
        completedOrders
      )
    } catch (error) {
      console.error(
        'Rider dashboard error:',
        error
      )

      setError(
        error?.message ||
          'Unable to load your dashboard.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadDashboard()
  }, [])

  /*
  |--------------------------------------------------------------------------
  | TOGGLE AVAILABILITY
  |--------------------------------------------------------------------------
  */

  const toggleAvailability = async () => {
    try {
      setActionError('')
      setActionLoading(true)

      const user = getCurrentUser()

      const newStatus =
        !isAvailable

      /*
       * IMPORTANT:
       *
       * This writes directly to Firestore.
       * No Express backend.
       */

      await updateDoc(
        doc(db, 'users', user.uid),
        {
          isAvailable: newStatus,
          updatedAt:
            serverTimestamp(),
        }
      )

      setIsAvailable(
        newStatus
      )
    } catch (error) {
      console.error(
        'Availability update error:',
        error
      )

      setActionError(
        error?.message ||
          'Unable to update availability.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ACCEPT ORDER
  |--------------------------------------------------------------------------
  */

  const acceptOrder = async () => {
    if (!pendingOrder?.id) {
      return
    }

    try {
      setActionError('')
      setActionLoading(true)

      /*
       * Dummy order:
       *
       * Don't write the temporary demo order to Firestore.
       */

      if (
        pendingOrder.id ===
        'OY-10001' &&
        pendingOrder.customerId ===
        'demo-customer-001'
      ) {
        setPendingOrder({
          ...pendingOrder,
          status: 'accepted',
          acceptedAt: new Date(),
        })

        return
      }

      const orderRef = doc(
        db,
        'orders',
        pendingOrder.id
      )

      await updateDoc(
        orderRef,
        {
          status: 'accepted',
          acceptedAt:
            serverTimestamp(),
        }
      )

      setPendingOrder(null)

      await loadDashboard(true)
    } catch (error) {
      console.error(
        'Accept order error:',
        error
      )

      setActionError(
        error?.message ||
          'Unable to accept this order.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DECLINE ORDER
  |--------------------------------------------------------------------------
  */

  const declineOrder = async () => {
    if (!pendingOrder?.id) {
      return
    }

    try {
      setActionError('')
      setActionLoading(true)

      /*
       * Dummy order:
       *
       * Just remove it from the screen.
       */

      if (
        pendingOrder.id ===
        'OY-10001' &&
        pendingOrder.customerId ===
        'demo-customer-001'
      ) {
        setPendingOrder(null)

        return
      }

      const orderRef = doc(
        db,
        'orders',
        pendingOrder.id
      )

      /*
       * We don't delete the order.
       *
       * The backend/customer/admin flow can later
       * decide what "declined" means.
       *
       * For now we simply mark it declined.
       */

      await updateDoc(
        orderRef,
        {
          status: 'declined',
          declinedAt:
            serverTimestamp(),
        }
      )

      setPendingOrder(null)

      await loadDashboard(true)
    } catch (error) {
      console.error(
        'Decline order error:',
        error
      )

      setActionError(
        error?.message ||
          'Unable to decline this order.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8F6] px-6">
        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#061A14]">
            <Loader2
              size={25}
              className="animate-spin text-white"
            />
          </div>

          <p className="mt-4 text-sm font-bold text-[#061A14]">
            Loading your dashboard...
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Please wait a moment.
          </p>

        </div>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR STATE
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8F6] px-5">

        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={25} />
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-[#061A14]">
            Couldn't load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadDashboard()
            }
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087443] text-sm font-bold text-white transition hover:bg-[#066438]"
          >
            <RefreshCw size={16} />
            Try again
          </button>

        </div>

      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN DASHBOARD
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-[#061A14]">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-4 sm:px-6">

          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              OYASEND
            </h1>

            <p className="text-[11px] font-medium text-gray-500">
              Rider Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700"
            >
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F4D500]" />
            </button>

            <Link
              to="/rider/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#061A14] text-white"
            >
              <UserRound size={18} />
            </Link>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6">

        {/* GREETING */}

        <section className="mb-6 flex items-start justify-between gap-4">

          <div>
            <p className="text-sm font-medium text-gray-500">
              Good morning 👋
            </p>

            <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {rider.name || 'Rider'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Ready for your next delivery?
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadDashboard(true)
            }
            disabled={refreshing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />
          </button>

        </section>

        {/* ACTION ERROR */}

        {actionError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div className="flex-1">
              <p className="text-xs font-bold text-red-700">
                Action failed
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                {actionError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActionError('')
              }
              className="text-red-400"
            >
              <X size={16} />
            </button>

          </div>
        )}

        {/* AVAILABILITY */}

        <section className="mb-6">

          <div
            className={`overflow-hidden rounded-2xl border transition ${
              isAvailable
                ? 'border-[#087443]/20 bg-[#087443]'
                : 'border-gray-200 bg-white'
            }`}
          >

            <div className="flex items-center justify-between gap-4 p-5">

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    isAvailable
                      ? 'bg-white/15 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Power size={22} />
                </div>

                <div>

                  <p
                    className={`text-sm font-bold ${
                      isAvailable
                        ? 'text-white'
                        : 'text-[#061A14]'
                    }`}
                  >
                    {isAvailable
                      ? 'You are available'
                      : 'You are offline'}
                  </p>

                  <p
                    className={`mt-0.5 text-xs ${
                      isAvailable
                        ? 'text-white/70'
                        : 'text-gray-500'
                    }`}
                  >
                    {isAvailable
                      ? 'You can receive new delivery requests.'
                      : 'Turn on availability to receive requests.'}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={toggleAvailability}
                disabled={actionLoading}
                className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isAvailable
                    ? 'bg-white/25'
                    : 'bg-gray-200'
                }`}
              >

                {actionLoading ? (
                  <Loader2
                    size={15}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin ${
                      isAvailable
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                  />
                ) : (
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                      isAvailable
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                )}

              </button>

            </div>

          </div>

        </section>

        {/* STATS */}

        <section className="mb-7 grid grid-cols-2 gap-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-4">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#087443]/10 text-[#087443]">
              <Package size={19} />
            </div>

            <p className="text-2xl font-extrabold">
              {rider.deliveriesToday}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500">
              Deliveries today
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4D500]/20 text-[#061A14]">
              <Wallet size={19} />
            </div>

            <p className="text-2xl font-extrabold">
              ₦{Number(
                rider.earningsToday
              ).toLocaleString()}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500">
              Earnings today
            </p>

          </div>

        </section>

        {/* NEW DELIVERY REQUEST */}

        {isAvailable &&
          pendingOrder && (

            <section className="mb-7">

              <div className="mb-3 flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#087443]">
                    New request
                  </p>

                  <h3 className="mt-1 text-lg font-extrabold">
                    Delivery available
                  </h3>
                </div>

                <span className="rounded-full bg-[#F4D500]/20 px-3 py-1 text-[11px] font-bold">
                  New
                </span>

              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                {/* ORDER INFO */}

                <div className="border-b border-gray-100 p-5">

                  <div className="mb-5 flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#061A14] text-white">
                        <Package size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-extrabold">
                          {pendingOrder.id}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {pendingOrder.package ||
                            'Delivery package'}
                        </p>
                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-lg font-extrabold text-[#087443]">
                        ₦{Number(
                          pendingOrder.price ||
                            0
                        ).toLocaleString()}
                      </p>

                      <p className="text-[11px] text-gray-500">
                        Rider fee
                      </p>

                    </div>

                  </div>

                  {/* ROUTE */}

                  <div className="rounded-xl bg-[#F6F8F6] p-4">

                    <div className="flex gap-3">

                      <div className="flex flex-col items-center pt-1">

                        <div className="h-2.5 w-2.5 rounded-full bg-[#087443]" />

                        <div className="my-1 h-9 w-px border-l border-dashed border-gray-300" />

                        <div className="h-2.5 w-2.5 rounded-full bg-[#F4D500]" />

                      </div>

                      <div className="flex-1 space-y-4">

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Pickup
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 text-sm font-bold">
                            <MapPin
                              size={13}
                              className="text-[#087443]"
                            />
                            {pendingOrder.pickup}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Deliver to
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 text-sm font-bold">
                            <MapPin
                              size={13}
                              className="text-[#F4D500]"
                            />
                            {pendingOrder.destination}
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>

                  {pendingOrder.distance && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Navigation size={14} />
                      {pendingOrder.distance}{' '}
                      estimated distance
                    </div>
                  )}

                </div>

                {/* RECEIVER */}

                {pendingOrder.receiver && (
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                        <UserRound size={17} />
                      </div>

                      <div>

                        <p className="text-sm font-bold">
                          {pendingOrder.receiver}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Receiver
                        </p>

                      </div>

                    </div>

                    {pendingOrder.receiverPhone && (
                      <a
                        href={`tel:${pendingOrder.receiverPhone}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#087443] transition hover:bg-gray-50"
                      >
                        <Phone size={17} />
                      </a>
                    )}

                  </div>
                )}

                {/* ACTIONS */}

                <div className="grid grid-cols-2 gap-3 p-4">

                  <button
                    type="button"
                    onClick={declineOrder}
                    disabled={actionLoading}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {actionLoading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <X size={17} />
                    )}

                    Decline

                  </button>

                  <button
                    type="button"
                    onClick={acceptOrder}
                    disabled={actionLoading}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087443] text-sm font-bold text-white transition hover:bg-[#066438] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {actionLoading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}

                    Accept

                  </button>

                </div>

              </div>

            </section>

          )}

        {/* NO REQUEST */}

        {isAvailable &&
          !pendingOrder && (

            <section className="mb-7 rounded-2xl border border-dashed border-gray-300 bg-white p-7 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Package size={21} />
              </div>

              <h3 className="mt-4 text-sm font-extrabold">
                No new deliveries
              </h3>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-gray-500">
                Stay available and we'll notify you when a delivery request is assigned to you.
              </p>

            </section>

          )}

        {/* RECENT DELIVERIES */}

        <section>

          <div className="mb-3 flex items-center justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Activity
              </p>

              <h3 className="mt-1 text-lg font-extrabold">
                Today's deliveries
              </h3>
            </div>

            <Link
              to="/rider/orders"
              className="flex items-center gap-1 text-xs font-bold text-[#087443]"
            >
              View all
              <ChevronRight size={15} />
            </Link>

          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

            {recentDeliveries.length ===
            0 ? (

              <div className="p-8 text-center">

                <Clock3
                  size={22}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-bold text-gray-600">
                  No deliveries yet
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Your completed deliveries will appear here.
                </p>

              </div>

            ) : (

              recentDeliveries.map(
                (delivery, index) => (

                  <Link
                    key={delivery.id}
                    to={`/rider/orders/${delivery.id}`}
                    className={`flex items-center justify-between gap-4 p-4 transition hover:bg-gray-50 ${
                      index !==
                      recentDeliveries.length -
                        1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087443]/10 text-[#087443]">
                        <Package size={17} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-bold">
                          {delivery.id}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {delivery.destination}
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock3 size={11} />

                          {getDate(
                            delivery.deliveredAt ||
                              delivery.createdAt
                          )?.toLocaleTimeString(
                            [],
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                            }
                          ) || 'Today'}
                        </div>

                      </div>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="text-sm font-extrabold">
                        ₦{Number(
                          delivery.price ||
                            0
                        ).toLocaleString()}
                      </p>

                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-[#087443]">
                        <CheckCircle2 size={11} />
                        {delivery.status}
                      </div>

                    </div>

                  </Link>

                )
              )

            )}

          </div>

        </section>

      </main>

      {/* MOBILE NAV */}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-around px-4">

          <Link
            to="/rider"
            className="flex flex-col items-center gap-1 text-[#087443]"
          >

            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#087443]/10">
              <Navigation size={18} />
            </div>

            <span className="text-[10px] font-bold">
              Home
            </span>

          </Link>

          <Link
            to="/rider/orders"
            className="flex flex-col items-center gap-1 text-gray-400 transition hover:text-[#087443]"
          >

            <div className="flex h-8 w-8 items-center justify-center">
              <Package size={19} />
            </div>

            <span className="text-[10px] font-bold">
              Orders
            </span>

          </Link>

          <Link
            to="/rider/profile"
            className="flex flex-col items-center gap-1 text-gray-400 transition hover:text-[#087443]"
          >

            <div className="flex h-8 w-8 items-center justify-center">
              <UserRound size={19} />
            </div>

            <span className="text-[10px] font-bold">
              Profile
            </span>

          </Link>

        </div>

      </nav>

    </div>
  )
}

export default RiderDashboard