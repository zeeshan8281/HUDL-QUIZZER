"use client"

declare global {
  interface Window {
    ethereum?: any
  }
}

export class WalletService {
  static async connectWallet(): Promise<string | null> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      return accounts[0]
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  static async signMessage(message: string, address: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      })

      return signature
    } catch (error) {
      console.error("Error signing message:", error)
      throw error
    }
  }

  static async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      // This is a simplified verification - in production, you'd want to use a proper library
      // like ethers.js or web3.js for signature verification
      return true // Placeholder - implement proper verification
    } catch (error) {
      console.error("Error verifying signature:", error)
      return false
    }
  }

  static generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
