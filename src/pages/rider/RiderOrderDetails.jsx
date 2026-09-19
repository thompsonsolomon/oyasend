import  { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";

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

const formatMoney = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const formatDate = (value) => {
  if (!value) return "—";

  let date;

  if (value?.toDate) {
    date = value.toDate();
  } else {
    date = new Date(value);
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

export default function RiderOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD ORDER
  |--------------------------------------------------------------------------
  */

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("You are not logged in.");
      }

      if (!id) {
        throw new Error("Order ID is missing.");
      }

      /*
      |--------------------------------------------------------------------------
      | GET RIDER
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
      | GET ORDER
      |--------------------------------------------------------------------------
      */

      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        throw new Error("This order does not exist.");
      }

      const orderData = {
        id: orderSnap.id,
        ...orderSnap.data(),
      };

      /*
      |--------------------------------------------------------------------------
      | SECURITY CHECK
      |--------------------------------------------------------------------------
      | Rider can only view an order assigned to them.
      */

      if (orderData.riderId !== currentUser.uid) {
        throw new Error(
          "You are not authorized to view this order."
        );
      }

      setOrder(orderData);
    } catch (err) {
      console.error("Failed to load order:", err);

      setError(
        err?.message ||
          "Something went wrong while loading this order."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadOrder();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE ORDER STATUS
  |--------------------------------------------------------------------------
  */

  const updateOrderStatus = async (newStatus) => {
    try {
      if (!order) return;

      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("You are not logged in.");
      }

      setUpdating(true);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | STATUS VALIDATION
      |--------------------------------------------------------------------------
      */

      const validTransitions = {
        assigned: ["accepted", "declined"],
        accepted: ["picked_up"],
        picked_up: ["in_transit"],
        in_transit: ["delivered"],
        delivered: [],
        declined: [],
      };

      const allowedStatuses =
        validTransitions[order.status] || [];

      if (!allowedStatuses.includes(newStatus)) {
        throw new Error(
          `You cannot change this order from "${order.status}" to "${newStatus}".`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | FIRESTORE UPDATE
      |--------------------------------------------------------------------------
      */

      const orderRef = doc(db, "orders", order.id);

      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === "accepted") {
        updateData.acceptedAt = serverTimestamp();
      }

      if (newStatus === "picked_up") {
        updateData.pickedUpAt = serverTimestamp();
      }

      if (newStatus === "in_transit") {
        updateData.inTransitAt = serverTimestamp();
      }

      if (newStatus === "delivered") {
        updateData.deliveredAt = serverTimestamp();
      }

      if (newStatus === "declined") {
        updateData.declinedAt = serverTimestamp();
      }

      await updateDoc(orderRef, updateData);

      /*
      |--------------------------------------------------------------------------
      | UPDATE LOCAL UI
      |--------------------------------------------------------------------------
      */

      setOrder((previous) => ({
        ...previous,
        status: newStatus,
      }));
    } catch (err) {
      console.error("Failed to update order:", err);

      setError(
        err?.message ||
          "Unable to update the order. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8F6]">
        <div className="max-w-4xl mx-auto px-4 py-6 animate-pulse">

          <div className="h-4 w-32 bg-gray-200 rounded mb-6" />

          <div className="h-8 w-52 bg-gray-200 rounded mb-2" />

          <div className="h-4 w-72 bg-gray-200 rounded mb-8" />

          <div className="h-32 bg-white rounded-2xl border border-gray-100 mb-5" />

          <div className="h-64 bg-white rounded-2xl border border-gray-100 mb-5" />

          <div className="h-48 bg-white rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] px-4 py-10">
        <div className="max-w-lg mx-auto">

          <button
            onClick={() => navigate("/rider/orders")}
            className="text-sm text-gray-500 hover:text-[#087443] mb-6"
          >
            ← Back to Orders
          </button>

          <div className="bg-white border border-red-200 rounded-2xl p-6 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-2xl mb-4">
              !
            </div>

            <h1 className="text-lg font-bold text-[#061A14]">
              Unable to load order
            </h1>

            <p className="text-sm text-red-600 mt-2">
              {error}
            </p>

            <button
              onClick={loadOrder}
              className="mt-5 px-5 py-2.5 bg-[#087443] text-white rounded-xl text-sm font-medium hover:bg-[#066238]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const status =
    STATUS_CONFIG[order.status] || {
      label: order.status || "Unknown",
      className:
        "bg-gray-50 text-gray-700 border-gray-200",
    };

  /*
  |--------------------------------------------------------------------------
  | ACTION BUTTON
  |--------------------------------------------------------------------------
  */

  const renderAction = () => {
    if (order.status === "assigned") {
      return (
        <div className="space-y-3">

          <button
            onClick={() => updateOrderStatus("accepted")}
            disabled={updating}
            className="w-full py-3.5 rounded-xl bg-[#087443] text-white font-semibold hover:bg-[#066238] transition disabled:opacity-50"
          >
            {updating ? "Updating..." : "Accept Order"}
          </button>

          <button
            onClick={() => updateOrderStatus("declined")}
            disabled={updating}
            className="w-full py-3.5 rounded-xl bg-white border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50"
          >
            Decline Order
          </button>

        </div>
      );
    }

    if (order.status === "accepted") {
      return (
        <button
          onClick={() => updateOrderStatus("picked_up")}
          disabled={updating}
          className="w-full py-3.5 rounded-xl bg-[#087443] text-white font-semibold hover:bg-[#066238] transition disabled:opacity-50"
        >
          {updating ? "Updating..." : "Mark as Picked Up"}
        </button>
      );
    }

    if (order.status === "picked_up") {
      return (
        <button
          onClick={() => updateOrderStatus("in_transit")}
          disabled={updating}
          className="w-full py-3.5 rounded-xl bg-[#087443] text-white font-semibold hover:bg-[#066238] transition disabled:opacity-50"
        >
          {updating ? "Updating..." : "Start Delivery"}
        </button>
      );
    }

    if (order.status === "in_transit") {
      return (
        <button
          onClick={() => updateOrderStatus("delivered")}
          disabled={updating}
          className="w-full py-3.5 rounded-xl bg-[#087443] text-white font-semibold hover:bg-[#066238] transition disabled:opacity-50"
        >
          {updating ? "Updating..." : "Mark as Delivered"}
        </button>
      );
    }

    if (order.status === "delivered") {
      return (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-green-700 font-semibold">
            Delivery Completed
          </p>

          <p className="text-xs text-green-600 mt-1">
            This order has been successfully delivered.
          </p>
        </div>
      );
    }

    if (order.status === "declined") {
      return (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-red-700 font-semibold">
            Order Declined
          </p>

          <p className="text-xs text-red-600 mt-1">
            This order is no longer available to you.
          </p>
        </div>
      );
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* HEADER */}

        <button
          onClick={() => navigate("/rider/orders")}
          className="text-sm text-gray-500 hover:text-[#087443] mb-5"
        >
          ← Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Delivery Order
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#061A14] mt-1">
              {order.id}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Created {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`self-start text-sm px-3 py-1.5 rounded-full border font-medium ${status.className}`}
          >
            {status.label}
          </span>

        </div>

        {/* ERROR DURING ACTION */}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* PRICE */}

        <div className="bg-[#061A14] text-white rounded-2xl p-5 mb-5">

          <p className="text-xs text-white/60">
            Delivery Earnings
          </p>

          <p className="text-3xl font-bold mt-1">
            {formatMoney(order.price)}
          </p>

          {order.distance && (
            <p className="text-sm text-white/60 mt-2">
              Estimated distance: {order.distance} km
            </p>
          )}

        </div>

        {/* ROUTE */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">

          <h2 className="font-bold text-[#061A14] mb-6">
            Delivery Route
          </h2>

          <div className="relative pl-9">

            <div className="absolute left-[9px] top-3 bottom-4 w-px bg-gray-200" />

            {/* PICKUP */}

            <div className="relative pb-8">

              <div className="absolute -left-9 top-1 w-5 h-5 rounded-full border-[3px] border-[#087443] bg-white" />

              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Pickup
              </p>

              <p className="font-semibold text-[#061A14] mt-1">
                {order.pickup || "Pickup location unavailable"}
              </p>

              {order.pickupAddress && (
                <p className="text-sm text-gray-500 mt-1">
                  {order.pickupAddress}
                </p>
              )}

            </div>

            {/* DESTINATION */}

            <div className="relative">

              <div className="absolute -left-9 top-1 w-5 h-5 rounded-full bg-[#F4D500]" />

              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Destination
              </p>

              <p className="font-semibold text-[#061A14] mt-1">
                {order.destination ||
                  "Destination unavailable"}
              </p>

              {order.destinationAddress && (
                <p className="text-sm text-gray-500 mt-1">
                  {order.destinationAddress}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* RECEIVER */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">

          <h2 className="font-bold text-[#061A14] mb-4">
            Receiver
          </h2>

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="font-semibold text-[#061A14]">
                {order.receiver || "—"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {order.receiverPhone || "Phone unavailable"}
              </p>
            </div>

            {order.receiverPhone && (
              <a
                href={`tel:${order.receiverPhone}`}
                onClick={(event) => event.stopPropagation()}
                className="w-11 h-11 rounded-full bg-[#EAF7F0] text-[#087443] flex items-center justify-center text-lg hover:bg-[#DDF0E6] transition"
                aria-label="Call receiver"
              >
                ☎
              </a>
            )}

          </div>

        </div>

        {/* PACKAGE */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">

          <h2 className="font-bold text-[#061A14] mb-4">
            Package
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-xs text-gray-400">
                Description
              </p>

              <p className="text-sm font-medium text-[#061A14] mt-1">
                {order.package || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Order Amount
              </p>

              <p className="text-sm font-medium text-[#061A14] mt-1">
                {formatMoney(order.price)}
              </p>
            </div>

          </div>

        </div>

        {/* STATUS TIMELINE */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">

          <h2 className="font-bold text-[#061A14] mb-5">
            Order Progress
          </h2>

          <div className="space-y-5">

            {[
              ["assigned", "Order Assigned"],
              ["accepted", "Order Accepted"],
              ["picked_up", "Package Picked Up"],
              ["in_transit", "Delivery Started"],
              ["delivered", "Delivered"],
            ].map(([step, label], index) => {

              const statusOrder = [
                "assigned",
                "accepted",
                "picked_up",
                "in_transit",
                "delivered",
              ];

              const currentIndex =
                statusOrder.indexOf(order.status);

              const stepIndex = statusOrder.indexOf(step);

              const completed =
                currentIndex >= stepIndex &&
                currentIndex !== -1;

              return (
                <div
                  key={step}
                  className="flex items-center gap-3"
                >

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      completed
                        ? "bg-[#087443] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        completed
                          ? "text-[#061A14]"
                          : "text-gray-400"
                      }`}
                    >
                      {label}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* ACTION */}

        <div className="bg-white border border-gray-100 rounded-2xl p-5">

          <h2 className="font-bold text-[#061A14] mb-4">
            Order Action
          </h2>

          {renderAction()}

        </div>

      </div>

      {/* MOBILE NAV */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 md:hidden z-40">

        <div className="max-w-4xl mx-auto flex items-center justify-around">

          <button
            onClick={() => navigate("/rider")}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-lg">⌂</span>
            <span className="text-[11px]">
              Dashboard
            </span>
          </button>

          <button
            onClick={() => navigate("/rider/orders")}
            className="flex flex-col items-center gap-1 text-[#087443]"
          >
            <span className="text-lg">▣</span>
            <span className="text-[11px] font-medium">
              Orders
            </span>
          </button>

          <button
            onClick={() => navigate("/rider/profile")}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <span className="text-lg">◉</span>
            <span className="text-[11px]">
              Profile
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}