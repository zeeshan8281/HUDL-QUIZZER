"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, Trophy } from "lucide-react"
import Leaderboard from "./leaderboard"
import GlobalLeaderboard from "./global-leaderboard"

interface Quiz {
  id: string
  title: string
  description: string | null
  is_active: boolean
}

interface Question {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer: number
  points: number
}

interface QuizAttempt {
  id: string
  quiz_id: string
  score: number
  total_points: number
  completed_at: string
}

export default function QuizInterface() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    fetchActiveQuizzes()
    fetchUserAttempts()
  }, [])

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz.id)
    }
  }, [selectedQuiz])

  const fetchActiveQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes?active=true")
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
        setTotalPoints(data.questions?.reduce((sum: number, q: Question) => sum + q.points, 0) || 0)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  const fetchUserAttempts = async () => {
    try {
      const response = await fetch("/api/quiz-attempts")
      if (response.ok) {
        const data = await response.json()
        setUserAttempts(data.attempts || [])
      }
    } catch (error) {
      console.error("Error fetching attempts:", error)
    }
  }

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setQuizCompleted(false)
    setScore(0)
    setShowLeaderboard(false)
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const submitQuiz = async () => {
    if (!selectedQuiz) return

    setLoading(true)

    // Calculate score
    let calculatedScore = 0
    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        calculatedScore += question.points
      }
    })

    try {
      const response = await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: selectedQuiz.id,
          answers: answers,
          score: calculatedScore,
          total_points: totalPoints,
        }),
      })

      if (response.ok) {
        setScore(calculatedScore)
        setQuizCompleted(true)
        fetchUserAttempts()
      } else {
        const error = await response.json()
        alert("Error submitting quiz: " + error.error)
      }
    } catch (error) {
      alert("Error submitting quiz")
    }

    setLoading(false)
  }

  const hasAttempted = (quizId: string) => {
    return userAttempts.some((attempt) => attempt.quiz_id === quizId)
  }

  const viewLeaderboard = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setShowLeaderboard(true)
    setQuizCompleted(false)
  }

  if (showLeaderboard && selectedQuiz) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowLeaderboard(false)
              setSelectedQuiz(null)
            }}
            className="mb-4"
          >
            ← Back to Quizzes
          </Button>
        </div>
        <Leaderboard quizId={selectedQuiz.id} quizTitle={selectedQuiz.title} limit={20} />
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="hudl-card">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-hudl-blue mx-auto mb-4" />
            <CardTitle className="text-hudl-blue">Quiz Completed!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-hudl-blue">
              {score} / {totalPoints}
            </div>
            <p className="text-lg">You scored {Math.round((score / totalPoints) * 100)}%</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setSelectedQuiz(null)
                  setQuizCompleted(false)
                  setCurrentQuestionIndex(0)
                  setAnswers({})
                }}
                className="hudl-button"
              >
                Back to Quizzes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQuizCompleted(false)
                  setShowLeaderboard(true)
                }}
                className="border-hudl-blue text-hudl-blue hover:bg-hudl-blue hover:text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedQuiz && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{selectedQuiz.title}</h1>
            <Badge variant="outline">
              {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
          <div className="w-full bg-hudl-blue-lighter rounded-full h-3">
            <div
              className="bg-hudl-blue h-3 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="hudl-card">
          <CardHeader>
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
            <CardDescription>{currentQuestion.question_text}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, Number.parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={submitQuiz}
                  disabled={loading || Object.keys(answers).length !== questions.length}
                  className="hudl-button"
                >
                  {loading ? "Submitting..." : "Submit Quiz"}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={answers[currentQuestion.id] === undefined}
                  className="hudl-button"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="bg-hudl-blue-lighter mb-6">
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-hudl-blue data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Available Quizzes
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-hudl-blue data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" />
            Global Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="space-y-6">
          {userAttempts.length > 0 && (
            <Card className="hudl-card">
              <CardHeader>
                <CardTitle>Your Previous Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userAttempts.slice(0, 5).map((attempt) => {
                    const quiz = quizzes.find((q) => q.id === attempt.quiz_id)
                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{quiz?.title || "Unknown Quiz"}</span>
                        <Badge variant="secondary">
                          {attempt.score}/{attempt.total_points} (
                          {Math.round((attempt.score / attempt.total_points) * 100)}
                          %)
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hudl-card">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant={quiz.is_active ? "default" : "secondary"}
                      className={quiz.is_active ? "bg-hudl-blue" : ""}
                    >
                      {quiz.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {hasAttempted(quiz.id) && <Badge variant="outline">Completed</Badge>}
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full hudl-button" onClick={() => startQuiz(quiz)} disabled={!quiz.is_active}>
                      {hasAttempted(quiz.id) ? "Retake Quiz" : "Start Quiz"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-hudl-blue text-hudl-blue hover:bg-hudl-blue hover:text-white"
                      onClick={() => viewLeaderboard(quiz)}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      View Leaderboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {quizzes.length === 0 && (
            <Card className="hudl-card">
              <CardContent className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active quizzes available at the moment.</p>
                <p className="text-sm text-gray-500">Check back later or contact your administrator.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <GlobalLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
