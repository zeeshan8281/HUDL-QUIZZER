import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, isAdmin } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await AuthService.findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user (admin requests are created as regular users initially)
    const user = await AuthService.createUser({
      email,
      full_name: fullName,
      auth_provider: "email",
      is_admin: false, // Always create as regular user first
    })

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

    if (isAdmin) {
      return NextResponse.json({
        user,
        message: "Account created successfully! Admin access requires approval from an existing administrator.",
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Email signup error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
