"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function DiscordCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const error = searchParams.get("error")

      if (error) {
        setStatus("error")
        setMessage("Discord authentication was cancelled or failed")
        return
      }

      if (!code) {
        setStatus("error")
        setMessage("No authorization code received from Discord")
        return
      }

      try {
        const response = await fetch("/api/auth/discord", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })

        if (response.ok) {
          setStatus("success")
          setMessage("Successfully authenticated with Discord!")
          // Redirect to main app after 2 seconds
          setTimeout(() => {
            window.location.href = "/"
          }, 2000)
        } else {
          const errorData = await response.json()
          setStatus("error")
          setMessage(errorData.error || "Authentication failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Network error during authentication")
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-hudl-blue-lighter to-white">
      <Card className="w-full max-w-md hudl-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/hudl-logo.png" alt="HUDL Logo" width={200} height={60} className="h-12 w-auto" />
          </div>
          <CardTitle className="text-hudl-blue">
            {status === "loading" && "Authenticating with Discord..."}
            {status === "success" && "Authentication Successful!"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hudl-blue mx-auto"></div>
              <p className="text-gray-600">Please wait while we authenticate you...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="text-green-600 text-4xl">✓</div>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to the app...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="text-red-600 text-4xl">✗</div>
              <p className="text-gray-600">{message}</p>
              <button onClick={() => (window.location.href = "/")} className="text-hudl-blue hover:underline">
                Return to login page
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
