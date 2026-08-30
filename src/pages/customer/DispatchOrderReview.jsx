import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react'

const BRAND = {
  primary: '#087443',
  dark: '#061A14',
  yellow: '#F4D500',
  background: '#F6F8F6',
}

function DispatchOrderReview() {
  const navigate = useNavigate()
  const location = useLocation()

  const form = location.state?.form

  // Prevent users from opening the review page directly.
  if (!form) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: BRAND.background }}
      >
        <div className="text-center">

          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${BRAND.primary}12`,
              color: BRAND.primary,
            }}
          >
            <Package size={28} />
          </div>

          <h1
            className="mt-5 text-xl font-black"
            style={{ color: BRAND.dark }}
          >
            No delivery information found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please start by creating a new delivery.
          </p>

          <Link
            to="/customer/send-package"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: BRAND.primary }}
          >
            Create delivery
            <ArrowRight size={17} />
          </Link>

        </div>
      </div>
    )
  }


  /*
    TEMPORARY PRICING DISPLAY

    This is deliberately isolated so that when we connect
    the real OYASEND pricing engine, we only replace this
    calculation.

    IMPORTANT:
    The final price must NEVER be trusted from the frontend.
    The backend will calculate/validate the actual amount
    before Paystack payment is initialized.
  */

  const deliveryFee = 1500
  const total = deliveryFee


  function handlePayment() {
    /*
      Next step:

      1. Send order information to Express backend.
      2. Backend validates customer.
      3. Backend calculates official delivery fee.
      4. Backend creates a pending order.
      5. Backend initializes Paystack transaction.
      6. Customer is redirected to Paystack.
    */

    navigate('/customer/payment', {
      state: {
        form,
        deliveryFee,
        total,
      },
    })
  }


  return (
    <div
      className="min-h-screen pb-10"
      style={{ backgroundColor: BRAND.background }}
    >

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[68px] max-w-5xl items-center px-4 sm:px-6">

          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="ml-3">

            <h1
              className="text-base font-black"
              style={{ color: BRAND.dark }}
            >
              Review delivery
            </h1>

            <p className="text-[11px] text-gray-400">
              Check your details before payment
            </p>

          </div>

        </div>

      </header>


      {/* PROGRESS */}

      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">

          <div className="flex items-center">

            <ReviewStep
              number="1"
              title="Details"
              completed
            />

            <ProgressLine />

            <ReviewStep
              number="2"
              title="Review"
              active
            />

            <ProgressLine />

            <ReviewStep
              number="3"
              title="Payment"
            />

          </div>

        </div>

      </div>


      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

        {/* PAGE TITLE */}

        <div className="mb-7">

          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${BRAND.primary}12`,
              color: BRAND.primary,
            }}
          >
            <CheckCircle2 size={25} />
          </div>

          <h2
            className="text-2xl font-black tracking-tight sm:text-3xl"
            style={{ color: BRAND.dark }}
          >
            Check your delivery
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Make sure everything is correct before you continue
            to payment.
          </p>

        </div>


        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* DETAILS */}

          <div className="space-y-5">

            {/* ROUTE */}

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionTitle
                icon={<MapPin size={19} />}
                title="Delivery route"
              />

              <div className="mt-6">

                <RoutePoint
                  type="pickup"
                  label="Pickup"
                  value={form.pickupLocation}
                />

                <div className="ml-[17px] h-8 border-l border-dashed border-gray-300" />

                <RoutePoint
                  type="destination"
                  label="Destination"
                  value={form.deliveryLocation}
                />

              </div>

            </section>


            {/* RECEIVER */}

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionTitle
                icon={<User size={19} />}
                title="Receiver"
              />

              <div className="mt-5 rounded-2xl bg-gray-50 p-4">

                <div className="flex items-center gap-3">

                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${BRAND.primary}12`,
                      color: BRAND.primary,
                    }}
                  >
                    <User size={19} />
                  </div>

                  <div className="min-w-0">

                    <p
                      className="truncate font-bold"
                      style={{ color: BRAND.dark }}
                    >
                      {form.receiverName}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={13} />
                      {form.receiverPhone}
                    </p>

                  </div>

                </div>

              </div>

            </section>


            {/* PACKAGE */}

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionTitle
                icon={<Box size={19} />}
                title="Package"
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <InfoBox
                  label="Package type"
                  value={form.packageType}
                />

                <InfoBox
                  label="Estimated value"
                  value={
                    form.packageValue
                      ? `₦${Number(form.packageValue).toLocaleString()}`
                      : 'Not provided'
                  }
                />

              </div>

              {form.packageDescription && (
                <div className="mt-3 rounded-2xl bg-gray-50 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {form.packageDescription}
                  </p>

                </div>
              )}

            </section>

          </div>


          {/* PRICE */}

          <aside className="lg:sticky lg:top-[140px] lg:h-fit">

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

              <div
                className="p-6 text-white"
                style={{ backgroundColor: BRAND.dark }}
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Package size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-black">
                      Delivery fee
                    </p>

                    <p className="text-xs text-white/50">
                      OYASEND dispatch
                    </p>

                  </div>

                </div>

                <div className="mt-7">

                  <p className="text-xs text-white/50">
                    Total to pay
                  </p>

                  <p className="mt-1 text-4xl font-black">
                    ₦{total.toLocaleString()}
                  </p>

                </div>

              </div>


              <div className="p-6">

                <div className="space-y-4">

                  <PriceRow
                    label="Delivery fee"
                    amount={deliveryFee}
                  />

                  <div className="border-t border-gray-100 pt-4">

                    <div className="flex items-center justify-between">

                      <span className="font-black text-[#061A14]">
                        Total
                      </span>

                      <span
                        className="text-xl font-black"
                        style={{ color: BRAND.primary }}
                      >
                        ₦{total.toLocaleString()}
                      </span>

                    </div>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={handlePayment}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white shadow-lg transition hover:opacity-95 active:scale-[0.98]"
                  style={{
                    backgroundColor: BRAND.primary,
                    boxShadow: `0 12px 30px ${BRAND.primary}25`,
                  }}
                >
                  Continue to payment
                  <ArrowRight size={18} />
                </button>


                <div className="mt-4 flex items-start gap-2">

                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <p className="text-[11px] leading-5 text-gray-400">
                    Your payment is securely processed through
                    Paystack. OYASEND does not store your card
                    details.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>


        {/* MOBILE PAYMENT BAR */}

        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-3 shadow-2xl lg:hidden">

          <div className="mx-auto flex max-w-2xl items-center gap-3">

            <div className="min-w-0 flex-1">

              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total
              </p>

              <p
                className="text-lg font-black"
                style={{ color: BRAND.dark }}
              >
                ₦{total.toLocaleString()}
              </p>

            </div>

            <button
              type="button"
              onClick={handlePayment}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white"
              style={{ backgroundColor: BRAND.primary }}
            >
              Pay now
              <ArrowRight size={16} />
            </button>

          </div>

        </div>

      </main>

    </div>
  )
}


/* =============================================================
   COMPONENTS
============================================================= */

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-3">

      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${BRAND.primary}12`,
          color: BRAND.primary,
        }}
      >
        {icon}
      </div>

      <h3
        className="font-black"
        style={{ color: BRAND.dark }}
      >
        {title}
      </h3>

    </div>
  )
}


