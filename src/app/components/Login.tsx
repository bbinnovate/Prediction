"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Button from "../components/Button"

export default function Login(){

 const router = useRouter()

 const [pin,setPin] = useState("")
 const [showPin, setShowPin] = useState(false)
 const [error,setError] = useState("")
 const [loading,setLoading] = useState(false)

 const login = async () => {

  if(pin.length !== 4){
   setError("Enter 4 digit PIN")
   return
  }

  setLoading(true)
  setError("")

  try{

   const snap = await getDoc(doc(db,"pinLogin",pin))

   if(!snap.exists()){
    setError("Incorrect PIN")
    setLoading(false)
    return
   }

   const uid = snap.data().uid

   const userSnap = await getDoc(doc(db,"users",uid))

   if(!userSnap.exists()){
    setError("User not found")
    setLoading(false)
    return
   }

   const user = userSnap.data()

   // create session
   localStorage.setItem(
    "pinUser",
    JSON.stringify({
     uid,
     role:user.role || "user",
     name:user.name
    })
   )

   window.dispatchEvent(new Event("pin-login"))

   router.push("/leaderboard")

  }
  catch(err){
   console.error(err)
   setError("Login failed")
  }

  finally{
   setLoading(false)
  }

 }

 return(

 <div className="container lg:py-20 md:py-15 py-10 flex items-center justify-center min-h-screen">

<form
  onSubmit={(e) => {
    e.preventDefault()
    login()
  }}
  className="relative bg-black lg:p-10 p-6 shadow-md w-96 space-y-4 overflow-hidden rounded-[20px]"
>

   <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-5 h-full bg-[#FAB31E]"></div>

   <h3 className="text-xl font-semibold white-text text-center">
    Enter Login PIN
   </h3>

   {error && (
    <p className="text-red-500 text-sm text-center">{error}</p>
   )}

  <div className="relative">
  <input
    type={showPin ? "text" : "password"}
    value={pin}
    onChange={(e)=>setPin(e.target.value)}
    placeholder="4 Digit PIN"
    maxLength={4}
    className="w-full border p-2 rounded white-text bg-black tracking-widest pr-10"
  />

  <button
    type="button"
    onClick={() => setShowPin(!showPin)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-80 hover:opacity-100 transition cursor-pointer"
  >
    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

<p className="text-right mt-1 text-sm">
  <a href="/forgot-pin" className="text-[#FAB31E] underline">
    Forgot PIN?
  </a>
</p>

   <Button
    onClick={login}
    disabled={loading}
    className="white-text"
    text={loading ? "Logging in..." : "Login"}
   />

   <p className="text-center text-white text-sm mt-2">
  Don’t have an account?{" "}
  <a href="/signup" className="text-[#FAB31E] underline">
    Signup
  </a>
</p>

  </form>

 </div>

 )
}