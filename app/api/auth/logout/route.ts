import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("hudl_session")?.value

    if (sessionToken) {
      await AuthService.deleteSession(sessionToken)
    }

    // Clear cookie
    cookieStore.delete("hudl_session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
