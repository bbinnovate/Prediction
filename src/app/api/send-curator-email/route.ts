import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const { email, name, assignDate } = await req.json()

  const d = new Date(assignDate)

  // format assigned date
  const formattedDate = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getFullYear()).slice(-2)}`

  // previous day
  const prev = new Date(d)
  prev.setDate(prev.getDate() - 1)

  const prevFormatted = `${String(prev.getDate()).padStart(2, "0")}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getFullYear()).slice(-2)}`

  try {

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,

        email_subject: "Your turn to add a question 🎯",

        email_body: `
<h2>Hey ${name},</h2>

<p>You have been assigned as the curator for <b>${formattedDate}</b>.</p>

<p>Please add your question before:</p>
<h3>${prevFormatted} 6:00 PM</h3>


<a href="https://prediction-pearl-chi.vercel.app/curator"
style="
display:inline-block;
padding:12px 24px;
background:#fab31e;
color:black;
text-decoration:none;
border-radius:20px;
font-weight:600;
">
Go To Curator Page
</a>
`,

        include_email_tokens: [email],
      }),
    })

    const data = await res.json()

    return NextResponse.json(data)

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { error: "Email failed" },
      { status: 500 }
    )
  }
}