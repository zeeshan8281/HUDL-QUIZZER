import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { WalletService } from "@/lib/wallet"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json()

    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the signature (simplified - implement proper verification in production)
    const isValid = await WalletService.verifySignature(message, signature, walletAddress)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Check if user exists
    let user = await AuthService.findUserByWallet(walletAddress)

    if (!user) {
      // Create new user
      user = await AuthService.createUser({
        wallet_address: walletAddress,
        auth_provider: "wallet",
      })
    }

    // Create session
    const sessionToken = await AuthService.createSession(user.id)

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set("hudl_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Wallet auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
