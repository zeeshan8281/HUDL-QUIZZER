"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Wallet, User, Crown } from "lucide-react"

interface LeaderboardEntry {
  user_name: string
  wallet_address?: string
  quiz_title: string
  score: number
  total_points: number
  percentage: number | string
  completed_at: string
  quiz_rank?: number
}

export default function GlobalLeaderboard() {
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderboardEntry[]>([])
  const [quizLeaders, setQuizLeaders] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGlobalLeaderboard()
  }, [])

  const fetchGlobalLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard/all?limit=10")
      if (response.ok) {
        const data = await response.json()
        setAllTimeLeaders(data.allTimeLeaders || [])
        setQuizLeaders(data.quizLeaders || [])
      }
    } catch (error) {
      console.error("Error fetching global leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    const rank = index + 1
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const formatPercentage = (percentage: number | string): string => {
    const num = typeof percentage === "string" ? Number.parseFloat(percentage) : percentage
    return isNaN(num) ? "0.0" : num.toFixed(1)
  }

  const calculatePercentage = (score: number, totalPoints: number): string => {
    if (totalPoints === 0) return "0.0"
    return ((score / totalPoints) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <Card className="hudl-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-hudl-blue" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hudl-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hudl-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-hudl-blue" />
          Global Leaderboard
        </CardTitle>
        <CardDescription>Top performers across all quizzes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-time" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-time">All-Time Best</TabsTrigger>
            <TabsTrigger value="quiz-champions">Quiz Champions</TabsTrigger>
          </TabsList>

          <TabsContent value="all-time" className="space-y-3 mt-4">
            {allTimeLeaders.length === 0 ? (
              <div className="text-center py-8">
                <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No quiz attempts yet</p>
              </div>
            ) : (
              allTimeLeaders.map((entry, index) => (
                <div
                  key={`${entry.user_name}-${entry.quiz_title}-${index}`}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index < 3 ? "bg-gradient-to-r from-blue-50 to-indigo-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">{getRankIcon(index)}</div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{entry.user_name}</span>
                      </div>
                      <div className="text-sm text-gray-600">{entry.quiz_title}</div>
                      {entry.wallet_address && (
                        <div className="flex items-center gap-2 mt-1">
                          <Wallet className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 font-mono">
                            {entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-hudl-blue">
                      {entry.percentage
                        ? formatPercentage(entry.percentage)
                        : calculatePercentage(entry.score, entry.total_points)}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.score}/{entry.total_points}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="quiz-champions" className="space-y-3 mt-4">
            {quizLeaders.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No quiz champions yet</p>
              </div>
            ) : (
              quizLeaders.map((entry, index) => (
                <div
                  key={`${entry.user_name}-${entry.quiz_title}`}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50"
                >
                  <div className="flex items-center gap-4">
                    <Trophy className="w-6 h-6 text-yellow-500" />

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{entry.user_name}</span>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Champion
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-700">{entry.quiz_title}</div>
                      {entry.wallet_address && (
                        <div className="flex items-center gap-2 mt-1">
                          <Wallet className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 font-mono">
                            {entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-yellow-600">
                      {entry.percentage
                        ? formatPercentage(entry.percentage)
                        : calculatePercentage(entry.score, entry.total_points)}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.score}/{entry.total_points}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
