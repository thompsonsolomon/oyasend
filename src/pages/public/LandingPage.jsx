import { Link } from 'react-router-dom'
import {
 ArrowRight,
 Bike,
 CheckCircle2,
 ChevronDown,
 Clock3,
 MapPin,
 Menu,
 Package,
 Phone,
 ShieldCheck,
 ShoppingBasket,
 Star,
 X,
} from 'lucide-react'
import { useState } from 'react'
import Logo from '../../components/ui/Logo'

function Home() {
 const [mobileMenu, setMobileMenu] = useState(false)

 const services = [
  {
   title: 'Send a Package',
   description:
    'Send packages safely to any location within our service area.',
   image:
   'send.png',
    // 'https://images.unsplash.com/photo-1586528116493-da8b4b9f3f4a?auto=format&fit=crop&w=900&q=85',
   icon: Package,
   link: '/register',
  },
  {
   title: 'Go to Market',
   description:
    'Tell us what you need and we’ll handle the shopping and delivery.',
   image:
   '/woman.png',
    // 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=85',
   icon: ShoppingBasket,
   link: '/register',
  },
  {
   title: 'OYA SEND Ride',
   description:
    'Need a rider? Get quick and reliable transportation whenever you need it.',
   image:
   '/bike.png',
    // 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=85',
   icon: Bike,
   link: '/register',
  },
 ]

 const steps = [
  {
   number: '01',
   title: 'Create a Request',
   description:
    'Choose a service and provide the details of what you need.',
   icon: Package,
  },
  {
   number: '02',
   title: 'We Assign a Rider',
   description:
    'We match your request with an available rider near you.',
   icon: Bike,
  },
  {
   number: '03',
   title: 'Track in Real-time',
   description:
    'Follow your order from pickup until it gets to you.',
   icon: MapPin,
  },
  {
   number: '04',
   title: 'Delivered!',
   description:
    'Your package or market order gets delivered safely.',
   icon: CheckCircle2,
  },
 ]

 const benefits = [
  {
   title: 'Verified & Professional Riders',
   text: 'Our riders are properly verified and ready to serve you.',
   icon: ShieldCheck,
  },
  {
   title: 'Safe & Secure',
   text: 'Your order information and payments are protected.',
   icon: ShieldCheck,
  },
  {
   title: 'Support You Can Count On',
   text: 'We are always available when you need help.',
   icon: Phone,
  },
 ]

 return (
  <div className="min-h-screen overflow-x-hidden bg-white text-[#06121B]">

   {/* =========================================================
          NAVBAR
      ========================================================= */}

   <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl">

    <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">

     {/* LOGO */}
     <Link
      to="/"
      className="flex items-center gap-2"
     >
     <Logo />
      <span className="text-[21px] font-black tracking-tight">
       OYA<span className="text-[#08752A]">SEND</span>
      </span>
     </Link>

     {/* DESKTOP NAV */}
     <nav className="hidden items-center gap-8 lg:flex">

      <div className="group relative">
       <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 transition hover:text-[#064410]">
        Services
        <ChevronDown size={15} />
       </button>

       <div className="invisible absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">

        <Link
         to="/register"
         className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[#F2F8F2]"
        >
         <Package size={17} className="text-[#064410]" />
         Send a Package
        </Link>

        <Link
         to="/register"
         className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[#F2F8F2]"
        >
         <ShoppingBasket size={17} className="text-[#064410]" />
         Go to Market
        </Link>

        <Link
         to="/register"
         className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[#F2F8F2]"
        >
         <Bike size={17} className="text-[#064410]" />
         OYA SEND Ride
        </Link>

       </div>
      </div>

      <a
       href="#how-it-works"
       className="text-sm font-semibold text-gray-700 transition hover:text-[#064410]"
      >
       How it works
      </a>

      <Link
       to="/login"
       className="text-sm font-semibold text-gray-700 transition hover:text-[#064410]"
      >
       Track Order
      </Link>

      <a
       href="#footer"
       className="text-sm font-semibold text-gray-700 transition hover:text-[#064410]"
      >
       Help
      </a>

     </nav>

     {/* DESKTOP ACTIONS */}
     <div className="hidden items-center gap-3 sm:flex">

      <Link
       to="/login"
       className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
      >
       Login
      </Link>

      <Link
       to="/register"
       className="rounded-xl bg-[#08752A] px-5 py-2.5 text-sm font-bold text-white TTW shadow-lg shadow-green-900/10 transition hover:bg-[#064410]"
      >
       Get Started
      </Link>

     </div>

     {/* MOBILE MENU BUTTON */}
     <button
      onClick={() => setMobileMenu(!mobileMenu)}
      className="rounded-xl p-2 lg:hidden"
     >
      {mobileMenu ? (
       <X size={25} />
      ) : (
       <Menu size={25} />
      )}
     </button>

    </div>

    {/* MOBILE MENU */}
    {mobileMenu && (
     <div className="border-t border-gray-100 bg-white px-5 py-5 lg:hidden">

      <div className="flex flex-col gap-1">

       <a
        href="#services"
        onClick={() => setMobileMenu(false)}
        className="rounded-xl px-4 py-3 font-semibold hover:bg-gray-50"
       >
        Services
       </a>

       <a
        href="#how-it-works"
        onClick={() => setMobileMenu(false)}
        className="rounded-xl px-4 py-3 font-semibold hover:bg-gray-50"
       >
        How it works
       </a>

       <Link
        to="/login"
        className="rounded-xl px-4 py-3 font-semibold hover:bg-gray-50"
       >
        Track Order
       </Link>

       <div className="mt-3 flex gap-3 border-t border-gray-100 pt-4">

        <Link
         to="/login"
         className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-bold"
        >
         Login
        </Link>

        <Link
         to="/register"
         className="flex-1 rounded-xl bg-[#08752A] py-3 text-center text-sm font-bold text-white"
        >
         Get Started
        </Link>

       </div>

      </div>

     </div>
    )}

   </header>


   {/* =========================================================
          HERO
      ========================================================= */}

   <section className="relative overflow-hidden bg-white">

    {/* subtle background */}
    <div className="absolute right-0 top-0 -z-0 h-[600px] w-[600px] rounded-full bg-[#EAF5EA] blur-3xl" />

    <div className="relative mx-auto grid max-w-[1400px] items-center px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:pb-20 lg:pt-16">

     {/* LEFT */}
     <div className="relative z-10 max-w-[650px]">

      {/* badge */}
      <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#EDF8ED] px-4 py-2 text-sm font-bold text-[#08752A]">

       <ShieldCheck size={17} />

       Fast. Reliable. Affordable.

      </div>

      {/* heading */}
      <h1 className="text-[46px] font-black leading-[0.98] tracking-[-0.045em] text-[#07141D] sm:text-6xl lg:text-[72px]">

       We run errands

       <span className="block">
        so you{' '}
        <span className="text-[#08752A]">
         don’t stress.
        </span>
       </span>

      </h1>

      <p className="mt-7 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
       Send packages, shop from the market, book a ride or
       handle everyday errands — all with one reliable service.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">

       <Link
        to="/register"
        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#08752A] px-7 py-4 text-sm TTW font-bold text-white shadow-xl shadow-green-900/10 transition hover:bg-[#064410]"
       >
        Send a Package

        <ArrowRight
         size={18}
         className="transition-transform group-hover:translate-x-1"
        />
       </Link>

       <Link
        to="/register"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#08752A] bg-white px-7 py-4 text-sm font-bold text-[#08752A] transition hover:bg-[#EDF8ED]"
       >
        Go to Market
       </Link>

      </div>

      {/* FEATURES */}
      <div className="mt-9 grid grid-cols-3 gap-4 border-t border-gray-100 pt-7">

       <div>
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF6EA]">
         <Bike
          size={17}
          className="text-[#08752A]"
         />
        </div>

        <p className="text-xs font-bold sm:text-sm">
         Trusted Riders
        </p>
       </div>

       <div>
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF6EA]">
         <MapPin
          size={17}
          className="text-[#08752A]"
         />
        </div>

        <p className="text-xs font-bold sm:text-sm">
         Live Tracking
        </p>
       </div>

       <div>
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF6EA]">
         <ShieldCheck
          size={17}
          className="text-[#08752A]"
         />
        </div>

        <p className="text-xs font-bold sm:text-sm">
         Secure Payments
        </p>
       </div>

      </div>

      {/* SOCIAL PROOF */}
      <div className="mt-8 flex items-center gap-4">

       <div className="flex -space-x-3">

        {[
         'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
         'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
         'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
         'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        ].map((image, index) => (
         <img
          key={index}
          src={image}
          alt=""
          className="h-10 w-10 rounded-full border-2 border-white object-cover"
         />
        ))}

       </div>

       <div>

        <div className="flex items-center gap-1">

         {[1, 2, 3, 4, 5].map((star) => (
          <Star
           key={star}
           size={15}
           fill="#F4D500"
           className="text-[#F4D500]"
          />
         ))}

        </div>

        <p className="mt-1 text-xs font-medium text-gray-500">
         Trusted by thousands of customers
        </p>

       </div>

      </div>

     </div>


     {/* RIGHT HERO */}
     <div className="relative mt-12 min-h-[540px] lg:mt-0">

      {/* IMAGE */}
      <div className="absolute inset-y-0 right-[-40px] w-[92%] overflow-hidden rounded-l-[60px] lg:right-[-100px]">

       <img
       src="/background.png"
        // src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1300&q=90"
        alt="OYA SEND rider"
        className="h-full w-full object-cover"
       />

       <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />

      </div>


      {/* TRACKING CARD */}
      <div className="absolute left-0 top-24 z-20 w-[290px] rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl shadow-black/15 sm:w-[320px]">

       <div className="flex items-start justify-between">

        <div>
         <p className="text-xs font-bold text-gray-400">
          LIVE DELIVERY
         </p>

         <h3 className="mt-1 text-lg font-black">
          OYA-1024
         </h3>
        </div>

        <span className="rounded-full bg-[#EAF7EA] px-3 py-1.5 text-[11px] font-bold text-[#08752A]">
         In Transit
        </span>

       </div>

       {/* route */}
       <div className="mt-6">

        <div className="flex gap-3">

         <div className="flex flex-col items-center">

          <div className="h-3 w-3 rounded-full border-[3px] border-[#08752A] bg-white" />

          <div className="h-12 border-l border-dashed border-gray-300" />

          <div className="h-3 w-3 rounded-full bg-[#F4D500]" />

         </div>

         <div className="flex flex-1 flex-col justify-between pb-1">

          <div>
           <p className="text-[11px] text-gray-400">
            Pickup
           </p>

           <p className="mt-1 text-sm font-bold">
            Oja Oke
           </p>
          </div>

          <div>
           <p className="text-[11px] text-gray-400">
            Destination
           </p>

           <p className="mt-1 text-sm font-bold">
            City Centre
           </p>
          </div>

         </div>

        </div>

       </div>

       <div className="my-5 border-t border-gray-100" />

       {/* rider */}
       <div className="flex items-center gap-3">

        <img
         src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
         alt=""
         className="h-10 w-10 rounded-full object-cover"
        />

        <div className="flex-1">

         <p className="text-[10px] text-gray-400">
          YOUR RIDER
         </p>

         <p className="text-sm font-bold">
          Michael
         </p>

        </div>

        <div className="flex items-center gap-1 text-xs font-bold">
         <Star
          size={13}
          fill="#F4D500"
          className="text-[#F4D500]"
         />
         4.9
        </div>

       </div>

      </div>

      {/* YELLOW FLOATING CARD */}
      <div className="absolute bottom-12 left-12 z-20 rounded-2xl bg-[#F4D500] px-5 py-4 shadow-xl sm:left-20">

       <p className="text-xs font-bold uppercase">
        OYA SEND
       </p>

       <p className="mt-1 text-lg font-black">
        We deliver.
       </p>

       <p className="text-sm font-bold">
        You relax.
       </p>

      </div>

     </div>

    </div>

   </section>


   {/* =========================================================
          SERVICES
      ========================================================= */}

   <section
    id="services"
    className="bg-[#FAFCFA] py-20 sm:py-24"
   >

    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">

     <div className="text-center">

      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#08752A]">
       Our services
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
       What can we help you with?
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500">
       From delivering your package to helping you get things
       from the market, OYA SEND is here to make life easier.
      </p>

     </div>


     <div className="mt-12 grid gap-6 md:grid-cols-3">

      {services.map((service) => {
       const Icon = service.icon

       return (
        <Link
         key={service.title}
         to={service.link}
         className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#08752A]/30 hover:shadow-2xl hover:shadow-black/5"
        >

         {/* IMAGE */}
         <div className="relative h-56 overflow-hidden">

          <img
           src={service.image}
           alt={service.title}
           className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#08752A] text-white shadow-lg">
           <Icon size={21} />
          </div>

         </div>

         {/* CONTENT */}
         <div className="p-6">

          <h3 className="text-xl font-black">
           {service.title}
          </h3>

          <p className="mt-3 min-h-[48px] text-sm leading-6 text-gray-500">
           {service.description}
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#08752A]">
           Get started

           <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
           />
          </div>

         </div>

        </Link>
       )
      })}

     </div>

    </div>

   </section>


   {/* =========================================================
          STATS
      ========================================================= */}

   <section className="bg-[#064410]">

    <div className="mx-auto grid max-w-[1400px] divide-y divide-white/10 px-5 py-10 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4 lg:px-12">

     {[
      {
       value: '10,000+',
       label: 'Happy Customers',
       icon: Star,
      },
      {
       value: '25,000+',
       label: 'Deliveries Completed',
       icon: Package,
      },
      {
       value: '10+',
       label: 'Cities Covered',
       icon: MapPin,
      },
      {
       value: '99.5%',
       label: 'On-time Delivery',
       icon: Clock3,
      },
     ].map((stat) => {
      const Icon = stat.icon

      return (
       <div
        key={stat.label}
        className="flex items-center gap-4 px-5 py-5 sm:justify-center lg:py-3"
       >

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#F4D500] text-[#F4D500]">
         <Icon size={22} />
        </div>

        <div>
         <p className="text-2xl font-black text-white">
          {stat.value}
         </p>

         <p className="text-xs font-medium text-white/60">
          {stat.label}
         </p>
        </div>

       </div>
      )
     })}

    </div>

   </section>


   {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

   <section
    id="how-it-works"
    className="relative overflow-hidden bg-white py-20 sm:py-24"
   >

    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">

     <div className="text-center">

      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#08752A]">
       How it works
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
       Simple steps to get things done
      </h2>

     </div>


     {/* STEPS */}
     <div className="relative mt-16 grid gap-12 md:grid-cols-4 md:gap-6">

      {/* connector */}
      <div className="absolute left-[12%] right-[12%] top-6 hidden border-t-2 border-dashed border-[#CFE5CF] md:block" />

      {steps.map((step) => {
       const Icon = step.icon

       return (
        <div
         key={step.number}
         className="relative z-10 text-center"
        >

         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF6EA] text-sm font-black text-[#08752A] ring-8 ring-white">
          {step.number}
         </div>

         <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3FAF3] text-[#08752A]">
          <Icon size={25} />
         </div>

         <h3 className="mt-5 font-black">
          {step.title}
         </h3>

         <p className="mx-auto mt-3 max-w-[230px] text-sm leading-6 text-gray-500">
          {step.description}
         </p>

        </div>
       )
      })}

     </div>

    </div>

   </section>


   {/* =========================================================
          APP / CUSTOMER EXPERIENCE
      ========================================================= */}

   <section className="overflow-hidden bg-[#F5F9F5] py-20">

    <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">

     {/* PHONE MOCKUP */}
     <div className="relative order-2 flex justify-center lg:order-1">

      <div className="relative h-[540px] w-[270px] rounded-[40px] border-[7px] border-[#101717] bg-white shadow-2xl">

       {/* speaker */}
       <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#101717]" />

       <div className="px-5 pt-12">

        <p className="text-[10px] font-medium text-gray-400">
         OYA SEND
        </p>

        <h3 className="mt-1 text-lg font-black">
         Hello, Adeola 👋
        </h3>

        <p className="mt-1 text-[10px] text-gray-400">
         What would you like to do?
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">

         {[
          {
           icon: Package,
           title: 'Send',
          },
          {
           icon: ShoppingBasket,
           title: 'Market',
          },
          {
           icon: Bike,
           title: 'Ride',
          },
         ].map((item) => {
          const Icon = item.icon

          return (
           <div
            key={item.title}
            className="rounded-xl bg-[#F1F7F1] p-3 text-center"
           >
            <Icon
             size={18}
             className="mx-auto text-[#08752A]"
            />

            <p className="mt-2 text-[8px] font-bold">
             {item.title}
            </p>
           </div>
          )
         })}

        </div>

        <div className="mt-7 flex items-center justify-between">
         <p className="text-xs font-black">
          Recent Orders
         </p>

         <p className="text-[9px] font-bold text-[#08752A]">
          View all
         </p>
        </div>

        <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">

         <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF6EA] text-[#08752A]">
           <Package size={17} />
          </div>

          <div className="flex-1">

           <p className="text-[10px] font-black">
            OYA-1024
           </p>

           <p className="text-[8px] text-gray-400">
            Oja Oke → City Centre
           </p>

          </div>

          <span className="rounded-full bg-[#EAF6EA] px-2 py-1 text-[7px] font-bold text-[#08752A]">
           In Transit
          </span>

         </div>

        </div>

       </div>

       <div className="absolute bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-black" />

      </div>

     </div>


     {/* TEXT */}
     <div className="order-1 lg:order-2">

      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#08752A]">
       Your OYA SEND experience
      </p>

      <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
       Everything you need,
       <span className="block text-[#08752A]">
        right in one place.
       </span>
      </h2>

      <p className="mt-5 max-w-lg leading-7 text-gray-500">
       Create orders, make payments, monitor your delivery and
       confirm when everything has been completed — without
       having to chase people around on WhatsApp.
      </p>

      <div className="mt-8 space-y-5">

       {benefits.map((benefit) => {
        const Icon = benefit.icon

        return (
         <div
          key={benefit.title}
          className="flex gap-4"
         >

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF6EA] text-[#08752A]">
           <Icon size={20} />
          </div>

          <div>

           <h3 className="font-black">
            {benefit.title}
           </h3>

           <p className="mt-1 text-sm leading-6 text-gray-500">
            {benefit.text}
           </p>

          </div>

         </div>
        )
       })}

      </div>

      <Link
       to="/register"
       className="mt-9 inline-flex items-center gap-2 rounded-xl TTW bg-[#08752A] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#064410]"
      >
       Create your account
       <ArrowRight size={17} />
      </Link>

     </div>

    </div>

   </section>


   {/* =========================================================
          TRUST / TESTIMONIAL CTA
      ========================================================= */}

   <section className="bg-white py-20">

    <div className="mx-auto max-w-5xl px-5 text-center">

     <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6EA] text-[#08752A]">
      <ShieldCheck size={27} />
     </div>

     <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#08752A]">
      We’ve got you covered
     </p>

     <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
      Your errands deserve a service you can trust.
     </h2>

     <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-500">
      From the moment you place your request until your order
      reaches you, OYA SEND keeps you informed.
     </p>

     <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

      <Link
       to="/register"
       className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#08752A] TTW px-7 py-4 text-sm font-bold text-white"
      >
       Get Started
       <ArrowRight size={18} />
      </Link>

      <a
       href="https://wa.me/2348032517780"
       target="_blank"
       rel="noreferrer"
       className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-7 py-4 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
      >
       <Phone size={17} />
       Talk to us
      </a>

     </div>

    </div>

   </section>


   {/* =========================================================
          FOOTER
      ========================================================= */}

   <footer
    id="footer"
    className="bg-[#063A12] text-white"
   >

    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12">

     <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">

      {/* BRAND */}
      <div>

       <Link
        to="/"
        className="flex items-center gap-2"
       >

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4D500] font-black text-[#06121B]">
         O
        </div>

        <span className="text-xl font-black">
         OYA<span className="text-[#F4D500]">SEND</span>
        </span>

       </Link>

       <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
        We run errands so you don’t stress.
        Fast, reliable and convenient.
       </p>

       <div className="mt-6 flex gap-2">

        <div className="flex gap-2">

         <a
          href="#"
          aria-label="Facebook"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#F4D500] hover:text-[#06121B]"
         >
          f
         </a>

         <a
          href="#"
          aria-label="Twitter"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#F4D500] hover:text-[#06121B]"
         >
          𝕏
         </a>

         <a
          href="#"
          aria-label="Instagram"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#F4D500] hover:text-[#06121B]"
         >
          ◎
         </a>

        </div>

       </div>

      </div>


      {/* COMPANY */}
      <div>

       <h3 className="font-black">
        Company
       </h3>

       <div className="mt-5 space-y-3 text-sm text-white/55">

        <a
         href="#"
         className="block hover:text-white"
        >
         About Us
        </a>

        <a
         href="#"
         className="block hover:text-white"
        >
         Careers
        </a>

        <a
         href="#"
         className="block hover:text-white"
        >
         Blog
        </a>

        <a
         href="#"
         className="block hover:text-white"
        >
         Contact Us
        </a>

       </div>

      </div>


      {/* SUPPORT */}
      <div>

       <h3 className="font-black">
        Support
       </h3>

       <div className="mt-5 space-y-3 text-sm text-white/55">

        <a
         href="#"
         className="block hover:text-white"
        >
         Help Center
        </a>

        <a
         href="#"
         className="block hover:text-white"
        >
         Terms of Service
        </a>

        <a
         href="#"
         className="block hover:text-white"
        >
         Privacy Policy
        </a>

        <a
         href="#"
         className="block hover:text-white"
        >
         Refund Policy
        </a>

       </div>

      </div>


      {/* NEWSLETTER */}
      <div>

       <h3 className="font-black">
        Stay updated
       </h3>

       <p className="mt-4 text-sm leading-6 text-white/55">
        Get updates, offers and useful information from OYA SEND.
       </p>

       <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-5 flex overflow-hidden rounded-xl bg-white"
       >

        <input
         type="email"
         placeholder="Enter your email"
         className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none"
        />

        <button
         type="submit"
         className="bg-[#08752A] px-5 text-sm font-bold text-white"
        >
         Subscribe
        </button>

       </form>

      </div>

     </div>


     {/* BOTTOM */}
     <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/35">
      © {new Date().getFullYear()} OYA SEND. All rights reserved.
     </div>

    </div>

   </footer>

  </div>
 )
}

export default Home