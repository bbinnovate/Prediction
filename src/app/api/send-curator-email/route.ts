import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const { email, name } = await req.json()

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
        <h2>Hey ${name}</h2>

        <p>Today is your turn to add a question.</p>

        <p>Please click the button below to open the curator page.</p>

        <a href="https://yourdomain.com/curator"
           style="
             display:inline-block;
             padding:12px 24px;
             background:#facc15;
             color:black;
             text-decoration:none;
             border-radius:6px;
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