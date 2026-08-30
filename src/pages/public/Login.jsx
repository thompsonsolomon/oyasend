import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { loginUser } from '../../services/auth'
import Logo from '../../components/ui/Logo'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({
    email: '',
    password: '',
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
    setLoading(true)

    try {
      await loginUser({
        email: form.email,
        password: form.password,
      })

      const destination = location.state?.from?.pathname || '/customer'

      navigate(destination, {
        replace: true,
      })
    } catch (error) {
      console.error(error)

      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password.')
          break

        case 'auth/invalid-email':
          setError('Please enter a valid email address.')
          break

        case 'auth/user-disabled':
          setError('This account has been disabled.')
          break

        default:
          setError('Unable to login. Please try again.')
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

            {/* LOGO */}
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2"
            >
            <Logo />

              <span className="text-2xl font-black tracking-tight text-white">
                OYA<span className="text-[#F4D500]">SEND</span>
              </span>
            </Link>

            {/* CONTENT */}
            <div className="max-w-lg">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80">
                <span className="h-2 w-2 rounded-full bg-[#F4D500]" />
                Welcome back
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">
                Your errands.
                <span className="block text-[#F4D500]">
                  Our hustle.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-white/65">
                Send packages, get your shopping done and keep everything
                moving without the stress.
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

        {/* LOGIN FORM */}
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

              <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#064410]">
                Welcome back
              </p>

              <h2 className="text-3xl font-black tracking-tight text-[#06121B] sm:text-4xl">
                Login to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#6B756D]">
                Access your orders and manage your deliveries.
              </p>

            </div>

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

              {/* EMAIL */}
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
                  autoComplete="email"
                  required
                  className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                />
              </div>

              {/* PASSWORD */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-semibold text-[#06121B]">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-[#064410] transition hover:text-[#F4D500]"
                  >
                    Forgot password?
                  </Link>

                </div>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-13 w-full rounded-xl border border-[#DCE3DA] bg-white px-4 text-sm text-[#06121B] outline-none transition placeholder:text-[#9AA39D] focus:border-[#064410] focus:ring-4 focus:ring-[#064410]/10"
                />

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#064410] px-5 font-bold text-white shadow-lg shadow-[#064410]/15 transition hover:bg-[#052f0b] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  'Logging in...'
                ) : (
                  <>
                    Login
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

            </form>

            {/* REGISTER */}
            <p className="mt-7 text-center text-sm text-[#6B756D]">
              Don&apos;t have an account?{' '}

              <Link
                to="/register"
                className="font-bold text-[#064410] transition hover:text-[#F4D500]"
              >
                Create an account
              </Link>
            </p>

          </div>

        </section>

      </div>
    </main>
  )
}

export default Login