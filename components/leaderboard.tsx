"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Wallet, User } from "lucide-react"

interface LeaderboardEntry {
  id: string
  user_name: string
  wallet_address?: string
  score: number
  total_points: number
  percentage: number | string
  completed_at: string
  rank: number
  quiz_title?: string
}

interface LeaderboardProps {
  quizId: string
  quizTitle: string
  limit?: number
}

export default function Leaderboard({ quizId, quizTitle, limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [quizId])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?quiz_id=${quizId}&limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300"
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
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
            <Trophy className="w-5 h-5 text-hudl-blue" />
            Leaderboard
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
          <Trophy className="w-5 h-5 text-hudl-blue" />
          Leaderboard: {quizTitle}
        </CardTitle>
        <CardDescription>Top performers for this quiz</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No attempts yet</p>
            <p className="text-sm text-gray-500">Be the first to take this quiz!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  entry.rank <= 3 ? "bg-gradient-to-r from-blue-50 to-indigo-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    <Badge variant="outline" className={getRankBadgeColor(entry.rank)}>
                      #{entry.rank}
                    </Badge>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{entry.user_name}</span>
                    </div>
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
                    {entry.score}/{entry.total_points}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.percentage
                      ? formatPercentage(entry.percentage)
                      : calculatePercentage(entry.score, entry.total_points)}
                    %
                  </div>
                  <div className="text-xs text-gray-500">{new Date(entry.completed_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
