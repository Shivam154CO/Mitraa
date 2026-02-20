"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function CreateRoomButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const createRoom = async () => {
    console.log("🔘 Create Room button clicked")
    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()

        // Save host key to identify the creator
        if (data.hostKey) {
          localStorage.setItem(`hostKey_${data.roomId}`, data.hostKey)
        }

        await new Promise((resolve) => setTimeout(resolve, 200))
        router.push(`/${data.roomId}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setError(errorData.error || "Failed to create room")
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCleanup = async () => {
    try {
      await fetch("/api/cleanup", { method: "POST" })
      setError(null)
    } catch (error) {
      console.error("Cleanup failed:", error)
    }
  }

  return (
    <div className="space-y-4">
      <motion.button
        onClick={createRoom}
        disabled={isCreating}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        <span className="relative z-10">
          {isCreating ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Room...</span>
            </div>
          ) : (
            "Create Room"
          )}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered && !isCreating ? '100%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm space-y-2"
        >
          <p>{error}</p>
          <button
            onClick={handleCleanup}
            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
          >
            Try Cleanup & Retry
          </button>
        </motion.div>
      )}
    </div>
  )
}