import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, name, date } = await req.json()

  // ✅ Fix name (First letter capital)
  const cleanName =
    name?.trim().charAt(0).toUpperCase() +
    name?.trim().slice(1).toLowerCase()

  // ✅ Format date → dd/mm/yyyy
  const d = new Date(date)

  const formattedDate = `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`

  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        email_subject: "Curator Assignment Cancelled ❌",
        email_body: `
          <h2>Hey ${cleanName},</h2>
          <p>Your curator assignment for <b>${formattedDate}</b> has been cancelled.</p>
        `,
        include_email_tokens: [email],
      }),
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: "Email failed" }, { status: 500 })
  }
}