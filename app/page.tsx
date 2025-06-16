"use client"

import { useState, useEffect } from "react"
import AuthForm from "@/components/auth-form"
import AdminDashboard from "@/components/admin-dashboard"
import QuizInterface from "@/components/quiz-interface"
import { Button } from "@/components/ui/button"
import { LogOut, User, Shield, Wallet, MessageSquare } from "lucide-react"
import Image from "next/image"
import type { User as UserType } from "@/lib/neon"

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getAuthIcon = (provider: string) => {
    switch (provider) {
      case "wallet":
        return <Wallet className="w-4 h-4" />
      case "discord":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hudl-blue mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hudl-blue-lighter/30 to-white">
      <header className="bg-white shadow-lg border-b-2 border-hudl-blue">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/hudl-logo.png" alt="HUDL Logo" width={150} height={45} className="h-8 w-auto" />
              <div className="h-8 w-px bg-hudl-blue-light"></div>
              <h1 className="text-xl font-bold text-hudl-blue">HUDL Quizzer</h1>
              {user.is_admin && <Shield className="w-5 h-5 text-hudl-blue" />}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getAuthIcon(user.auth_provider)}
                <span>{user.full_name || user.email || user.wallet_address?.slice(0, 8) + "..."}</span>
                {user.is_admin && (
                  <span className="bg-hudl-blue text-white px-3 py-1 rounded-full text-xs font-semibold">Admin</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-hudl-blue text-hudl-blue hover:bg-hudl-blue hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>{user.is_admin ? <AdminDashboard /> : <QuizInterface />}</main>
    </div>
  )
}
