// import { useState } from 'react'
// import { ArrowLeft, ArrowRight, MapPin, Package } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'

// function SendPackage() {
//   const navigate = useNavigate()

//   const [form, setForm] = useState({
//     pickupAddress: '',
//     pickupArea: '',
//     pickupPhone: '',

//     recipientName: '',
//     recipientPhone: '',
//     deliveryAddress: '',
//     deliveryArea: '',

//     packageDescription: '',
//     packageSize: 'small',

//     deliveryType: 'standard',
//   })

//   const [error, setError] = useState('')

//   function handleChange(event) {
//     const { name, value } = event.target

//     setForm((previous) => ({
//       ...previous,
//       [name]: value,
//     }))
//   }

//   function handleSubmit(event) {
//     event.preventDefault()

//     setError('')

//     if (
//       !form.pickupAddress ||
//       !form.pickupArea ||
//       !form.pickupPhone ||
//       !form.recipientName ||
//       !form.recipientPhone ||
//       !form.deliveryAddress ||
//       !form.deliveryArea ||
//       !form.packageDescription
//     ) {
//       setError('Please fill in all required fields.')
//       return
//     }

//     // Temporary:
//     // Later this will be replaced with proper state management
//     // and order creation.
//     sessionStorage.setItem(
//       'oyaSendDispatch',
//       JSON.stringify(form)
//     )

//     navigate('/customer/send-package/review')
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* Header */}
//       <header className="border-b border-gray-100 bg-white">
//         <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">

//           <button
//             onClick={() => navigate('/customer')}
//             className="mr-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
//           >
//             <ArrowLeft size={20} />
//           </button>

//           <div>
//             <p className="text-sm font-semibold text-green-600">
//               OYA SEND
//             </p>

//             <h1 className="text-lg font-bold text-gray-900">
//               Send a package
//             </h1>
//           </div>

//         </div>
//       </header>


//       <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

//         {/* Progress */}
//         <div className="mb-8">

//           <div className="flex items-center justify-between text-sm">

//             <span className="font-semibold text-green-600">
//               Package details
//             </span>

//             <span className="text-gray-400">
//               Step 1 of 2
//             </span>

//           </div>

//           <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
//             <div className="h-full w-1/2 rounded-full bg-green-600" />
//           </div>

//         </div>


//         {error && (
//           <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
//             {error}
//           </div>
//         )}


//         <form onSubmit={handleSubmit} className="space-y-6">

//           {/* Pickup */}
//           <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

//             <div className="mb-6 flex items-start gap-3">

//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
//                 <MapPin size={20} />
//               </div>

//               <div>
//                 <h2 className="font-bold text-gray-900">
//                   Pickup details
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Where should the rider pick up the package?
//                 </p>
//               </div>

//             </div>


//             <div className="grid gap-5 sm:grid-cols-2">

//               <div className="sm:col-span-2">
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Pickup address
//                 </label>

//                 <input
//                   type="text"
//                   name="pickupAddress"
//                   value={form.pickupAddress}
//                   onChange={handleChange}
//                   placeholder="Enter pickup address"
//                   required
//                   className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>


//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Area
//                 </label>

//                 <input
//                   type="text"
//                   name="pickupArea"
//                   value={form.pickupArea}
//                   onChange={handleChange}
//                   placeholder="e.g. Yaba"
//                   required
//                   className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>


//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Pickup phone
//                 </label>

//                 <input
//                   type="tel"
//                   name="pickupPhone"
//                   value={form.pickupPhone}
//                   onChange={handleChange}
//                   placeholder="08012345678"
//                   required
//                   className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>

//             </div>

//           </section>


//           {/* Recipient */}
//           <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

//             <div className="mb-6 flex items-start gap-3">

//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
//                 <MapPin size={20} />
//               </div>

//               <div>
//                 <h2 className="font-bold text-gray-900">
//                   Recipient details
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Who should receive the package?
//                 </p>
//               </div>

//             </div>


//             <div className="grid gap-5 sm:grid-cols-2">

//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Recipient name
//                 </label>

//                 <input
//                   type="text"
//                   name="recipientName"
//                   value={form.recipientName}
//                   onChange={handleChange}
//                   placeholder="Full name"
//                   required
//                   className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>


//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Recipient phone
//                 </label>

//                 <input
//                   type="tel"
//                   name="recipientPhone"
//                   value={form.recipientPhone}
//                   onChange={handleChange}
//                   placeholder="08012345678"
//                   required
//                   className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>


