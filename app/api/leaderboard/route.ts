import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get("quiz_id")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 })
    }

    const leaderboard = await sql`
      SELECT 
        l.*,
        q.title as quiz_title,
        RANK() OVER (ORDER BY l.score DESC, l.completed_at ASC) as rank,
        ROUND((l.score::DECIMAL / l.total_points::DECIMAL) * 100, 2) as calculated_percentage
      FROM quiz_leaderboard l
      JOIN quizzes q ON q.id = l.quiz_id
      WHERE l.quiz_id = ${quizId}
      ORDER BY l.score DESC, l.completed_at ASC
      LIMIT ${limit}
    `

    // Ensure percentage is a number
    const formattedLeaderboard = leaderboard.map((entry) => ({
      ...entry,
      percentage: entry.calculated_percentage || (entry.score / entry.total_points) * 100,
    }))

    return NextResponse.json({ leaderboard: formattedLeaderboard })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
