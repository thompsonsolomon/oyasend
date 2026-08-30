import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react'

import { resetUserPassword } from '../../services/auth'
import Logo from '../../components/ui/Logo'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setError('')
    setLoading(true)

    try {
      await resetUserPassword(email)

      setMessage(
        'If an account exists for this email, a password reset link has been sent.'
      )

      setEmail('')
    } catch (error) {
      console.error(error)

      if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError(
          'Unable to process your request. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F4EC]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRAND PANEL */}
        <section className="relative hidden overflow-hidden bg-[#064410] lg:flex">

          <div className="absolute inset-0">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F4D500]/10" />
            <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-black/20" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2"
            >
                         <Logo />


              <span className="text-2xl font-black tracking-tight text-white">
                OYA<span className="text-[#F4D500]">SEND</span>
              </span>
            </Link>

            <div className="max-w-lg">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80">
                <span className="h-2 w-2 rounded-full bg-[#F4D500]" />
                We've got you covered
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">
                Forget the password.
                <span className="block text-[#F4D500]">
                  Not the hustle.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-white/65">
                We'll help you get back into your account so you can get
                back to sending, shopping and getting things done.
              </p>

              <div className="mt-10 space-y-4">

                {[
                  'Quick password recovery',
                  'Secure account protection',
                  'Back to your errands in no time',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-white/85"
                  >
                    <CheckCircle2
                      size={19}
                      className="text-[#F4D500]"
                    />
                    {item}
                  </div>
                ))}

              </div>

            </div>

            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} OYA SEND
            </p>

          </div>
        </section>

        {/* FORM */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">

          <div className="w-full max-w-lg">

            {/* MOBILE LOGO */}
            <div className="mb-10 flex justify-center lg:hidden">

              <Link
                to="/"
                className="flex items-center gap-2"
              >
              <Logo />

                <span className="text-xl font-black text-[#06121B]">
                  OYA<span className="text-[#064410]">SEND</span>
                </span>
              </Link>

            </div>

            {/* HEADER */}
            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#064410]/10">
                <Mail
                  size={23}
                  className="text-[#064410]"
                />
              </div>

              <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#064410]">
                Account recovery
              </p>

              <h2 className="text-3xl font-black tracking-tight text-[#06121B] sm:text-4xl">
                Reset your password
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#6B756D]">
                Enter the email address linked to your account and we'll
                send you a secure password reset link.
              </p>

            </div>

            {/* SUCCESS */}
            {message && (
              <div
                role="status"
                className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium text-green-700"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span>{message}</span>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#06121B]">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#064410] px-5 font-bold text-white shadow-lg shadow-[#064410]/15 transition hover:bg-[#052f0b] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    Send reset link

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

            </form>

            {/* BACK TO LOGIN */}
            <div className="mt-7 text-center">

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#064410] transition hover:text-[#F4D500]"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>

            </div>

          </div>

        </section>

      </div>
    </main>
  )
}

export default ForgotPassword