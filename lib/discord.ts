export class DiscordService {
  private static CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1147458900803715142"
  private static REDIRECT_URI =
    process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ||
    (typeof window !== "undefined" ? `${window.location.origin}/auth/discord/callback` : "")
  private static CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET

  static getAuthUrl(): string {
    if (!this.CLIENT_ID) {
      throw new Error("Discord Client ID not configured")
    }

    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: "code",
      scope: "identify email",
      prompt: "consent", // Force consent screen to ensure fresh tokens
    })

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(code: string): Promise<any> {
    const clientId = this.CLIENT_ID
    const clientSecret = this.CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error("Discord credentials not configured")
    }

    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: this.REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Discord token exchange failed: ${error}`)
    }

    return response.json()
  }

  static async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Discord user info fetch failed: ${error}`)
    }

    return response.json()
  }
}