//               <div className="sm:col-span-2">
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Delivery address
//                 </label>

//                 <input
//                   type="text"
//                   name="deliveryAddress"
//                   value={form.deliveryAddress}
//                   onChange={handleChange}
//                   placeholder="Enter recipient's address"
//                   required
//                   className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>


//               <div className="sm:col-span-2">
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   Area
//                 </label>

//                 <input
//                   type="text"
//                   name="deliveryArea"
//                   value={form.deliveryArea}
//                   onChange={handleChange}
//                   placeholder="e.g. Lekki"
//                   required
//                   className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>

//             </div>

//           </section>


//           {/* Package */}
//           <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

//             <div className="mb-6 flex items-start gap-3">

//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
//                 <Package size={20} />
//               </div>

//               <div>
//                 <h2 className="font-bold text-gray-900">
//                   Package details
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Tell us a little about what you're sending.
//                 </p>
//               </div>

//             </div>


//             <div className="space-y-5">

//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                   What are you sending?
//                 </label>

//                 <textarea
//                   name="packageDescription"
//                   value={form.packageDescription}
//                   onChange={handleChange}
//                   placeholder="e.g. Clothes, documents, food..."
//                   rows="3"
//                   required
//                   className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
//                 />
//               </div>


//               <div>
//                 <label className="mb-3 block text-sm font-medium text-gray-700">
//                   Package size
//                 </label>

//                 <div className="grid gap-3 sm:grid-cols-3">

//                   {[
//                     {
//                       value: 'small',
//                       label: 'Small',
//                       description: 'Documents / small items',
//                     },
//                     {
//                       value: 'medium',
//                       label: 'Medium',
//                       description: 'Shoes / clothes',
//                     },
//                     {
//                       value: 'large',
//                       label: 'Large',
//                       description: 'Large packages',
//                     },
//                   ].map((size) => (
//                     <label
//                       key={size.value}
//                       className={`cursor-pointer rounded-xl border p-4 transition ${
//                         form.packageSize === size.value
//                           ? 'border-green-500 bg-green-50'
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                     >

//                       <input
//                         type="radio"
//                         name="packageSize"
//                         value={size.value}
//                         checked={form.packageSize === size.value}
//                         onChange={handleChange}
//                         className="sr-only"
//                       />

//                       <p className="font-semibold text-gray-900">
//                         {size.label}
//                       </p>

//                       <p className="mt-1 text-xs text-gray-500">
//                         {size.description}
//                       </p>

//                     </label>
//                   ))}

//                 </div>

//               </div>

//             </div>

//           </section>


//           {/* Delivery */}
//           <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

//             <h2 className="font-bold text-gray-900">
//               Delivery option
//             </h2>

//             <p className="mt-1 text-sm text-gray-500">
//               Choose how quickly you want your package delivered.
//             </p>


//             <div className="mt-5 grid gap-3 sm:grid-cols-2">

//               <label
//                 className={`cursor-pointer rounded-xl border p-4 transition ${
//                   form.deliveryType === 'standard'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-200'
//                 }`}
//               >

//                 <input
//                   type="radio"
//                   name="deliveryType"
//                   value="standard"
//                   checked={form.deliveryType === 'standard'}
//                   onChange={handleChange}
//                   className="sr-only"
//                 />

//                 <p className="font-semibold text-gray-900">
//                   Standard
//                 </p>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Regular delivery
//                 </p>

//               </label>


//               <label
//                 className={`cursor-pointer rounded-xl border p-4 transition ${
//                   form.deliveryType === 'express'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-200'
//                 }`}
//               >

//                 <input
//                   type="radio"
//                   name="deliveryType"
//                   value="express"
//                   checked={form.deliveryType === 'express'}
//                   onChange={handleChange}
//                   className="sr-only"
//                 />

//                 <p className="font-semibold text-gray-900">
//                   Express
//                 </p>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Faster delivery
//                 </p>

//               </label>

//             </div>

//           </section>


//           {/* Submit */}
//           <div className="flex justify-end">

//             <button
//               type="submit"
//               className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white transition hover:bg-green-700 sm:w-auto"
//             >
//               Continue to review
//               <ArrowRight size={18} />
//             </button>

//           </div>

//         </form>

//       </main>

//     </div>
//   )
// }

// export default SendPackage



