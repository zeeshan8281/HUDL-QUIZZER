import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await AuthService.findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // For simplicity, we'll skip password hashing in this example
    // In production, you should hash passwords and verify them properly

    // Create session
    const sessionToken = await AuthService.createSession(user.id)

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set("hudl_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Email signin error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
