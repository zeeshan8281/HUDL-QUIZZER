import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

export type User = {
  id: string
  email?: string
  wallet_address?: string
  discord_id?: string
  full_name?: string
  avatar_url?: string
  auth_provider: "email" | "wallet" | "discord"
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type Quiz = {
  id: string
  title: string
  description?: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer: number
  points: number
  created_at: string
}

export type QuizAttempt = {
  id: string
  quiz_id: string
  user_id: string
  answers: Record<string, number>
  score: number
  total_points: number
  completed_at: string
}

export type UserSession = {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}
