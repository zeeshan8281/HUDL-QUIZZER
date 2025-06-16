import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get("quiz_id")

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 })
    }

    const questions = await sql`
      SELECT * FROM questions 
      WHERE quiz_id = ${quizId}
      ORDER BY created_at ASC
    `

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quiz_id, question_text, options, correct_answer, points } = await request.json()

    if (!quiz_id || !question_text || !options || correct_answer === undefined || !points) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO questions (quiz_id, question_text, options, correct_answer, points)
      VALUES (${quiz_id}, ${question_text}, ${JSON.stringify(options)}, ${correct_answer}, ${points})
      RETURNING *
    `

    return NextResponse.json({ question: result[0] })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM questions WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
