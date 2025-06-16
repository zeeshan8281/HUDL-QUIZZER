import { sql } from "./neon"
import type { User } from "./neon"
import { cookies } from "next/headers"

export class AuthService {
  private static SESSION_COOKIE = "hudl_session"
  private static SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

  static async createSession(userId: string): Promise<string> {
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION)

    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
    `

    return sessionToken
  }

  static async getSessionUser(sessionToken?: string): Promise<User | null> {
    if (!sessionToken) return null

    const sessions = await sql`
      SELECT u.*, s.expires_at
      FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_token = ${sessionToken}
      AND s.expires_at > NOW()
    `

    return sessions[0] || null
  }

  static async getCurrentUser(): Promise<User | null> {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(this.SESSION_COOKIE)?.value
    return this.getSessionUser(sessionToken)
  }

  static async createUser(data: {
    email?: string
    wallet_address?: string
    discord_id?: string
    full_name?: string
    avatar_url?: string
    auth_provider: "email" | "wallet" | "discord"
    is_admin?: boolean
  }): Promise<User> {
    const users = await sql`
      INSERT INTO users (email, wallet_address, discord_id, full_name, avatar_url, auth_provider, is_admin)
      VALUES (${data.email}, ${data.wallet_address}, ${data.discord_id}, ${data.full_name}, ${data.avatar_url}, ${data.auth_provider}, ${data.is_admin || false})
      RETURNING *
    `

    return users[0]
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return users[0] || null
  }

  static async findUserByWallet(walletAddress: string): Promise<User | null> {
    const users = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `
    return users[0] || null
  }

  static async findUserByDiscord(discordId: string): Promise<User | null> {
    const users = await sql`
      SELECT * FROM users WHERE discord_id = ${discordId}
    `
    return users[0] || null
  }

  static async promoteToAdmin(userId: string): Promise<void> {
    await sql`
      UPDATE users 
      SET is_admin = true, updated_at = NOW()
      WHERE id = ${userId}
    `
  }

  static async deleteSession(sessionToken: string): Promise<void> {
    await sql`
      DELETE FROM user_sessions WHERE session_token = ${sessionToken}
    `
  }

  static async cleanupExpiredSessions(): Promise<void> {
    await sql`
      DELETE FROM user_sessions WHERE expires_at < NOW()
    `
  }
}
