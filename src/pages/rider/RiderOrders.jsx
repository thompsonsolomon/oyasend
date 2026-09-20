import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";

/*
|--------------------------------------------------------------------------
| TEMPORARY DUMMY DATA
|--------------------------------------------------------------------------
| Set this to false when you want to completely rely on Firestore.
*/
const USE_DUMMY_DATA = true;

const DUMMY_ORDERS = [
  {
    id: "OY-10001",
    customerId: "customer-001",
    riderId: "demo-rider",
    status: "assigned",
    pickup: "Lekki Phase 1",
    destination: "Ikeja GRA",
    receiver: "Michael Johnson",
    receiverPhone: "08012345678",
    package: "Medium parcel",
    price: 4500,
    distance: 18.4,
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: "OY-10002",
    customerId: "customer-002",
    riderId: "demo-rider",
    status: "accepted",
    pickup: "Victoria Island",
    destination: "Yaba",
    receiver: "Sarah Williams",
    receiverPhone: "08023456789",
    package: "Small package",
    price: 3200,
    distance: 9.2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "OY-10003",
    customerId: "customer-003",
    riderId: "demo-rider",
    status: "in_transit",
    pickup: "Ikoyi",
    destination: "Surulere",
    receiver: "David Brown",
    receiverPhone: "08034567890",
    package: "Documents",
    price: 2800,
    distance: 11.7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "OY-10004",
    customerId: "customer-004",
    riderId: "demo-rider",
    status: "delivered",
    pickup: "Ajah",
    destination: "Lekki Phase 1",
    receiver: "Daniel Smith",
    receiverPhone: "08045678901",
    package: "Large parcel",
    price: 5000,
    distance: 14.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "OY-10005",
    customerId: "customer-005",
    riderId: "demo-rider",
    status: "declined",
    pickup: "Maryland",
    destination: "Gbagada",
    receiver: "James Wilson",
    receiverPhone: "08056789012",
    package: "Small parcel",
    price: 2500,
    distance: 6.8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
  },
];

/*
|--------------------------------------------------------------------------
| STATUS CONFIG
|--------------------------------------------------------------------------
*/

