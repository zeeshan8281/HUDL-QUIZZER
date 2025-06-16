"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, MessageSquare, Shield, Users, AlertCircle } from "lucide-react"
import { WalletService } from "@/lib/wallet"
import { DiscordService } from "@/lib/discord"

export default function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState<"admin" | "attendee">("attendee")
  const [error, setError] = useState("")

  // const handleWalletConnect = async () => {
  //   setLoading(true)
  //   setError("")
  //   try {
  //     const walletAddress = await WalletService.connectWallet()
  //     if (!walletAddress) throw new Error("Failed to connect wallet")

  //     const nonce = WalletService.generateNonce()
  //     const message = `Sign this message to authenticate with HUDL Quiz Platform.\n\nNonce: ${nonce}`

  //     const signature = await WalletService.signMessage(message, walletAddress)

  //     const response = await fetch("/api/auth/wallet", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ walletAddress, signature, message }),
  //     })

  //     if (response.ok) {
  //       window.location.reload()
  //     } else {
  //       const error = await response.json()
  //       setError(error.error || "Wallet authentication failed")
  //     }
  //   } catch (error: any) {
  //     setError(error.message || "Failed to connect wallet")
  //   }
  //   setLoading(false)
  // }

  const handleDiscordConnect = () => {
    setError("")
    try {
      const authUrl = DiscordService.getAuthUrl()
      window.location.href = authUrl
    } catch (error: any) {
      setError(error.message || "Failed to initialize Discord authentication")
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/email/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          isAdmin: userType === "admin",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.message) {
          alert(data.message)
        } else {
          alert("Account created successfully!")
        }
        window.location.reload()
      } else {
        const error = await response.json()
        setError(error.error || "Sign up failed")
      }
    } catch (error) {
      setError("Sign up failed")
    }
    setLoading(false)
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/email/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        setError(error.error || "Sign in failed")
      }
    } catch (error) {
      setError("Sign in failed")
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-hudl-blue-lighter to-white">
      <Card className="w-full max-w-md hudl-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/hudl-logo.png" alt="HUDL Logo" width={200} height={60} className="h-12 w-auto" />
          </div>
          <CardTitle className="text-hudl-blue">Welcome to HUDL Quiz</CardTitle>
          <CardDescription>Choose your role and sign-in method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* User Type Selection */}
          <Tabs
            value={userType}
            onValueChange={(value) => setUserType(value as "admin" | "attendee")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-hudl-blue-lighter">
              <TabsTrigger
                value="attendee"
                className="data-[state=active]:bg-hudl-blue data-[state=active]:text-white flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Attendee
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-hudl-blue data-[state=active]:text-white flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendee" className="space-y-4 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="w-8 h-8 text-hudl-blue mx-auto mb-2" />
                <h3 className="font-semibold text-hudl-blue">Quiz Attendee</h3>
                <p className="text-sm text-gray-600">Take quizzes and view your results</p>
              </div>

              {/* Wallet Connect
              <Button
                onClick={handleWalletConnect}
                disabled={loading}
                className="w-full hudl-button flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button> */}

              {/* Discord Connect */}
              <Button
                onClick={handleDiscordConnect}
                disabled={loading}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Connect with Discord
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <AttendeeEmailAuth
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                fullName={fullName}
                setFullName={setFullName}
                loading={loading}
                onSignIn={handleEmailSignIn}
                onSignUp={handleEmailSignUp}
              />
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-600">Quiz Administrator</h3>
                <p className="text-sm text-gray-600">Create and manage quizzes</p>
              </div>

              <AdminEmailAuth
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                fullName={fullName}
                setFullName={setFullName}
                loading={loading}
                onSignIn={handleEmailSignIn}
                onSignUp={handleEmailSignUp}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function AttendeeEmailAuth({
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  loading,
  onSignIn,
  onSignUp,
}: {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  fullName: string
  setFullName: (name: string) => void
  loading: boolean
  onSignIn: (e: React.FormEvent) => void
  onSignUp: (e: React.FormEvent) => void
}) {
  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <form onSubmit={onSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full hudl-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In as Attendee"}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={onSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full hudl-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up as Attendee"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}

function AdminEmailAuth({
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  loading,
  onSignIn,
  onSignUp,
}: {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  fullName: string
  setFullName: (name: string) => void
  loading: boolean
  onSignIn: (e: React.FormEvent) => void
  onSignUp: (e: React.FormEvent) => void
}) {
  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Admin Sign In</TabsTrigger>
        <TabsTrigger value="signup">Request Admin</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <form onSubmit={onSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin Email</Label>
            <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
            {loading ? "Signing In..." : "Sign In as Admin"}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={onSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-fullName">Full Name</Label>
            <Input
              id="admin-fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Admin accounts require approval. You'll be created as a regular user initially.
            </p>
          </div>
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
            {loading ? "Requesting..." : "Request Admin Access"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
