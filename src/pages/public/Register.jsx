import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { registerUser } from '../../services/auth'
import Logo from '../../components/ui/Logo'

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)

      await registerUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })

      navigate('/customer', {
        replace: true,
      })
    } catch (error) {
      console.error(error)

      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (error.code === 'auth/weak-password') {
        setError('Your password is too weak.')
      } else {
        setError('Something went wrong. Please try again.')
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
                Logistics made simple
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">
                We run errands
                <span className="block text-[#F4D500]">
                  so you don't stress.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-white/65">
                Send packages, get your shopping done and keep track of
                everything from one simple platform.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  'Fast and reliable dispatch',
                  'Trusted riders around you',
                  'Simple order tracking',
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

            <div className="mb-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#064410]">
                Get started
              </p>

              <h2 className="text-3xl font-black tracking-tight text-[#06121B] sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#6B756D]">
                Create your OYA SEND account and start sending with ease.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#06121B]">
                  Full name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#06121B]">
                  Email address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#06121B]">
                  Phone number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                  required
                  className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#06121B]">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#06121B]">
                    Confirm password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#064410] px-5 font-bold text-white shadow-lg shadow-[#064410]/15 transition hover:bg-[#052f0b] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#6B756D]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#064410] transition hover:text-[#F4D500]"
              >
                Login
              </Link>
            </p>

          </div>
        </section>

      </div>
    </main>
  )
}

export default Register