const STATUS_CONFIG = {
  assigned: {
    label: "New Request",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  accepted: {
    label: "Accepted",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },

  picked_up: {
    label: "Picked Up",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },

  in_transit: {
    label: "In Transit",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
  },

  declined: {
    label: "Declined",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const formatStatus = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: status?.replaceAll("_", " ") || "Unknown",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    }
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  let date;

  if (dateValue?.toDate) {
    date = dateValue.toDate();
  } else {
    date = new Date(dateValue);
  }

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatMoney = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function RiderOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD ORDERS
  |--------------------------------------------------------------------------
  */

  const loadOrders = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("You are not logged in.");
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK RIDER PROFILE
      |--------------------------------------------------------------------------
      */

      const riderRef = doc(db, "users", currentUser.uid);
      const riderSnap = await getDoc(riderRef);

      if (!riderSnap.exists()) {
        throw new Error("Rider profile was not found.");
      }

      const riderData = riderSnap.data();

      if (riderData.role !== "rider") {
        throw new Error("This account is not registered as a rider.");
      }

      /*
      |--------------------------------------------------------------------------
      | GET RIDER ORDERS
      |--------------------------------------------------------------------------
      */

      const ordersRef = collection(db, "orders");

      const ordersQuery = query(
        ordersRef,
        where("riderId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(ordersQuery);

      const firestoreOrders = snapshot.docs.map((orderDoc) => ({
        id: orderDoc.id,
        ...orderDoc.data(),
      }));

      /*
      |--------------------------------------------------------------------------
      | SORT NEWEST FIRST
      |--------------------------------------------------------------------------
      */

      firestoreOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);

        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);

        return dateB - dateA;
      });

      /*
      |--------------------------------------------------------------------------
      | TEMPORARY FALLBACK
      |--------------------------------------------------------------------------
      */

      if (firestoreOrders.length === 0 && USE_DUMMY_DATA) {
        setOrders(DUMMY_ORDERS);
      } else {
        setOrders(firestoreOrders);
      }
    } catch (err) {
      console.error("Failed to load rider orders:", err);

      setError(
        err?.message ||
          "Something went wrong while loading your orders."
      );

      /*
      |--------------------------------------------------------------------------
      | STILL SHOW DUMMY DATA WHILE TESTING
      |--------------------------------------------------------------------------
      */

      if (USE_DUMMY_DATA) {
        setOrders(DUMMY_ORDERS);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadOrders();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER ORDERS
  |--------------------------------------------------------------------------
  */

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }

    if (activeFilter === "active") {
      return orders.filter((order) =>
        ["assigned", "accepted", "picked_up", "in_transit"].includes(
          order.status
        )
      );
    }

    if (activeFilter === "completed") {
      return orders.filter((order) => order.status === "delivered");
    }

    if (activeFilter === "declined") {
      return orders.filter((order) => order.status === "declined");
    }

    return orders;
  }, [orders, activeFilter]);

  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const counts = useMemo(() => {
    return {
      all: orders.length,

      active: orders.filter((order) =>
        ["assigned", "accepted", "picked_up", "in_transit"].includes(
          order.status
        )
      ).length,

      completed: orders.filter(
        (order) => order.status === "delivered"
      ).length,

      declined: orders.filter(
        (order) => order.status === "declined"
      ).length,
    };
  }, [orders]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8F6]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-40 bg-gray-200 rounded-lg" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 bg-white rounded-2xl border border-gray-100"
                />
              ))}
            </div>

            <div className="h-12 bg-white rounded-xl border border-gray-100" />

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-44 bg-white rounded-2xl border border-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/rider")}
              className="text-sm text-gray-500 hover:text-[#087443] mb-2"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#061A14]">
              My Orders
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              View and manage your delivery orders.
            </p>
          </div>

          <button
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#061A14] hover:border-[#087443] transition disabled:opacity-50"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              ↻
            </span>

            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="font-semibold mb-1">
              Unable to load orders
            </div>

            <div>{error}</div>
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`text-left p-4 rounded-2xl border transition ${
              activeFilter === "all"
                ? "bg-[#061A14] border-[#061A14] text-white"
                : "bg-white border-gray-100 text-[#061A14] hover:border-gray-300"
            }`}
          >
            <p className="text-xs opacity-70">All Orders</p>
            <p className="text-2xl font-bold mt-1">
              {counts.all}
            </p>
          </button>

          <button
            onClick={() => setActiveFilter("active")}
            className={`text-left p-4 rounded-2xl border transition ${
              activeFilter === "active"
                ? "bg-[#087443] border-[#087443] text-white"
                : "bg-white border-gray-100 text-[#061A14] hover:border-gray-300"
            }`}
          >
            <p className="text-xs opacity-70">Active</p>
            <p className="text-2xl font-bold mt-1">
              {counts.active}
            </p>
          </button>

          <button
            onClick={() => setActiveFilter("completed")}
            className={`text-left p-4 rounded-2xl border transition ${
              activeFilter === "completed"
                ? "bg-green-700 border-green-700 text-white"
                : "bg-white border-gray-100 text-[#061A14] hover:border-gray-300"
            }`}
          >
            <p className="text-xs opacity-70">Completed</p>
            <p className="text-2xl font-bold mt-1">
              {counts.completed}
            </p>
          </button>

          <button
            onClick={() => setActiveFilter("declined")}
            className={`text-left p-4 rounded-2xl border transition ${
              activeFilter === "declined"
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-gray-100 text-[#061A14] hover:border-gray-300"
            }`}
          >
            <p className="text-xs opacity-70">Declined</p>
            <p className="text-2xl font-bold mt-1">
              {counts.declined}
            </p>
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-2 mb-5 flex gap-1 overflow-x-auto">
          {[
            ["all", "All"],
            ["active", "Active"],
            ["completed", "Completed"],
            ["declined", "Declined"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                activeFilter === value
                  ? "bg-[#061A14] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F6F8F6] flex items-center justify-center text-2xl mb-4">
              📦
            </div>

            <h2 className="text-lg font-semibold text-[#061A14]">
              No orders found
            </h2>

            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              There are no orders in this category yet.
            </p>

            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-5 px-4 py-2.5 rounded-xl bg-[#087443] text-white text-sm font-medium hover:bg-[#066238]"
              >
                View All Orders
              </button>
            )}
          </div>
        ) : (
          /* ORDERS */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = formatStatus(order.status);

              return (
                <button
                  key={order.id}
                  onClick={() =>
                    navigate(`/rider/orders/${order.id}`)
                  }
                  className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#087443]/40 hover:shadow-sm transition group"
                >
                  {/* TOP ROW */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-[#061A14]">
                          {order.id}
                        </h2>

                        <span
                          className={`text-[11px] px-2 py-1 rounded-full border font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-[#087443]">
                        {formatMoney(order.price)}
                      </p>

                      {order.distance && (
                        <p className="text-xs text-gray-400 mt-1">
                          {order.distance} km
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ROUTE */}
                  <div className="relative pl-7 space-y-5">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

                    {/* PICKUP */}
                    <div className="relative">
                      <div className="absolute -left-7 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#087443] bg-white" />

                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Pickup
                      </p>

                      <p className="text-sm font-medium text-[#061A14] mt-0.5">
                        {order.pickup || "Pickup location unavailable"}
                      </p>
                    </div>

                    {/* DESTINATION */}
                    <div className="relative">
                      <div className="absolute -left-7 top-1.5 w-3.5 h-3.5 rounded-full bg-[#F4D500]" />

                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Destination
                      </p>

                      <p className="text-sm font-medium text-[#061A14] mt-0.5">
                        {order.destination ||
                          "Destination unavailable"}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Receiver
                      </p>

                      <p className="text-sm font-medium text-[#061A14] mt-0.5">
                        {order.receiver || "—"}
                      </p>
                    </div>

                    <div className="text-gray-300 group-hover:text-[#087443] transition text-xl">
                      →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 md:hidden z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-around">
          <button
            onClick={() => navigate("/rider")}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-lg">⌂</span>
            <span className="text-[11px]">Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/rider/orders")}
            className="flex flex-col items-center gap-1 text-[#087443]"
          >
            <span className="text-lg">▣</span>
            <span className="text-[11px] font-medium">Orders</span>
          </button>

          <button
            onClick={() => navigate("/rider/profile")}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-lg">◉</span>
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}