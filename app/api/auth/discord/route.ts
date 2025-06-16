import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { DiscordService } from "@/lib/discord"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
    }

    // Exchange code for access token
    const tokenData = await DiscordService.exchangeCodeForToken(code)

    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Failed to get access token" }, { status: 400 })
    }

    // Get user info from Discord
    const discordUser = await DiscordService.getUserInfo(tokenData.access_token)

    // Check if user exists
    let user = await AuthService.findUserByDiscord(discordUser.id)

    if (!user) {
      // Create new user
      user = await AuthService.createUser({
        discord_id: discordUser.id,
        email: discordUser.email,
        full_name: discordUser.username,
        avatar_url: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : undefined,
        auth_provider: "discord",
      })
    }

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
    console.error("Discord auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
