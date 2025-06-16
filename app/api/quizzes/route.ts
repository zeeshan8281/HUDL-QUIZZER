import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    let quizzes
    if (active === "true") {
      quizzes = await sql`SELECT * FROM quizzes WHERE is_active = true ORDER BY created_at DESC`
    } else {
      quizzes = await sql`SELECT * FROM quizzes ORDER BY created_at DESC`
    }

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO quizzes (title, description, created_by)
      VALUES (${title}, ${description}, ${user.id})
      RETURNING *
    `

    return NextResponse.json({ quiz: result[0] })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, is_active } = await request.json()

    const result = await sql`
      UPDATE quizzes 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ quiz: result[0] })
  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 })
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
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM quizzes WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
