"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Button from "../components/Button"

export default function ForgotPin(){

 const router = useRouter()

 const [email,setEmail] = useState("")
 const [error,setError] = useState("")
 const [success,setSuccess] = useState("")
 const [loading,setLoading] = useState(false)

 const recover = async () => {

  if(!email){
   setError("Enter your email")
   return
  }

  setLoading(true)
  setError("")
  setSuccess("")

  try{

   const q = query(collection(db,"users"), where("email","==",email))
   const snap = await getDocs(q)

   if(snap.empty){
    setError("Email does not exist")
    setLoading(false)
    return
   }

   const user = snap.docs[0]
   const data:any = user.data()

   const res = await fetch("/api/send-pin-email",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
     email:data.email,
     name:data.name,
     pin:data.pin
    })
   })

   if(!res.ok){
    throw new Error("Email failed")
   }

   setSuccess("PIN sent to your email. Redirecting to login...")

   // redirect after 2 seconds
   setTimeout(()=>{
    router.push("/login")
   },2000)

  }
  catch(err){
   console.error(err)
   setError("Something went wrong")
  }

  finally{
   setLoading(false)
  }

 }

 return(

 <div className="container lg:py-20 md:py-15 py-10 flex items-center justify-center min-h-screen">

  <div className="relative bg-black lg:p-10 p-6 shadow-md w-96 space-y-4 overflow-hidden rounded-[20px]">

   <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-5 h-full bg-[#FAB31E]"></div>

   <h3 className="text-xl font-semibold white-text text-center">
    Recover Your PIN
   </h3>

   {error && <p className="text-red-500 text-center text-sm">{error}</p>}
   {success && <p className="text-green-500 text-center text-sm">{success}</p>}

   <input
    type="email"
    value={email}
    onChange={(e)=>setEmail(e.target.value)}
    placeholder="Enter your email"
    className="w-full border p-2 rounded white-text bg-black"
   />

   <Button
    onClick={recover}
    disabled={loading}
    className="white-text"
    text={loading ? "Sending..." : "Send PIN"}
   />

  </div>

 </div>

 )
}