"use client"

import { db, auth } from "@/lib/firebase"
import {
 doc,
 getDoc,
 setDoc,
 updateDoc,
 increment
} from "firebase/firestore"

import { useEffect,useState } from "react"
import { calculateScore } from "@/lib/calculateScore"

export default function Vote(){

 const [questions,setQuestions]=useState<any>(null)
 const [answers,setAnswers]=useState<any>({})

 const today=new Date().toISOString().split("T")[0]

 useEffect(()=>{

  async function load(){
   const snap=await getDoc(doc(db,"questions",today))
   setQuestions(snap.data())
  }

  load()

 },[])


 const submit = async () => {

  const user = auth.currentUser
  if(!user){
   alert("Login first")
   return
  }

  // save votes
  await setDoc(doc(db,"votes",today,user.uid),answers)

  // load questions again to check correct answers
  const snap = await getDoc(doc(db,"questions",today))
  const data:any = snap.data()

  if(!data) return

  const correctAnswers:any = {}

  Object.keys(data).forEach(q=>{
   if(data[q].correctAnswer !== null){
    correctAnswers[q] = data[q].correctAnswer
   }
  })

  // if curator already added answers → calculate score
  if(Object.keys(correctAnswers).length === 5){

   const score = calculateScore(answers,correctAnswers)

   if(score>0){
    await updateDoc(doc(db,"users",user.uid),{
     score:increment(score)
    })
   }

  }

  alert("Answers submitted")

 }


 if(!questions) return <div className="p-10">Loading</div>

 return(
  <div className="p-10">

  {Object.entries(questions).map(([key,q]:any)=>(
   <div key={key} className="mb-6">

    <p className="mb-2">{q.text}</p>

    <button
     className="bg-green-400 px-4 py-2 mr-2"
     onClick={()=>setAnswers({...answers,[key]:"yes"})}
    >
     YES
    </button>

    <button
     className="bg-red-400 px-4 py-2"
     onClick={()=>setAnswers({...answers,[key]:"no"})}
    >
     NO
    </button>

   </div>
  ))}

  <button
   onClick={submit}
   className="bg-yellow-400 px-6 py-2"
  >
   Submit
  </button>

  </div>
 )
}