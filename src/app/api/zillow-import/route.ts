import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !url.includes("zillow.com")) {
      return NextResponse.json({ error: "Please provide a valid Zillow URL" }, { status: 400 })
    }

    // Call the Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/zillow-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ url }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Import failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Zillow import error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to import property" },
      { status: 500 }
    )
  }
}