function RoutePoint({
  type,
  label,
  value,
}) {
  const pickup = type === 'pickup'

  return (
    <div className="flex items-start gap-3">

      <div
        className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: pickup
            ? BRAND.primary
            : BRAND.yellow,
        }}
      />

      <div className="min-w-0">

        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-gray-700">
          {value}
        </p>

      </div>

    </div>
  )
}


function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-700">
        {value}
      </p>

    </div>
  )
}


function PriceRow({ label, amount }) {
  return (
    <div className="flex items-center justify-between text-sm">

      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-bold text-gray-700">
        ₦{amount.toLocaleString()}
      </span>

    </div>
  )
}


function ReviewStep({
  number,
  title,
  active = false,
  completed = false,
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">

      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
        style={{
          backgroundColor:
            active || completed
              ? BRAND.primary
              : '#F3F4F6',
          color:
            active || completed
              ? '#FFFFFF'
              : '#9CA3AF',
        }}
      >
        {completed ? (
          <CheckCircle2 size={15} />
        ) : (
          number
        )}
      </div>

      <span
        className={`hidden text-xs font-bold sm:block ${
          active
            ? 'text-[#061A14]'
            : completed
              ? 'text-[#087443]'
              : 'text-gray-400'
        }`}
      >
        {title}
      </span>

    </div>
  )
}


function ProgressLine() {
  return (
    <div className="mx-2 flex-1 border-t border-dashed border-gray-200 sm:mx-4" />
  )
}


export default DispatchOrderReview