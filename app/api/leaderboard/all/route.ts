import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    // Get top performers across all quizzes
    const allTimeLeaders = await sql`
      SELECT 
        l.user_name,
        l.wallet_address,
        q.title as quiz_title,
        l.score,
        l.total_points,
        l.completed_at,
        ROUND((l.score::DECIMAL / l.total_points::DECIMAL) * 100, 2) as calculated_percentage,
        RANK() OVER (PARTITION BY l.quiz_id ORDER BY l.score DESC, l.completed_at ASC) as quiz_rank
      FROM quiz_leaderboard l
      JOIN quizzes q ON q.id = l.quiz_id
      WHERE q.is_active = true
      ORDER BY calculated_percentage DESC, l.score DESC, l.completed_at ASC
      LIMIT ${limit * 3}
    `

    // Get quiz-wise top performers
    const quizLeaders = await sql`
      SELECT DISTINCT ON (l.quiz_id)
        l.quiz_id,
        l.user_name,
        l.wallet_address,
        q.title as quiz_title,
        l.score,
        l.total_points,
        l.completed_at,
        ROUND((l.score::DECIMAL / l.total_points::DECIMAL) * 100, 2) as calculated_percentage
      FROM quiz_leaderboard l
      JOIN quizzes q ON q.id = l.quiz_id
      WHERE q.is_active = true
      ORDER BY l.quiz_id, l.score DESC, l.completed_at ASC
    `

    // Format the data to ensure percentage is a number
    const formattedAllTimeLeaders = allTimeLeaders.slice(0, limit).map((entry) => ({
      ...entry,
      percentage: entry.calculated_percentage || (entry.score / entry.total_points) * 100,
    }))

    const formattedQuizLeaders = quizLeaders.map((entry) => ({
      ...entry,
      percentage: entry.calculated_percentage || (entry.score / entry.total_points) * 100,
    }))

    return NextResponse.json({
      allTimeLeaders: formattedAllTimeLeaders,
      quizLeaders: formattedQuizLeaders,
    })
  } catch (error) {
    console.error("Error fetching all leaderboards:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboards" }, { status: 500 })
  }
}
