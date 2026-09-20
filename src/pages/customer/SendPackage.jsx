import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  User,
} from 'lucide-react'

const BRAND = {
  primary: '#087443',
  dark: '#061A14',
  yellow: '#F4D500',
  background: '#F6F8F6',
}

const PHOTON_API_URL = 'https://photon.komoot.io/api/'
const PHOTON_REVERSE_URL = 'https://photon.komoot.io/reverse'

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org'

// ============================================================
// OYASEND DEFAULT PACKAGE WEIGHT
// ============================================================
// Weight is intentionally NOT shown in the form.
// Change this single value whenever you want.
// ============================================================

const DEFAULT_PACKAGE_WEIGHT = 1

function SendPackage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    receiverName: '',
    receiverPhone: '',
    pickupLocation: '',
    deliveryLocation: '',
    packageType: '',
    packageDescription: '',
    packageValue: '',
    weight: String(DEFAULT_PACKAGE_WEIGHT),
  })

  const [locations, setLocations] = useState({
    pickup: null,
    delivery: null,
  })

  const [currentLocation, setCurrentLocation] = useState(null)

  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState('')

  const [calculatingPrice, setCalculatingPrice] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    getCurrentLocation()
  }, [])

  /*
   * ============================================================
   * GET USER'S CURRENT LOCATION
   * ============================================================
   */

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationLoading(false)

      setLocationError(
        'Location is not supported by this browser. Please search for your pickup location.'
      )

      return
    }

    setLocationLoading(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        const userLocation = {
          latitude,
          longitude,
        }

        setCurrentLocation(userLocation)

        try {
          const address = await reverseGeocode(
            latitude,
            longitude
          )

          if (address) {
            const pickup = {
              address,
              latitude,
              longitude,
              placeId: null,
              isCurrentLocation: true,
            }

            setLocations((previous) => ({
              ...previous,
              pickup,
            }))

            setForm((previous) => ({
              ...previous,
              pickupLocation: address,
            }))
          }
        } catch (err) {
          console.error(
            'Reverse geocoding failed:',
            err
          )
        }

        setLocationLoading(false)
      },

      (err) => {
        console.error(
          'Geolocation error:',
          err
        )

        setLocationLoading(false)

        if (err.code === 1) {
          setLocationError(
            'Location permission was denied. Please search for your pickup location.'
          )
        } else if (err.code === 2) {
          setLocationError(
            'Your location could not be determined. Please search for your pickup location.'
          )
        } else if (err.code === 3) {
          setLocationError(
            'Location request timed out. Please search for your pickup location.'
          )
        } else {
          setLocationError(
            'We could not get your current location. Please search for your pickup location.'
          )
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    )
  }

  /*
   * ============================================================
   * REVERSE GEOCODING
   * ============================================================
   *
   * Nominatim first.
   * Photon fallback.
   */

  async function reverseGeocode(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        format: 'jsonv2',
        addressdetails: '1',
        zoom: '18',
        'accept-language': 'en',
      })

      const response = await fetch(
        `${NOMINATIM_API_URL}/reverse?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()

        if (data) {
          const address =
            formatNominatimAddress(data)

          if (address) {
            return address
          }
        }
      }
    } catch (err) {
      console.warn(
        'Nominatim reverse geocoding failed:',
        err
      )
    }

    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        lang: 'en',
      })

      const response = await fetch(
        `${PHOTON_REVERSE_URL}?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error(
          'Unable to determine current address.'
        )
      }

      const data = await response.json()

      const feature = data.features?.[0]

      if (!feature) {
        return null
      }

      return formatPhotonAddress(feature)
    } catch (err) {
      console.error(
        'Photon reverse geocoding failed:',
        err
      )

      return null
    }
  }

  /*
   * ============================================================
   * FORM CHANGE
   * ============================================================
   */

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (name === 'pickupLocation') {
      setLocations((previous) => ({
        ...previous,
        pickup: null,
      }))
    }

    if (name === 'deliveryLocation') {
      setLocations((previous) => ({
        ...previous,
        delivery: null,
      }))
    }
  }

  /*
   * ============================================================
   * LOCATION SELECT
   * ============================================================
   */

  function handleLocationSelect(type, place) {
    const selectedLocation = {
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      placeId: place.placeId || null,
      isCurrentLocation: Boolean(
        place.isCurrentLocation
      ),
    }

    setLocations((previous) => ({
      ...previous,
      [type]: selectedLocation,
    }))

    const fieldName =
      type === 'pickup'
        ? 'pickupLocation'
        : 'deliveryLocation'

    setForm((previous) => ({
      ...previous,
      [fieldName]: place.address,
    }))

    setError('')
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

 async function handleSubmit(event) {
  event.preventDefault()

  setError('')

  // Basic validation
  if (
    !form.receiverName.trim() ||
    !form.receiverPhone.trim() ||
    !form.pickupLocation.trim() ||
    !form.deliveryLocation.trim() ||
    !form.packageType
  ) {
    setError('Please fill in all required fields.')
    return
  }

  // Pickup must have coordinates
  if (!locations.pickup) {
    setError(
      'Please select a pickup location from the suggestions.'
    )
    return
  }

  // Delivery must have coordinates
  if (!locations.delivery) {
    setError(
      'Please select a delivery location from the suggestions.'
    )
    return
  }

  const pickupLatitude = Number(
    locations.pickup.latitude
  )

  const pickupLongitude = Number(
    locations.pickup.longitude
  )

  const deliveryLatitude = Number(
    locations.delivery.latitude
  )

  const deliveryLongitude = Number(
    locations.delivery.longitude
  )

  if (
    !Number.isFinite(pickupLatitude) ||
    !Number.isFinite(pickupLongitude)
  ) {
    setError(
      'Pickup coordinates are missing. Please select the pickup location again.'
    )
    return
  }

  if (
    !Number.isFinite(deliveryLatitude) ||
    !Number.isFinite(deliveryLongitude)
  ) {
    setError(
      'Delivery coordinates are missing. Please select the delivery location again.'
    )
    return
  }

  const weight = DEFAULT_PACKAGE_WEIGHT

  setCalculatingPrice(true)

  try {
    const API_URL = import.meta.env.VITE_API_URL

    if (!API_URL) {
      throw new Error(
        'VITE_API_URL is not configured in your frontend .env file.'
      )
    }

    console.log('Calculating delivery price...', {
      API_URL,
      pickup: locations.pickup,
      delivery: locations.delivery,
      weight,
    })

    const response = await fetch(
      `${API_URL}/api/delivery/calculate-price`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: {
            address: locations.pickup.address,
            latitude: pickupLatitude,
            longitude: pickupLongitude,
            placeId: locations.pickup.placeId,
          },

          delivery: {
            address: locations.delivery.address,
            latitude: deliveryLatitude,
            longitude: deliveryLongitude,
            placeId: locations.delivery.placeId,
          },

          weight,
        }),
      }
    )

    let data = {}

    try {
      data = await response.json()
    } catch {
      data = {}
    }

    console.log('Price calculation response:', {
      status: response.status,
      data,
    })

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Price calculation failed (${response.status}).`
      )
    }

    if (
      data.total === undefined ||
      data.total === null
    ) {
      throw new Error(
        'The delivery price was not returned by the server.'
      )
    }

    navigate('/customer/send-package/review', {
      state: {
        form: {
          ...form,
          weight: String(weight),
        },

        locations,

        pricing: {
          distanceKm: data.distanceKm ?? 0,
          distanceFee: data.distanceFee ?? 0,
          weightSurcharge:
            data.weightSurcharge ?? 0,
          total: Number(data.total),
        },
      },
    })
  } catch (err) {
    console.error(
      'Delivery price calculation failed:',
      err
    )

    setError(
      err.message ||
        'Unable to calculate your delivery price. Please try again.'
    )
  } finally {
    setCalculatingPrice(false)
  }
}

  return (
    <div
      className="min-h-screen pb-24 md:pb-0"
      style={{
        backgroundColor:
          BRAND.background,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

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
              style={{
                color: BRAND.dark,
              }}
            >
              Send a Package
            </h1>

            <p className="text-[11px] text-gray-400">
              Create a delivery request
            </p>
          </div>
        </div>
      </header>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center">
            <Step
              number="1"
              title="Package details"
              active
            />

            <ProgressLine />

            <Step
              number="2"
              title="Review"
            />

            <ProgressLine />

            <Step
              number="3"
              title="Payment"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-7">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor:
                `${BRAND.primary}12`,
              color: BRAND.primary,
            }}
          >
            <Package size={24} />
          </div>

          <h2
            className="text-2xl font-black tracking-tight sm:text-3xl"
            style={{
              color: BRAND.dark,
            }}
          >
            Where are we sending it?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Enter the delivery details below and we'll find an
            available rider near you.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* =================================================
                FORM
            ================================================= */}

            <div className="space-y-5">
              {/* RECEIVER */}

              <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={<User size={19} />}
                  title="Receiver details"
                  description="Who should receive this package?"
                />

                <div className="mt-6 space-y-4">
                  <Input
                    label="Receiver's name"
                    name="receiverName"
                    value={
                      form.receiverName
                    }
                    onChange={handleChange}
                    placeholder="Enter receiver's full name"
                    icon={
                      <User size={17} />
                    }
                    required
                  />

                  <Input
                    label="Receiver's phone number"
                    name="receiverPhone"
                    type="tel"
                    value={
                      form.receiverPhone
                    }
                    onChange={handleChange}
                    placeholder="0801 234 5678"
                    icon={
                      <Phone size={17} />
                    }
                    required
                  />
                </div>
              </section>

              {/* LOCATIONS */}

              <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={
                    <MapPin size={19} />
                  }
                  title="Delivery locations"
                  description="Where should the rider pick up and deliver?"
                />

                <div className="mt-6 space-y-4">
                  <LocationInput
                    label="Pickup location"
                    name="pickupLocation"
                    value={
                      form.pickupLocation
                    }
                    onChange={handleChange}
                    placeholder={
                      locationLoading
                        ? 'Getting your current location...'
                        : 'Search pickup location'
                    }
                    pickup
                    currentLocation={
                      currentLocation
                    }
                    selectedLocation={
                      locations.pickup
                    }
                    onSelect={(place) =>
                      handleLocationSelect(
                        'pickup',
                        place
                      )
                    }
                    onUseCurrentLocation={() =>
                      getCurrentLocation()
                    }
                  />

                  <div className="ml-5 h-5 border-l border-dashed border-gray-300" />

                  <LocationInput
                    label="Delivery location"
                    name="deliveryLocation"
                    value={
                      form.deliveryLocation
                    }
                    onChange={handleChange}
                    placeholder="Search delivery location"
                    selectedLocation={
                      locations.delivery
                    }
                    onSelect={(place) =>
                      handleLocationSelect(
                        'delivery',
                        place
                      )
                    }
                    currentLocation={
                      currentLocation
                    }
                  />

                  {locationError && (
                    <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-xs leading-5 text-yellow-700">
                      {locationError}
                    </div>
                  )}
                </div>
              </section>

              {/* PACKAGE */}

              <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={<Box size={19} />}
                  title="Package details"
                  description="Tell us a little about what you're sending."
                />

                <div className="mt-6 space-y-5">
                  {/* TYPE */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Package type

                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        'Document',
                        'Food',
                        'Clothing',
                        'Other',
                      ].map(
                        (type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() =>
                              setForm(
                                (
                                  previous
                                ) => ({
                                  ...previous,
                                  packageType:
                                    type,
                                })
                              )
                            }
                            className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                              form.packageType ===
                              type
                                ? 'border-[#087443] bg-[#087443]/5 text-[#087443]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {form.packageType ===
                              type && (
                              <Check
                                size={14}
                                className="mr-1 inline"
                              />
                            )}

                            {type}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label
                      htmlFor="packageDescription"
                      className="mb-2 block text-sm font-bold text-gray-700"
                    >
                      Package description
                    </label>

                    <textarea
                      id="packageDescription"
                      name="packageDescription"
                      value={
                        form.packageDescription
                      }
                      onChange={
                        handleChange
                      }
                      rows={4}
                      placeholder="E.g. One medium box containing clothes..."
                      className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087443] focus:ring-4 focus:ring-[#087443]/10"
                    />
                  </div>

                  {/* VALUE */}

                  <div>
                    <label
                      htmlFor="packageValue"
                      className="mb-2 block text-sm font-bold text-gray-700"
                    >
                      Estimated package value

                      <span className="ml-1 font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                        ₦
                      </span>

                      <input
                        id="packageValue"
                        name="packageValue"
                        type="number"
                        min="0"
                        value={
                          form.packageValue
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-gray-200 py-3 pl-9 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087443] focus:ring-4 focus:ring-[#087443]/10"
                      />
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      This helps us understand the value of your package.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="lg:sticky lg:top-[140px] lg:h-fit">
              <div className="rounded-3xl bg-[#061A14] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Package size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Delivery summary
                    </p>

                    <p className="text-xs text-white/50">
                      We'll calculate your price next
                    </p>
                  </div>
                </div>

                <div className="my-6 border-t border-white/10" />

                <div className="space-y-5">
                  <SummaryRow
                    label="Receiver"
                    value={
                      form.receiverName ||
                      'Not provided'
                    }
                  />

                  <SummaryRow
                    label="Pickup"
                    value={
                      form.pickupLocation ||
                      'Not provided'
                    }
                  />

                  <SummaryRow
                    label="Destination"
                    value={
                      form.deliveryLocation ||
                      'Not provided'
                    }
                  />

                  <SummaryRow
                    label="Package"
                    value={
                      form.packageType ||
                      'Not selected'
                    }
                  />

                  <SummaryRow
                    label="Weight"
                    value={`${DEFAULT_PACKAGE_WEIGHT} kg`}
                  />
                </div>

                <div className="mt-7 rounded-2xl bg-white/5 p-4">
                  <p className="text-xs leading-5 text-white/55">
                    Your delivery fee will be calculated based on
                    the actual route distance, package weight and
                    current OYASEND pricing.
                  </p>
                </div>
              </div>

              <div className="mt-4 hidden rounded-2xl border border-gray-200 bg-white p-4 lg:block">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF6EA] text-[#087443]">
                    <Check size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Your information is safe
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Your delivery details are securely stored and
                      only shared with the people handling your order.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              to="/customer"
              className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                calculatingPrice}
              className="group flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor:
                  BRAND.primary,

                boxShadow: `0 12px 30px ${BRAND.primary}25`,
              }}
            >
              {calculatingPrice ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Calculating delivery price...
                </>
              ) : (
                <>
                  Continue to review

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* MOBILE NAV */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            to="/customer"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
          >
            <Package size={20} />
            Home
          </Link>

          <div
            className="flex flex-col items-center gap-1 text-xs font-bold"
            style={{
              color: BRAND.primary,
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{
                backgroundColor:
                  BRAND.primary,
              }}
            >
              <Package size={18} />
            </div>

            Send
          </div>

          <Link
            to="/customer/orders"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
          >
            <ClockIcon />
            Orders
          </Link>

          <Link
            to="/customer/profile"
            className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400"
          >
            <User size={20} />
            Profile
          </Link>
        </div>
      </nav>
    </div>
  )
}


/* =============================================================
   LOCATION INPUT
   SAME UI — ONLY SEARCH ENGINE CHANGED
============================================================= */

function LocationInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  pickup = false,
  currentLocation,
  selectedLocation,
  onSelect,
  onUseCurrentLocation,
}) {
  const containerRef = useRef(null)
  const debounceRef = useRef(null)
  const requestIdRef = useRef(0)

  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setFocused(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )
    }
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current
        )
      }
    }
  }, [])

  /*
   * ============================================================
   * LOCATION SEARCH
   * ============================================================
   */

  function handleInputChange(event) {
    const newValue = event.target.value

    onChange(event)

    setFocused(true)
    setSuggestions([])

    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      )
    }

    if (newValue.trim().length < 2) {
      setSearching(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue)
    }, 450)
  }

  async function searchLocations(query) {
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }

    const requestId =
      ++requestIdRef.current

    setSearching(true)

    try {
      /*
       * Search both systems.
       *
       * Nominatim is the primary search because we can
       * explicitly restrict it to Nigeria.
       *
       * Photon is the fallback / additional source.
       */

      const [
        nominatimResults,
        photonResults,
      ] = await Promise.all([
        searchNominatim(
          trimmed
        ).catch((err) => {
          console.warn(
            'Nominatim failed:',
            err
          )

          return []
        }),

        searchPhoton(
          trimmed
        ).catch((err) => {
          console.warn(
            'Photon failed:',
            err
          )

          return []
        }),
      ])

      if (
        requestId !==
        requestIdRef.current
      ) {
        return
      }

      const merged = mergeLocationResults(
        nominatimResults,
        photonResults,
        trimmed
      )

      setSuggestions(merged)
    } catch (err) {
      console.error(
        'Location search failed:',
        err
      )

      if (
        requestId ===
        requestIdRef.current
      ) {
        setSuggestions([])
      }
    } finally {
      if (
        requestId ===
        requestIdRef.current
      ) {
        setSearching(false)
      }
    }
  }

  /*
   * ============================================================
   * NOMINATIM
   * ============================================================
   */

  async function searchNominatim(query) {
    const nigeriaQuery =
      query.toLowerCase().includes('nigeria')
        ? query
        : `${query}, Nigeria`

    const params = new URLSearchParams({
      q: nigeriaQuery,

      format: 'jsonv2',

      addressdetails: '1',

      namedetails: '1',

      extratags: '1',

      limit: '10',

      /*
       * THIS IS THE IMPORTANT PART.
       *
       * Nigeria only.
       */
      countrycodes: 'ng',

      /*
       * Search actual addresses and POIs.
       */
      layer: 'address,poi,manmade',

      'accept-language': 'en',
    })

    /*
     * Bias toward user's current location.
     *
     * This is a bias, not a restriction.
     */
    if (currentLocation) {
      const latitude =
        currentLocation.latitude

      const longitude =
        currentLocation.longitude

      const size = 2

      params.set(
        'viewbox',
        `${longitude - size},${latitude + size},${longitude + size},${latitude - size}`
      )
    }

    const response = await fetch(
      `${NOMINATIM_API_URL}/search?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(
        `Nominatim returned ${response.status}`
      )
    }

    const data = await response.json()

    return data
      .map(formatNominatimResult)
      .filter(Boolean)
      .filter(isNigeriaResult)
  }

  /*
   * ============================================================
   * PHOTON
   * ============================================================
   */

  async function searchPhoton(query) {
    const nigeriaQuery =
      query.toLowerCase().includes('nigeria')
        ? query
        : `${query}, Nigeria`

    const params = new URLSearchParams({
      q: nigeriaQuery,

      limit: '10',

      lang: 'en',
    })

    if (currentLocation) {
      params.set(
        'lat',
        String(
          currentLocation.latitude
        )
      )

      params.set(
        'lon',
        String(
          currentLocation.longitude
        )
      )
    }

    const response = await fetch(
      `${PHOTON_API_URL}?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error(
        `Photon returned ${response.status}`
      )
    }

    const data =
      await response.json()

    return (data.features || [])
      .map(formatPhotonResult)
      .filter(Boolean)
      .filter(isNigeriaResult)
  }

  /*
   * ============================================================
   * NORMALIZE NOMINATIM
   * ============================================================
   */

  function formatNominatimResult(result) {
    const latitude =
      Number(result.lat)

    const longitude =
      Number(result.lon)

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null
    }

    const address =
      formatNominatimAddress(
        result
      )

    if (!address) {
      return null
    }

    const mainName =
      result.name ||
      result.namedetails?.name ||
      result.address?.road ||
      result.address?.suburb ||
      result.address?.town ||
      result.address?.city ||
      'Location'

    return {
      id: `nominatim-${result.osm_type}-${result.osm_id || result.place_id}`,

      address,

      mainName,

      latitude,

      longitude,

      placeId:
        result.osm_id
          ? `${result.osm_type}${result.osm_id}`
          : null,

      source: 'nominatim',

      type: getNominatimType(
        result
      ),

      country:
        result.address?.country ||
        'Nigeria',

      raw: result,
    }
  }

  /*
   * ============================================================
   * NORMALIZE PHOTON
   * ============================================================
   */

  function formatPhotonResult(feature) {
    const coordinates =
      feature.geometry?.coordinates

    if (
      !coordinates ||
      coordinates.length < 2
    ) {
      return null
    }

    const longitude =
      Number(coordinates[0])

    const latitude =
      Number(coordinates[1])

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null
    }

    const properties =
      feature.properties || {}

    const address =
      formatPhotonAddress(
        feature
      )

    if (!address) {
      return null
    }

    const mainName =
      properties.name ||
      properties.street ||
      properties.city ||
      properties.town ||
      'Location'

    return {
      id: `photon-${properties.osm_type || 'place'}-${properties.osm_id || `${latitude}-${longitude}`}`,

      address,

      mainName,

      latitude,

      longitude,

      placeId:
        properties.osm_id
          ? String(
              properties.osm_id
            )
          : null,

      source: 'photon',

      type: getPhotonType(
        properties
      ),

      country:
        properties.country ||
        'Nigeria',

      raw: feature,
    }
  }

  /*
   * ============================================================
   * MERGE + RANK RESULTS
   * ============================================================
   */

  function mergeLocationResults(
    nominatimResults,
    photonResults,
    query
  ) {
    const all = [
      ...nominatimResults,
      ...photonResults,
    ]

    const seen = new Set()

    const unique = all.filter(
      (result) => {
        const key = [
          Number(
            result.latitude
          ).toFixed(5),

          Number(
            result.longitude
          ).toFixed(5),

          result.address
            .toLowerCase()
            .slice(0, 100),
        ].join('|')

        if (seen.has(key)) {
          return false
        }

        seen.add(key)

        return true
      }
    )

    const queryWords =
      query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)

    return unique
      .map((result) => ({
        ...result,

        score:
          scoreLocation(
            result,
            queryWords
          ),
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 6)
  }

  function scoreLocation(
    result,
    queryWords
  ) {
    const text = [
      result.mainName,
      result.address,
      result.type,
    ]
      .join(' ')
      .toLowerCase()

    const fullQuery =
      queryWords.join(' ')

    let score = 0

    /*
     * Exact phrase.
     */
    if (
      text.includes(
        fullQuery
      )
    ) {
      score += 100
    }

    /*
     * Individual words.
     */
    queryWords.forEach(
      (word) => {
        if (
          text.includes(word)
        ) {
          score += 15
        }
      }
    )

    /*
     * Prefer Nigerian local places.
     */
    if (
      text.includes('nigeria')
    ) {
      score += 20
    }

    /*
     * Useful delivery landmarks.
     */
    if (
      result.type ===
      'Bus stop'
    ) {
      score += 25
    }

    if (
      result.type ===
      'School'
    ) {
      score += 25
    }

    if (
      result.type ===
      'Road / Junction'
    ) {
      score += 25
    }

    if (
      result.type ===
      'Place / Landmark'
    ) {
      score += 20
    }

    /*
     * Nearby result.
     */
    if (currentLocation) {
      const distance =
        distanceKm(
          currentLocation.latitude,
          currentLocation.longitude,
          result.latitude,
          result.longitude
        )

      if (distance < 1) {
        score += 40
      } else if (distance < 3) {
        score += 30
      } else if (distance < 10) {
        score += 15
      }
    }

    /*
     * Nominatim gets a slight preference because
     * we can hard-filter it to Nigeria.
     */
    if (
      result.source ===
      'nominatim'
    ) {
      score += 5
    }

    return score
  }

  /*
   * ============================================================
   * SELECT LOCATION
   * ============================================================
   */

  function handleSuggestionClick(
    suggestion
  ) {
    onSelect({
      address:
        suggestion.address,

      latitude:
        suggestion.latitude,

      longitude:
        suggestion.longitude,

      placeId:
        suggestion.placeId,

      isCurrentLocation: false,
    })

    setSuggestions([])
    setFocused(false)
  }

  /*
   * ============================================================
   * CURRENT LOCATION
   * ============================================================
   */

  function handleCurrentLocation() {
    if (!pickup) {
      return
    }

    if (onUseCurrentLocation) {
      onUseCurrentLocation()
    }

    setFocused(false)
    setSuggestions([])
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-gray-700"
      >
        {label}

        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-4 top-1/2 z-10 flex h-3 w-3 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              pickup
                ? BRAND.primary
                : BRAND.yellow,
          }}
        />

        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={
            handleInputChange
          }
          onFocus={() => {
            setFocused(true)

            if (
              value.trim().length >=
              2
            ) {
              searchLocations(value)
            }
          }}
          placeholder={placeholder}
          required
          autoComplete="off"
          className={`w-full rounded-2xl border py-3.5 pl-11 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087443] focus:ring-4 focus:ring-[#087443]/10 ${
            selectedLocation
              ? 'border-[#087443]/30 bg-[#087443]/[0.02]'
              : 'border-gray-200'
          }`}
        />

        {searching && (
          <Loader2
            size={17}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
          />
        )}

        {!searching &&
          pickup &&
          selectedLocation?.isCurrentLocation && (
            <Navigation
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#087443]"
            />
          )}
      </div>

      {pickup && (
        <button
          type="button"
          onClick={
            handleCurrentLocation
          }
          className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#087443] transition hover:opacity-70"
        >
          <Navigation size={13} />

          {selectedLocation?.isCurrentLocation
            ? 'Using your current location'
            : 'Use my current location'}
        </button>
      )}

      {/* =====================================================
          SUGGESTIONS
      ===================================================== */}

      {focused &&
        suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Suggested locations
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {suggestions.map(
                (
                  suggestion,
                  index
                ) => (
                  <button
                    key={`${suggestion.id}-${index}`}
                    type="button"
                    onMouseDown={(
                      event
                    ) =>
                      event.preventDefault()
                    }
                    onClick={() =>
                      handleSuggestionClick(
                        suggestion
                      )
                    }
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#087443]/5"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#087443]/10 text-[#087443]">
                      <MapPin
                        size={16}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {
                          suggestion.mainName
                        }
                      </p>

                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-gray-400">
                        {
                          suggestion.address
                        }
                      </p>

                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#087443]">
                        {
                          suggestion.type
                        }
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>

            <div className="border-t border-gray-100 px-4 py-2">
              <p className="text-[10px] text-gray-400">
                Location data © OpenStreetMap contributors
              </p>
            </div>
          </div>
        )}

      {/* SEARCHING */}

      {focused &&
        value.trim().length >=
          2 &&
        searching &&
        suggestions.length ===
          0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Loader2
                size={17}
                className="animate-spin text-[#087443]"
              />

              <p className="text-sm text-gray-500">
                Finding Nigerian locations...
              </p>
            </div>
          </div>
        )}

      {/* NO RESULTS */}

      {focused &&
        !searching &&
        value.trim().length >=
          2 &&
        suggestions.length ===
          0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <MapPin
                size={17}
                className="text-gray-400"
              />

              <p className="text-sm text-gray-500">
                No matching Nigerian location found.
              </p>
            </div>
          </div>
        )}
    </div>
  )
}


/* =============================================================
   NOMINATIM ADDRESS FORMATTER
============================================================= */

function formatNominatimAddress(
  result
) {
  const address =
    result?.address || {}

  const parts = [
    address.house_number,
    address.road,

    address.neighbourhood,
    address.suburb,

    address.quarter,
    address.city_district,

    address.town,
    address.city,

    address.state_district,
    address.state,

    address.country,
  ].filter(Boolean)

  return [
    ...new Set(parts),
  ].join(', ')
}


/* =============================================================
   PHOTON ADDRESS FORMATTER
============================================================= */

function formatPhotonAddress(
  feature
) {
  const properties =
    feature?.properties || {}

  const parts = []

  const name =
    properties.name

  const street =
    properties.street

  const housenumber =
    properties.housenumber

  const city =
    properties.city ||
    properties.town ||
    properties.village ||
    properties.municipality

  const district =
    properties.district

  const state =
    properties.state

  const country =
    properties.country

  if (name) {
    parts.push(name)
  }

  if (
    street &&
    housenumber
  ) {
    parts.push(
      `${housenumber} ${street}`
    )
  } else if (street) {
    parts.push(street)
  }

  if (
    district &&
    !parts.includes(
      district
    )
  ) {
    parts.push(district)
  }

  if (
    city &&
    !parts.includes(city)
  ) {
    parts.push(city)
  }

  if (
    state &&
    !parts.includes(state)
  ) {
    parts.push(state)
  }

  if (
    country &&
    !parts.includes(country)
  ) {
    parts.push(country)
  }

  if (parts.length > 0) {
    return parts.join(', ')
  }

  return (
    properties.postcode ||
    'Selected location'
  )
}


/* =============================================================
   LOCATION TYPE
============================================================= */

function getNominatimType(
  result
) {
  const address =
    result?.address || {}

  const type =
    String(
      result?.type || ''
    ).toLowerCase()

  const category =
    String(
      result?.category || ''
    ).toLowerCase()

  if (
    type.includes('bus') ||
    address.bus_stop ||
    address.public_transport ||
    result?.extratags?.highway ===
      'bus_stop'
  ) {
    return 'Bus stop'
  }

  if (
    type === 'school' ||
    category === 'amenity' &&
      type === 'school'
  ) {
    return 'School'
  }

  if (
    type.includes('junction') ||
    category === 'highway'
  ) {
    return 'Road / Junction'
  }

  if (
    category === 'amenity' ||
    category === 'shop' ||
    category === 'tourism' ||
    category === 'place'
  ) {
    return 'Place / Landmark'
  }

  if (
    type === 'road' ||
    type === 'street'
  ) {
    return 'Street / Road'
  }

  return 'Location'
}


function getPhotonType(
  properties
) {
  const type =
    String(
      properties.type ||
        properties.osm_value ||
        properties.osm_key ||
        ''
    ).toLowerCase()

  if (
    type.includes('bus') ||
    type.includes('stop')
  ) {
    return 'Bus stop'
  }

  if (
    type.includes('school')
  ) {
    return 'School'
  }

  if (
    type.includes('junction') ||
    type.includes('road') ||
    type.includes('street')
  ) {
    return 'Road / Junction'
  }

  if (
    type.includes('amenity') ||
    type.includes('shop') ||
    type.includes('building')
  ) {
    return 'Place / Landmark'
  }

  return 'Location'
}


/* =============================================================
   NIGERIA FILTER
============================================================= */

function isNigeriaResult(
  result
) {
  const raw =
    result.raw || {}

  const address =
    raw.address || {}

  const country =
    String(
      address.country ||
        raw.country ||
        ''
    ).toLowerCase()

  const countryCode =
    String(
      address.country_code ||
        raw.countrycode ||
        raw.country_code ||
        ''
    ).toLowerCase()

  /*
   * Nominatim has country_code.
   */
  if (
    countryCode &&
    countryCode !== 'ng'
  ) {
    return false
  }

  /*
   * If the API gives a country name,
   * make sure it is Nigeria.
   */
  if (
    country &&
    !country.includes('nigeria')
  ) {
    return false
  }

  return true
}


/* =============================================================
   DISTANCE
============================================================= */

function distanceKm(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const toRadians = (
    value
  ) =>
    (value * Math.PI) / 180

  const R = 6371

  const dLat = toRadians(
    lat2 - lat1
  )

  const dLon = toRadians(
    lon2 - lon1
  )

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      toRadians(lat1)
    ) *
      Math.cos(
        toRadians(lat2)
      ) *
      Math.sin(dLon / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return R * c
}


/* =============================================================
   UI COMPONENTS
============================================================= */

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor:
            '#08744312',
          color:
            '#087443',
        }}
      >
        {icon}
      </div>

      <div>
        <h3 className="font-black text-[#061A14]">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-400">
          {description}
        </p>
      </div>
    </div>
  )
}


function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  required,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-gray-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087443] focus:ring-4 focus:ring-[#087443]/10"
        />
      </div>
    </div>
  )
}


function SummaryRow({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  )
}


function Step({
  number,
  title,
  active = false,
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
          active
            ? 'text-white'
            : 'bg-gray-100 text-gray-400'
        }`}
        style={{
          backgroundColor:
            active
              ? BRAND.primary
              : undefined,
        }}
      >
        {number}
      </div>

      <span
        className={`hidden text-xs font-bold sm:block ${
          active
            ? 'text-[#061A14]'
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


function ClockIcon() {
  return (
    <ChevronRight size={20} />
  )
}


export default SendPackage