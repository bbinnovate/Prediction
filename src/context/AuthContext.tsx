"use client"

import { createContext,useContext,useEffect,useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged,User } from "firebase/auth"

const AuthContext=createContext<any>(null)

export function AuthProvider({children}:{children:React.ReactNode}){

 const [user,setUser]=useState<User|null>(null)

 useEffect(()=>{
   const unsub=onAuthStateChanged(auth,(u)=>setUser(u))
   return ()=>unsub()
 },[])

 return(
   <AuthContext.Provider value={{user}}>
    {children}
   </AuthContext.Provider>
 )
}

export const useAuth=()=>useContext(AuthContext)