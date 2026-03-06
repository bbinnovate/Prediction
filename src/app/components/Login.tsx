"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react";
import { setCookie } from "cookies-next";
import Button from "../components/Button";

export default function Login(){

 const router = useRouter()
const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 const [email,setEmail] = useState("")
 const [password,setPassword] = useState("")

 const login = async () => {

  try{

   await signInWithEmailAndPassword(
    auth,
    email,
    password
   )

   router.push("/")

  }catch(err:any){
   alert(err.message)
  }

 }


  const handleLogin = async () => {

  setError("")
  setLoading(true)

  try{

   const userCred = await signInWithEmailAndPassword(
    auth,
    email,
    password
   )

   const token = await userCred.user.getIdToken()

   setCookie("firebase-auth", token, {
    path:"/",
    maxAge:60*60*24
   })

   router.push("/")

  }
  catch(err:any){

   console.error(err)

   switch(err.code){

    case "auth/invalid-credential":
     setError("Incorrect email or password")
     break

    case "auth/invalid-email":
     setError("Invalid email format")
     break

    case "auth/user-disabled":
     setError("Account disabled")
     break

    case "auth/too-many-requests":
     setError("Too many attempts. Try later")
     break

    default:
     setError("Login failed")

   }

  }

  finally{
   setLoading(false)
  }

 }

 return(
    

 <div className=" container lg:py-20 md:py-15 py-10 flex items-center justify-center min-h-screen">

  <div className="relative bg-black p-10  shadow-md w-96 space-y-4 overflow-hidden rounded-[20px]">

    {/* Right border */}
    <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-5 h-full bg-[#FAB31E]"></div>

    <h2 className="text-xl font-semibold white-text text-center">Login</h2>
    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

    <input
      type="email"
      value={email}
       onChange={(e)=>setEmail(e.target.value)}
      placeholder="Email"
      required
      className="w-full border p-2 rounded white-text"
    />


   <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
               onChange={(e)=>setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full border p-2 rounded text-white bg-black pr-12"
            />

            <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-80 hover:opacity-100 transition cursor-pointer"
>
  {showPassword ? (
    <EyeOff size={20} />
  ) : (
    <Eye size={20} />
  )}
</button>

          </div>


          <Button
  onClick={handleLogin}
  type="submit"
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

  </div>

 </div>

 )
}