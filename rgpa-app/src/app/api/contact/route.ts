import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Rate limiting: IP -> timestamps
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes
const RATE_LIMIT_MAX = 3 // max 3 submissions per window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []

  // Clean old timestamps
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)
  rateLimitMap.set(ip, recent)

  if (recent.length >= RATE_LIMIT_MAX) return true

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, phone, subject, message, honeypot } = body

    // Honeypot check — if filled, silently succeed (bot trap)
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabase.from("messages").insert({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: "unread",
    })

    if (dbError) {
      console.error("DB insert error:", dbError)
      return NextResponse.json(
        { error: "Failed to save message. Please try again." },
        { status: 500 }
      )
    }

    // Send email notification
    try {
      await resend.emails.send({
        from: "REVIFI Contact Form <info@revifi.com>",
        to: ["kcstitak@gmail.com", "kl335704@gmail.com", "info@revifi.com"],
        subject: `New Contact Form: ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">New Contact Form Submission</h2>
            <hr style="border: none; border-top: 1px solid #e5e5e5;" />
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Name:</strong></td>
                <td style="padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0;">${subject}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e5e5;" />
            <h3 style="color: #1a1a1a;">Message:</h3>
            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5;" />
            <p style="color: #999; font-size: 12px;">This message was sent from the REVIFI contact form.</p>
          </div>
        `,
      })
    } catch (emailError) {
      // Log but don't fail — message is already saved
      console.error("Email send error:", emailError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact API error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
