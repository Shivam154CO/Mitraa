import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Room } from "@/lib/types"
import ShareModal from "./ShareModal"

interface RoomHeaderProps {
  room: Room
}

export default function RoomHeader({ room }: RoomHeaderProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [copied, setCopied] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    const savedHostKey = localStorage.getItem(`hostKey_${room.id}`)
    if (savedHostKey) {
      setIsHost(true)
    }
  }, [room.id])

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now()
      const expiresAt = room.createdAt + 24 * 60 * 60 * 1000
      const diff = expiresAt - now

      if (diff <= 0) {
        setTimeLeft("Expired")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [room.createdAt])

  const handleShareClick = async () => {
    // Check if it's a mobile device and supports native share
    if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `Join Mitraa Room ${room.id.toUpperCase()}`,
          text: "Share anything instantly with me on Mitraa!",
          url: window.location.href,
        })
      } catch (err) {
        console.log("Native share failed or cancelled, opening modal...")
        setIsShareModalOpen(true)
      }
    } else {
      // Desktop: Open QR modal
      setIsShareModalOpen(true)
    }
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-4 shadow-sm"
      >
        <div className="max-w-7xl px-4 mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">
                    Room {room.id.toUpperCase()}
                  </h1>
                  {isHost && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-purple-200">
                      Host
                    </span>
                  )}
                </div>
                <p className="text-sm text-sky-600">Expires in {timeLeft}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleShareClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{copied ? "Copied!" : "Invite"}</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={room.id}
      />
    </>
  )
}