"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play, Square, Shield } from "lucide-react"

interface Quiz {
  id: string
  title: string
  description: string | null
  is_active: boolean
  created_at: string
}

interface Question {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer: number
  points: number
}

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")

  // Question form state
  const [questionText, setQuestionText] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [points, setPoints] = useState(1)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz.id)
    }
  }, [selectedQuiz])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes || [])
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    }
  }

  const fetchQuestions = async (quizId: string) => {
    try {
      const response = await fetch(`/api/questions?quiz_id=${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  const createQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDescription,
        }),
      })

      if (response.ok) {
        setQuizTitle("")
        setQuizDescription("")
        fetchQuizzes()
        alert("Quiz created successfully!")
      } else {
        const error = await response.json()
        alert("Error creating quiz: " + error.error)
      }
    } catch (error) {
      alert("Error creating quiz")
    }
    setLoading(false)
  }

  const toggleQuizStatus = async (quiz: Quiz) => {
    try {
      const response = await fetch("/api/quizzes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quiz.id,
          is_active: !quiz.is_active,
        }),
      })

      if (response.ok) {
        fetchQuizzes()
      } else {
        const error = await response.json()
        alert("Error updating quiz status: " + error.error)
      }
    } catch (error) {
      alert("Error updating quiz status")
    }
  }

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return

    try {
      const response = await fetch(`/api/quizzes?id=${quizId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchQuizzes()
        if (selectedQuiz?.id === quizId) {
          setSelectedQuiz(null)
          setQuestions([])
        }
      } else {
        const error = await response.json()
        alert("Error deleting quiz: " + error.error)
      }
    } catch (error) {
      alert("Error deleting quiz")
    }
  }

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedQuiz) return

    setLoading(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: selectedQuiz.id,
          question_text: questionText,
          options: options,
          correct_answer: correctAnswer,
          points: points,
        }),
      })

      if (response.ok) {
        setQuestionText("")
        setOptions(["", "", "", ""])
        setCorrectAnswer(0)
        setPoints(1)
        fetchQuestions(selectedQuiz.id)
        alert("Question added successfully!")
      } else {
        const error = await response.json()
        alert("Error adding question: " + error.error)
      }
    } catch (error) {
      alert("Error adding question")
    }
    setLoading(false)
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      const response = await fetch(`/api/questions?id=${questionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        if (selectedQuiz) {
          fetchQuestions(selectedQuiz.id)
        }
      } else {
        const error = await response.json()
        alert("Error deleting question: " + error.error)
      }
    } catch (error) {
      alert("Error deleting question")
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-hudl-blue" />
        <h1 className="text-3xl font-bold text-hudl-blue">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="bg-hudl-blue-lighter">
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-hudl-blue data-[state=active]:text-white">
            Manage Quizzes
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-hudl-blue data-[state=active]:text-white">
            Manage Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="space-y-6">
          <Card className="hudl-card">
            <CardHeader>
              <CardTitle>Create New Quiz</CardTitle>
              <CardDescription>Add a new quiz to your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createQuiz} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input id="title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading} className="hudl-button">
                  {loading ? "Creating..." : "Create Quiz"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="hudl-card">
            <CardHeader>
              <CardTitle>Your Quizzes</CardTitle>
              <CardDescription>Manage your existing quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">{quiz.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={quiz.is_active ? "default" : "secondary"}
                          className={quiz.is_active ? "bg-hudl-blue" : ""}
                        >
                          {quiz.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedQuiz(quiz)}>
                        Edit Questions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleQuizStatus(quiz)}
                        className="border-hudl-blue text-hudl-blue hover:bg-hudl-blue hover:text-white"
                      >
                        {quiz.is_active ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteQuiz(quiz.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {selectedQuiz ? (
            <>
              <Card className="hudl-card">
                <CardHeader>
                  <CardTitle>Add Question to: {selectedQuiz.title}</CardTitle>
                  <CardDescription>Create a new question for this quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addQuestion} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...options]
                              newOptions[index] = e.target.value
                              setOptions(newOptions)
                            }}
                            placeholder={`Option ${index + 1}`}
                            required
                          />
                          <Button
                            type="button"
                            variant={correctAnswer === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCorrectAnswer(index)}
                          >
                            {correctAnswer === index ? "Correct" : "Mark Correct"}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        value={points}
                        onChange={(e) => setPoints(Number.parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="hudl-button">
                      {loading ? "Adding..." : "Add Question"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="hudl-card">
                <CardHeader>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <CardDescription>Manage questions for this quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              Q{index + 1}: {question.question_text}
                            </h4>
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`text-sm p-2 rounded ${
                                    optIndex === question.correct_answer ? "bg-green-100 text-green-800" : "bg-gray-50"
                                  }`}
                                >
                                  {optIndex + 1}. {option}
                                  {optIndex === question.correct_answer && " ✓"}
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Points: {question.points}</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => deleteQuestion(question.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="hudl-card">
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Select a quiz from the "Manage Quizzes" tab to add questions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
