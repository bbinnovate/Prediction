import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getRandomCurator } from "@/lib/getRandomCurator"

export const assignCurator = async () => {
  const now = new Date()

  const istNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  )

  const current = istNow.getHours() * 60 + istNow.getMinutes()
  const assignTime = 18 * 60 // 6 PM IST

  if (current < assignTime) return

const t = new Date(istNow)
t.setDate(t.getDate() + 1)

// skip weekend
while (t.getDay() === 0 || t.getDay() === 6) {
  t.setDate(t.getDate() + 1)
}

const dateStr = t.toISOString().split("T")[0]

  const exists = await getDoc(doc(db, "dailyCurator", dateStr))
  if (exists.exists()) return

  const user: any = await getRandomCurator()
  if (!user) return

  await setDoc(doc(db, "dailyCurator", dateStr), {
    curatorId: user.id,
    name: user.name || "Anonymous",
    email: user.email || "",
    assignedAt: new Date().toISOString(),
  })

  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-curator-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      name: user.name,
      assignDate: dateStr,
    }),
  })
}