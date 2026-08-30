import { ArrowRight, PackageOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function RecentOrders({ orders = [] }) {
  const navigate = useNavigate()

  return (
    <section>

      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Recent orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Keep track of your latest deliveries.
          </p>
        </div>

        {orders.length > 0 && (
          <button
            onClick={() => navigate('/customer/orders')}
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            View all
          </button>
        )}

      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <PackageOpen size={26} />
          </div>

          <h3 className="mt-4 font-semibold text-gray-900">
            No orders yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Your deliveries will appear here once you place your first order.
          </p>

          <button
            onClick={() => navigate('/customer/send-package')}
            className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Send your first package
          </button>

        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/customer/orders/${order.id}`)}
              className="flex w-full items-center justify-between rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {order.id}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {order.pickup} → {order.destination}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                  {order.status}
                </span>

                <ArrowRight size={18} className="text-gray-400" />
              </div>

            </button>
          ))}
        </div>
      )}

    </section>
  )
}

export default RecentOrders