import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  MapPin,
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
  })

  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (
      !form.receiverName ||
      !form.receiverPhone ||
      !form.pickupLocation ||
      !form.deliveryLocation ||
      !form.packageType
    ) {
      setError('Please fill in all required fields.')
      return
    }

    /*
      For now we pass the form to the review page.

      Later this will become:
      1. Calculate delivery price
      2. Save draft/order to Firestore
      3. Show order review
      4. Take payment through Paystack
    */

    navigate('/customer/send-package/review', {
      state: {
        form,
      },
    })
  }

  return (
    <div
      className="min-h-screen pb-24 md:pb-0"
      style={{ backgroundColor: BRAND.background }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[68px] max-w-5xl items-center px-4 sm:px-6">

          <button
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
              backgroundColor: `${BRAND.primary}12`,
              color: BRAND.primary,
            }}
          >
            <Package size={24} />
          </div>

          <h2
            className="text-2xl font-black tracking-tight sm:text-3xl"
            style={{ color: BRAND.dark }}
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
                    value={form.receiverName}
                    onChange={handleChange}
                    placeholder="Enter receiver's full name"
                    icon={<User size={17} />}
                    required
                  />

                  <Input
                    label="Receiver's phone number"
                    name="receiverPhone"
                    type="number"
                    value={form.receiverPhone}
                    onChange={handleChange}
                    placeholder="0801 234 5678"
                    icon={<Phone size={17} />}
                    required
                  />

                </div>

              </section>


              {/* LOCATIONS */}

              <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                <SectionHeader
                  icon={<MapPin size={19} />}
                  title="Delivery locations"
                  description="Where should the rider pick up and deliver?"
                />

                <div className="mt-6 space-y-4">

                  <LocationInput
                    label="Pickup location"
                    name="pickupLocation"
                    value={form.pickupLocation}
                    onChange={handleChange}
                    placeholder="Where should we pick up the package?"
                    pickup
                  />

                  <div className="ml-5 h-5 border-l border-dashed border-gray-300" />

                  <LocationInput
                    label="Delivery location"
                    name="deliveryLocation"
                    value={form.deliveryLocation}
                    onChange={handleChange}
                    placeholder="Where should we deliver the package?"
                  />

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

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Package type
                    </label>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                      {[
                        'Document',
                        'Food',
                        'Clothing',
                        'Other',
                      ].map((type) => (

                        <button
                          type="button"
                          key={type}
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              packageType: type,
                            }))
                          }
                          className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                            form.packageType === type
                              ? 'border-[#087443] bg-[#087443]/5 text-[#087443]'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {form.packageType === type && (
                            <Check
                              size={14}
                              className="mr-1 inline"
                            />
                          )}

                          {type}

                        </button>

                      ))}

                    </div>

                  </div>


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
                      value={form.packageDescription}
                      onChange={handleChange}
                      rows={4}
                      placeholder="E.g. One medium box containing clothes..."
                      className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087443] focus:ring-4 focus:ring-[#087443]/10"
                    />

                  </div>


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
                        value={form.packageValue}
                        onChange={handleChange}
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
                    value={form.receiverName || 'Not provided'}
                  />

                  <SummaryRow
                    label="Pickup"
                    value={form.pickupLocation || 'Not provided'}
                  />

                  <SummaryRow
                    label="Destination"
                    value={form.deliveryLocation || 'Not provided'}
                  />

                  <SummaryRow
                    label="Package"
                    value={form.packageType || 'Not selected'}
                  />

                </div>


                <div className="mt-7 rounded-2xl bg-white/5 p-4">

                  <p className="text-xs leading-5 text-white/55">
                    Your delivery fee will be calculated based on
                    the route, distance and current OYASEND pricing.
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
              className="group flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
              style={{
                backgroundColor: BRAND.primary,
                boxShadow: `0 12px 30px ${BRAND.primary}25`,
              }}
            >
              Continue to review

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />

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
            style={{ color: BRAND.primary }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: BRAND.primary }}
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
   COMPONENTS
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
          backgroundColor: '#08744312',
          color: '#087443',
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


function LocationInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  pickup = false,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-gray-700"
      >
        {label}
        <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="relative">

        <div
          className="pointer-events-none absolute left-4 top-1/2 flex h-3 w-3 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            backgroundColor: pickup
              ? BRAND.primary
              : BRAND.yellow,
          }}
        />

        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full rounded-2xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087443] focus:ring-4 focus:ring-[#087443]/10"
        />

      </div>

    </div>
  )
}


function SummaryRow({ label, value }) {
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
          backgroundColor: active
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
  return <ChevronRight size={20} />
}


export default SendPackage