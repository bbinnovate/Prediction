import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { NextResponse } from "next/server"
import { assignCurator } from "@/lib/assignCurator"

type CuratorUser = {
  id: string
  name?: string
  email?: string
}

export async function GET() {
  await assignCurator()
  return NextResponse.json({ ok: true })
}

export async function POST() {
  await assignCurator()
  return NextResponse.json({ ok: true })
}


export const getRandomCurator = async (): Promise<CuratorUser | null> => {
  const usersSnap = await getDocs(collection(db, "users"))
  const curatorsSnap = await getDocs(collection(db, "dailyCurator"))

  const users: CuratorUser[] = usersSnap.docs.map(d => ({
    id: d.id,
    ...(d.data() as Omit<CuratorUser, "id">),
  }))

  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const usedUserIds = curatorsSnap.docs
    .filter(d => new Date(d.id) >= last30Days)
    .map(d => d.data().curatorId)

  const availableUsers = users.filter(u => !usedUserIds.includes(u.id))

  const pool = availableUsers.length > 0 ? availableUsers : users

  if (pool.length === 0) return null

  return pool[Math.floor(Math.random() * pool.length)]
}