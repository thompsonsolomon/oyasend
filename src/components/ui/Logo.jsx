import { Bike } from "lucide-react"

function Logo() {
 const BRAND = {
  primary: '#087443',
  dark: '#061A14',
  yellow: '#F4D500',
  background: '#F6F8F6',
}
 return (
  <div
   className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
   style={{ backgroundColor: BRAND.primary }}
  >
   <Bike size={22} />
  </div>)
}

export default Logo