import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attempts = await sql`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ${user.id}
      ORDER BY completed_at DESC
    `

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("Error fetching quiz attempts:", error)
    return NextResponse.json({ error: "Failed to fetch quiz attempts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quiz_id, answers, score, total_points } = await request.json()

    if (!quiz_id || !answers || score === undefined || total_points === undefined) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already attempted this quiz
    const existingAttempt = await sql`
      SELECT id FROM quiz_attempts 
      WHERE quiz_id = ${quiz_id} AND user_id = ${user.id}
    `

    if (existingAttempt.length > 0) {
      // Update existing attempt
      const result = await sql`
        UPDATE quiz_attempts 
        SET answers = ${JSON.stringify(answers)}, score = ${score}, total_points = ${total_points}, completed_at = NOW()
        WHERE quiz_id = ${quiz_id} AND user_id = ${user.id}
        RETURNING *
      `
      return NextResponse.json({ attempt: result[0] })
    } else {
      // Create new attempt
      const result = await sql`
        INSERT INTO quiz_attempts (quiz_id, user_id, answers, score, total_points)
        VALUES (${quiz_id}, ${user.id}, ${JSON.stringify(answers)}, ${score}, ${total_points})
        RETURNING *
      `
      return NextResponse.json({ attempt: result[0] })
    }
  } catch (error) {
    console.error("Error saving quiz attempt:", error)
    return NextResponse.json({ error: "Failed to save quiz attempt" }, { status: 500 })
  }
}
