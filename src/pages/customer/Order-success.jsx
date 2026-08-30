import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Receipt,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function OrderSuccess() {
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('oyaSendDispatch')

    if (!savedOrder) {
      navigate('/customer', { replace: true })
      return
    }

    try {
      setOrder(JSON.parse(savedOrder))
    } catch (error) {
      console.error('Unable to read order:', error)
      navigate('/customer', { replace: true })
    }
  }, [navigate])

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    )
  }

  /*
   * Temporary order information.
   *
   * Later this will come from the backend after
   * successful Paystack verification.
   */
  const orderNumber = 'OYA-10294'

  const deliveryFee =
    order.deliveryType === 'express'
      ? 3000
      : 2000

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">

          <button
            onClick={() => navigate('/customer')}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="ml-3">
            <p className="text-sm font-semibold text-green-600">
              OYA SEND
            </p>

            <h1 className="text-lg font-bold text-gray-900">
              Order confirmed
            </h1>
          </div>

        </div>
      </header>


      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Success */}
        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2
              size={44}
              className="text-green-600"
            />
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Your delivery is booked!
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
            Your payment was successful and we're getting your
            delivery ready.
          </p>

        </div>


        {/* Order card */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Order number */}
          <div className="border-b border-gray-100 p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                  <Receipt size={19} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Order number
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    {orderNumber}
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                Processing
              </span>

            </div>

          </div>


          {/* Route */}
          <div className="p-5 sm:p-6">

            <div className="flex gap-4">

              <div className="flex flex-col items-center">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <MapPin size={17} />
                </div>

                <div className="my-1 h-10 border-l border-dashed border-gray-300" />

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <MapPin size={17} />
                </div>

              </div>


              <div className="flex-1">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Pickup
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {order.pickupArea}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.pickupAddress}
                  </p>
                </div>


                <div className="mt-8">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Destination
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {order.deliveryArea}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.deliveryAddress}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* Package + payment */}
          <div className="border-t border-gray-100 p-5 sm:p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Package size={19} />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  {order.packageSize.charAt(0).toUpperCase() +
                    order.packageSize.slice(1)}{' '}
                  package
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {order.packageDescription}
                </p>
              </div>

            </div>


            <div className="mt-6 rounded-xl bg-gray-50 p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Amount paid
                </span>

                <span className="text-lg font-bold text-gray-900">
                  ₦{deliveryFee.toLocaleString()}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* Actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">

          <button
            onClick={() =>
              navigate(`/customer/orders/${orderNumber}`)
            }
            className="rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700"
          >
            Track delivery
          </button>

          <button
            onClick={() => navigate('/customer')}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to dashboard
          </button>

        </div>


        {/* Help */}
        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          Need help with your delivery? You can contact OYA SEND
          support from your account.
        </p>

      </main>

    </div>
  )
}

export default OrderSuccess