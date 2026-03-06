"use client"

import { useEffect,useState } from "react"
import { collection,getDocs,updateDoc,doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function SetAnswer(){

 const [questions,setQuestions]=useState<any[]>([])

 useEffect(()=>{

 const load=async()=>{

 const snap=await getDocs(collection(db,"questions"))

 const data=snap.docs.map(d=>({
  id:d.id,
  ...d.data()
 }))

 setQuestions(data)

 }

 load()

 },[])

 const setAnswer=async(id:string,ans:string)=>{

 await updateDoc(doc(db,"questions",id),{
  correctAnswer:ans
 })

 alert("Answer saved")

 }

 return(

 <div className="p-10">

 <h1 className="text-2xl font-bold mb-6">Set Correct Answers</h1>

 {questions.map(q=>(

  <div key={q.id} className="mb-6">

   <p>{q.question}</p>

   <button onClick={()=>setAnswer(q.id,"yes")} className="mr-3">
    Yes
   </button>

   <button onClick={()=>setAnswer(q.id,"no")}>
    No
   </button>

  </div>

 ))}

 </div>

 )
}