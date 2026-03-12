import { NextResponse } from "next/server"

export async function POST(req: Request) {

    const { email, name, pin } = await req.json()
    const cleanName =
name?.trim().charAt(0).toUpperCase() + name?.trim().slice(1).toLowerCase()

    try {

        const res = await fetch("https://api.onesignal.com/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify({
                app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,

                email_subject: "Your Login PIN 🔑",

                email_body: `
<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#333">

<h2>Hello ${cleanName},</h2>

<p>You requested to recover your login PIN.</p>

<p>Your PIN is:</p>

<div style="
display:inline-block;
padding:12px 24px;
background:#fab31e;
color:black;
text-decoration:none;
border-radius:20px;
font-weight:600;
">
${pin}
</div>

<p style="margin-top:20px;">
Use this PIN to login to your account. 
<a href="https://prediction-pearl-chi.vercel.app/login"
style="color:#fab31e;text-decoration:underline;">
Login here
</a>
</p>

</div>
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