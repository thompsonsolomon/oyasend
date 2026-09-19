import { useEffect, useRef, useState } from 'react'
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'

import { auth, db } from '../../config/firebase'
import { Clock3, Package, Plus, User } from 'lucide-react'


const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET


async function uploadToCloudinary(
  file,
  folder = 'oyasend/customers'
) {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      'Cloudinary cloud name is not configured.'
    )
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary upload preset is not configured.'
    )
  }

  const formData = new FormData()

  formData.append('file', file)
  formData.append(
    'upload_preset',
    CLOUDINARY_UPLOAD_PRESET
  )
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      'Cloudinary upload failed.'
    )
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  }
}


function getInitials(name = '') {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return 'CU'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}


function CustomerProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] =
    useState(false)
  const [changingPassword, setChangingPassword] =
    useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showPasswordForm, setShowPasswordForm] =
    useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  const [notifications, setNotifications] =
    useState({
      orderUpdates: true,
      deliveryUpdates: true,
      promotions: false,
    })

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })


  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const currentUser = auth.currentUser

        if (!currentUser) {
          navigate('/login', {
            replace: true,
          })
          return
        }

        setUser(currentUser)

        const userRef = doc(
          db,
          'users',
          currentUser.uid
        )

        const snapshot = await getDoc(userRef)

        if (snapshot.exists()) {
          const data = snapshot.data()

          setForm({
            name:
              data.name ||
              currentUser.displayName ||
              '',
            phone:
              data.phone ||
              currentUser.phoneNumber ||
              '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
          })

          setNotifications({
            orderUpdates:
              data.notifications
                ?.orderUpdates ??
              true,

            deliveryUpdates:
              data.notifications
                ?.deliveryUpdates ??
              true,

            promotions:
              data.notifications
                ?.promotions ??
              false,
          })
        } else {
          setForm({
            name:
              currentUser.displayName || '',
            phone:
              currentUser.phoneNumber || '',
            address: '',
            city: '',
            state: '',
          })
        }
      } catch (err) {
        console.error(
          'Failed to load customer profile:',
          err
        )

        setError(
          err?.message ||
          'Unable to load your profile.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])


  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSuccess('')
  }


  const handleNotificationChange = (
    name,
    value
  ) => {
    setNotifications((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSuccess('')
  }


  const handleSaveProfile = async (
    event
  ) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const currentUser = auth.currentUser

      if (!currentUser) {
        navigate('/login', {
          replace: true,
        })
        return
      }

      await updateDoc(
        doc(db, 'users', currentUser.uid),
        {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),

          notifications,

          updatedAt: serverTimestamp(),
        }
      )

      setSuccess(
        'Your profile has been updated successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to save profile:',
        err
      )

      setError(
        err?.message ||
        'Unable to save your profile.'
      )
    } finally {
      setSaving(false)
    }
  }


  const handlePhotoSelect = async (
    event
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image file.'
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Profile photo must be smaller than 5MB.'
      )
      return
    }

    try {
      setUploadingPhoto(true)
      setError('')
      setSuccess('')

      const currentUser = auth.currentUser

      if (!currentUser) {
        navigate('/login', {
          replace: true,
        })
        return
      }

      const uploaded =
        await uploadToCloudinary(
          file,
          `oyasend/customers/${currentUser.uid}/profile`
        )

      await updateDoc(
        doc(db, 'users', currentUser.uid),
        {
          photoURL: uploaded.url,
          photoPublicId:
            uploaded.publicId,
          updatedAt: serverTimestamp(),
        }
      )

      setUser((previous) => ({
        ...previous,
        photoURL: uploaded.url,
      }))

      setSuccess(
        'Profile photo updated successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to upload profile photo:',
        err
      )

      setError(
        err?.message ||
        'Unable to update your profile photo.'
      )
    } finally {
      setUploadingPhoto(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }


  const handlePasswordChange = async (
    event
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (
      passwordForm.newPassword.length < 6
    ) {
      setError(
        'New password must be at least 6 characters.'
      )
      return
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        'New passwords do not match.'
      )
      return
    }

    try {
      setChangingPassword(true)

      const currentUser = auth.currentUser

      if (!currentUser) {
        navigate('/login', {
          replace: true,
        })
        return
      }

      if (!currentUser.email) {
        throw new Error(
          'Password changes are unavailable for this account.'
        )
      }

      const credential =
        EmailAuthProvider.credential(
          currentUser.email,
          passwordForm.currentPassword
        )

      await reauthenticateWithCredential(
        currentUser,
        credential
      )

      await updatePassword(
        currentUser,
        passwordForm.newPassword
      )

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setShowPasswordForm(false)

      setSuccess(
        'Your password has been changed successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to change password:',
        err
      )

      let message =
        'Unable to change your password.'

      if (
        err?.code ===
        'auth/invalid-credential'
      ) {
        message =
          'Your current password is incorrect.'
      }

      if (
        err?.code ===
        'auth/wrong-password'
      ) {
        message =
          'Your current password is incorrect.'
      }

      if (
        err?.code ===
        'auth/too-many-requests'
      ) {
        message =
          'Too many attempts. Please try again later.'
      }

      setError(message)
    } finally {
      setChangingPassword(false)
    }
  }


  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      setError('')

      await signOut(auth)

      navigate('/login', {
        replace: true,
      })
    } catch (err) {
      console.error(
        'Logout failed:',
        err
      )

      setError(
        err?.message ||
        'Unable to log out.'
      )

      setLoggingOut(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-5xl animate-pulse">

          <div className="h-8 w-40 rounded bg-gray-200" />

          <div className="mt-6 rounded-2xl bg-white p-6">
            <div className="h-20 w-20 rounded-full bg-gray-200" />

            <div className="mt-5 h-5 w-48 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-72 rounded bg-gray-100" />
          </div>

        </div>
      </div>
    )
  }


  const photoURL = user?.photoURL

  const completionFields = [
    form.name,
    form.phone,
    form.address,
    form.city,
    form.state,
  ]

  const completedFields =
    completionFields.filter(Boolean).length

  const profileCompletion = Math.round(
    (completedFields /
      completionFields.length) *
      100
  )


  return (
    <div className="min-h-screen bg-[#F6F8F6] px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* ================= HEADER ================= */}

        <div className="mb-6">

          <p className="text-sm font-medium text-[#20948B]">
            Account
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#012220] sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and account settings.
          </p>

        </div>


        {/* ================= MESSAGES ================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-800">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

          </div>
        )}


        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

            <p className="text-sm font-semibold text-emerald-800">
              {success}
            </p>

          </div>
        )}


        {/* ================= PROFILE HEADER ================= */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="relative">

                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={form.name || 'Profile'}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#012220] text-lg font-bold text-[#C8EA80]">
                    {getInitials(form.name)}
                  </div>
                )}


                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#20948B] text-white shadow-sm transition hover:bg-[#0A3D33] disabled:opacity-60"
                  title="Change profile photo"
                >
                  {uploadingPhoto ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20h9"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                      />
                    </svg>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

              </div>


              <div>

                <h2 className="text-lg font-bold text-[#012220]">
                  {form.name ||
                    'Complete your profile'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {user?.email}
                </p>

              </div>

            </div>


            <div className="w-full sm:w-56">

              <div className="flex items-center justify-between text-xs">

                <span className="font-medium text-gray-500">
                  Profile completion
                </span>

                <span className="font-bold text-[#012220]">
                  {profileCompletion}%
                </span>

              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-[#20948B] transition-all"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ================= PERSONAL INFO ================= */}

        <form
          onSubmit={handleSaveProfile}
          className="mt-6"
        >

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

            <div className="mb-6">

              <h2 className="text-base font-bold text-[#012220]">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keep your account information up to date.
              </p>

            </div>


            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#20948B] focus:ring-2 focus:ring-[#20948B]/10"
                />
              </div>


              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email address
                </label>

                <input
                  value={user?.email || ''}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Email changes are handled separately.
                </p>
              </div>


              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone number
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08012345678"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#20948B] focus:ring-2 focus:ring-[#20948B]/10"
                />
              </div>


              <div>
                <label className="text-sm font-medium text-gray-700">
                  State
                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Lagos"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#20948B] focus:ring-2 focus:ring-[#20948B]/10"
                />
              </div>

            </div>

          </section>


          {/* ================= ADDRESS ================= */}

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

            <div className="mb-6">

              <h2 className="text-base font-bold text-[#012220]">
                Delivery Address
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Save your usual delivery location for faster checkout.
              </p>

            </div>


            <div className="grid gap-5 sm:grid-cols-2">

              <div className="sm:col-span-2">

                <label className="text-sm font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter your usual delivery address"
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#20948B] focus:ring-2 focus:ring-[#20948B]/10"
                />

              </div>


              <div>
                <label className="text-sm font-medium text-gray-700">
                  City
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Lagos"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#20948B] focus:ring-2 focus:ring-[#20948B]/10"
                />
              </div>


              <div>
                <label className="text-sm font-medium text-gray-700">
                  State
                </label>

                <input
                  value={form.state}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                />
              </div>

            </div>

          </section>


          {/* ================= NOTIFICATIONS ================= */}

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

            <div className="mb-5">

              <h2 className="text-base font-bold text-[#012220]">
                Notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose which notifications you want to receive.
              </p>

            </div>


            <div className="divide-y divide-gray-100">

              <NotificationToggle
                title="Order updates"
                description="Get notified when your order status changes."
                checked={
                  notifications.orderUpdates
                }
                onChange={(value) =>
                  handleNotificationChange(
                    'orderUpdates',
                    value
                  )
                }
              />


              <NotificationToggle
                title="Delivery updates"
                description="Receive updates while your package is being delivered."
                checked={
                  notifications.deliveryUpdates
                }
                onChange={(value) =>
                  handleNotificationChange(
                    'deliveryUpdates',
                    value
                  )
                }
              />


              <NotificationToggle
                title="Promotions"
                description="Receive occasional offers and OYASEND updates."
                checked={
                  notifications.promotions
                }
                onChange={(value) =>
                  handleNotificationChange(
                    'promotions',
                    value
                  )
                }
              />

            </div>

          </section>


          {/* ================= SAVE ================= */}

          <div className="mt-6 flex justify-end">

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-[#012220] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0A3D33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>

          </div>

        </form>


        {/* ================= SECURITY ================= */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-base font-bold text-[#012220]">
                Password & Security
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keep your account secure by using a strong password.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setShowPasswordForm(
                  (previous) => !previous
                )
              }
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#20948B] hover:text-[#20948B]"
            >
              {showPasswordForm
                ? 'Cancel'
                : 'Change Password'}
            </button>

          </div>


          {showPasswordForm && (
            <form
              onSubmit={handlePasswordChange}
              className="mt-6 border-t border-gray-100 pt-6"
            >

              <div className="grid gap-5 sm:grid-cols-3">

                <PasswordInput
                  label="Current password"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (previous) => ({
                        ...previous,
                        currentPassword:
                          value,
                      })
                    )
                  }
                />


                <PasswordInput
                  label="New password"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (previous) => ({
                        ...previous,
                        newPassword:
                          value,
                      })
                    )
                  }
                />


                <PasswordInput
                  label="Confirm password"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={(value) =>
                    setPasswordForm(
                      (previous) => ({
                        ...previous,
                        confirmPassword:
                          value,
                      })
                    )
                  }
                />

              </div>


              <div className="mt-5 flex justify-end">

                <button
                  type="submit"
                  disabled={
                    changingPassword
                  }
                  className="rounded-xl bg-[#20948B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A3D33] disabled:opacity-60"
                >
                  {changingPassword
                    ? 'Updating...'
                    : 'Update Password'}
                </button>

              </div>

            </form>
          )}

        </section>


        {/* ================= LOGOUT ================= */}

        <section className="mb-8 mt-6 rounded-2xl border border-red-100 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-base font-bold text-gray-800">
                Sign out
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Sign out of your OYASEND account on this device.
              </p>

            </div>


            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {loggingOut
                ? 'Signing out...'
                : 'Sign Out'}
            </button>

          </div>

        </section>

      </div>
  {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-3 md:hidden">

        <div className="mx-auto flex max-w-md items-center justify-around">

          <Link
            to="/customer"
            className="flex flex-col items-center gap-1 text-xs font-bold"
          >
            <Package size={20} />
            Home
          </Link>

          <Link
            to="/customer/send-package"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
          >
            <Plus size={21} />
            Send
          </Link>

          <Link
            to="/customer/orders"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"

          >
            <Clock3 size={20} />
            Orders
          </Link>

          <Link
            to="/customer/profile"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
                                    style={{ color:"#087443"}}

          >
                <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ backgroundColor:"#087443" }}
            >

            <User size={20} />
            </div>
            Profile
          </Link>

        </div>

      </nav>

    </div>
  )
}


/* ================= NOTIFICATION TOGGLE ================= */

function NotificationToggle({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">

      <div>
        <p className="text-sm font-semibold text-gray-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>


      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? 'bg-[#20948B]'
            : 'bg-gray-200'
        }`}
        aria-label={`Toggle ${title}`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? 'left-6'
              : 'left-1'
          }`}
        />

      </button>

    </div>
  )
}


/* ================= PASSWORD INPUT ================= */

function PasswordInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#20948B] focus:ring-2 focus:ring-[#20948B]/10"
        required
      />

    </div>
  )
}


export default CustomerProfile