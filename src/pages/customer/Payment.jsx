import { useEffect, useState } from 'react'
import {  useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  Package,
  ShieldCheck,
} from 'lucide-react'

import { getIdToken } from 'firebase/auth'
import { auth } from '../../config/firebase'

const API_URL = import.meta.env.VITE_API_URL

const BRAND = {
  primary: '#087443',
  dark: '#061A14',
  yellow: '#F4D500',
  background: '#F6F8F6',
}

function Payment() {
  const navigate = useNavigate()
  const location = useLocation()

  const { form, total } = location.state || {}

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!form) {
      navigate('/customer/send-package', {
        replace: true,
      })
    }
  }, [form, navigate])

  if (!form) {
    return null
  }

  async function handlePayment() {
    setError('')
    setLoading(true)

    try {
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error('Your session has expired. Please login again.')
      }

      const token = await getIdToken(currentUser, true)

      const response = await fetch(
        `${API_URL}/api/payments/initialize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: 'dispatch',
            receiverName: form.receiverName,
            receiverPhone: form.receiverPhone,
            pickupLocation: form.pickupLocation,
            deliveryLocation: form.deliveryLocation,
            packageType: form.packageType,
            packageDescription: form.packageDescription,
            packageValue: form.packageValue || null,

            // This is informational only.
            // Backend MUST calculate the official amount.
            expectedAmount: total,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to initialize payment.'
        )
      }

      if (!data.authorizationUrl) {
        throw new Error('Payment link was not returned.')
      }

      window.location.href = data.authorizationUrl

    } catch (err) {
      console.error('Payment initialization failed:', err)

      setError(
        err.message ||
        'Unable to start payment. Please try again.'
      )

      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen pb-8"
      style={{ backgroundColor: BRAND.background }}
    >

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[68px] max-w-5xl items-center px-4 sm:px-6">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="ml-3">

            <h1
              className="text-base font-black"
              style={{ color: BRAND.dark }}
            >
              Secure payment
            </h1>

            <p className="text-[11px] text-gray-400">
              Complete your delivery request
            </p>

          </div>

        </div>

      </header>


      {/* PROGRESS */}

      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">

          <div className="flex items-center">

            <ProgressStep
              number="1"
              title="Details"
              completed
            />

            <ProgressLine />

            <ProgressStep
              number="2"
              title="Review"
              completed
            />

            <ProgressLine />

            <ProgressStep
              number="3"
              title="Payment"
              active
            />

          </div>

        </div>

      </div>


      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

        <div className="mb-7">

          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${BRAND.primary}12`,
              color: BRAND.primary,
            }}
          >
            <CreditCard size={24} />
          </div>

          <h2
            className="text-2xl font-black tracking-tight sm:text-3xl"
            style={{ color: BRAND.dark }}
          >
            Complete your payment
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Your delivery will be processed after your payment
            has been confirmed.
          </p>

        </div>


        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}


        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* PAYMENT INFORMATION */}

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="flex items-center gap-4">

              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${BRAND.primary}12`,
                  color: BRAND.primary,
                }}
              >
                <LockKeyhole size={21} />
              </div>

              <div>

                <h3
                  className="font-black"
                  style={{ color: BRAND.dark }}
                >
                  Pay securely with Paystack
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Card, bank transfer and other supported methods
                </p>

              </div>

            </div>


            <div className="my-7 border-t border-gray-100" />


            <div className="rounded-2xl bg-gray-50 p-5">

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Delivery
              </p>

              <div className="mt-4 flex items-start gap-3">

                <Package
                  size={19}
                  className="mt-0.5 shrink-0 text-[#087443]"
                />

                <div className="min-w-0">

                  <p className="text-sm font-bold text-gray-700">
                    Package delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    {form.pickupLocation}
                    {' → '}
                    {form.deliveryLocation}
                  </p>

                </div>

              </div>

            </div>


            <div className="mt-6 space-y-4">

              <PaymentFeature
                title="Secure payment"
                description="Your payment is processed securely by Paystack."
              />

              <PaymentFeature
                title="Automatic confirmation"
                description="Your order is automatically confirmed once payment is verified."
              />

              <PaymentFeature
                title="Rider matching"
                description="We'll begin looking for an available rider after payment."
              />

            </div>


            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white shadow-lg transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: BRAND.primary,
                boxShadow: `0 12px 30px ${BRAND.primary}25`,
              }}
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Preparing payment...
                </>
              ) : (
                <>
                  Pay ₦{Number(total).toLocaleString()}
                  <ArrowRight size={18} />
                </>
              )}

            </button>


            <div className="mt-4 flex items-center justify-center gap-2">

              <ShieldCheck
                size={15}
                className="text-gray-400"
              />

              <p className="text-[11px] text-gray-400">
                Secure payment powered by Paystack
              </p>

            </div>

          </section>


          {/* ORDER SUMMARY */}

          <aside className="lg:sticky lg:top-[140px] lg:h-fit">

            <div
              className="overflow-hidden rounded-3xl text-white"
              style={{ backgroundColor: BRAND.dark }}
            >

              <div className="p-6">

                <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Order summary
                </p>

                <div className="mt-5 space-y-4">

                  <SummaryRow
                    label="Service"
                    value="Package delivery"
                  />

                  <SummaryRow
                    label="Package"
                    value={form.packageType}
                  />

                  <SummaryRow
                    label="Receiver"
                    value={form.receiverName}
                  />

                </div>

                <div className="my-6 border-t border-white/10" />

                <div className="flex items-end justify-between">

                  <span className="text-sm text-white/50">
                    Total
                  </span>

                  <span className="text-3xl font-black">
                    ₦{Number(total).toLocaleString()}
                  </span>

                </div>

              </div>

              <div
                className="p-4 text-xs leading-5"
                style={{
                  backgroundColor: `${BRAND.yellow}15`,
                  color: '#FFFFFF',
                }}
              >
                <span className="font-bold">
                  Almost there!
                </span>{' '}
                After payment, we'll automatically start finding
                an available rider for your delivery.

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  )
}


/* ============================================================
   COMPONENTS
============================================================ */

function PaymentFeature({
  title,
  description,
}) {
  return (
    <div className="flex gap-3">

      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#087443]/10 text-[#087443]">
        <CheckCircle2 size={14} />
      </div>

      <div>

        <p className="text-sm font-bold text-gray-700">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-400">
          {description}
        </p>

      </div>

    </div>
  )
}


function SummaryRow({ label, value }) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold">
        {value}
      </p>

    </div>
  )
}


function ProgressStep({
  number,
  title,
  active,
  completed,
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


export default Payment