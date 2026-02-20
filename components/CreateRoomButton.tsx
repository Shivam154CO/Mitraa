"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Unlock, Shield, AlertCircle, Sparkles } from "lucide-react"

export default function CreateRoomButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState("")
  const router = useRouter()

  const createRoom = async () => {
    if (isPrivate && !password) {
      setError("Please set a password for your private room")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPrivate,
          password: isPrivate ? password : null
        }),
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.hostKey) {
          localStorage.setItem(`hostKey_${data.roomId}`, data.hostKey)
        }
        await new Promise((resolve) => setTimeout(resolve, 300))
        router.push(`/${data.roomId}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setError(errorData.error || "Failed to create room")
      }
    } catch (error) {
      setError("Network error. Please try again.")
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
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="relative w-full bg-brand-surface border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isPrivate ? 'bg-brand-orange/10 text-brand-orange' : 'bg-white/5 text-white/40'}`}>
              {isPrivate ? <Lock size={22} /> : <Unlock size={22} />}
            </div>
            <div className="text-left font-outfit">
              <h3 className="font-bold text-white text-lg leading-tight">Privacy Guard</h3>
              <p className="text-[10px] text-white/30 mt-1 font-bold uppercase tracking-widest leading-none">{isPrivate ? 'Private Room' : 'Public Stream'}</p>
            </div>
          </div>

          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`relative w-14 h-8 rounded-full transition-all duration-500 focus:outline-none border-2 ${isPrivate ? 'bg-brand-orange border-brand-orange' : 'bg-white/5 border-white/10'}`}
          >
            <motion.div
              animate={{ x: isPrivate ? 24 : 4 }}
              className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${isPrivate ? 'bg-white' : 'bg-white/20'}`}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <AnimatePresence>
          {isPrivate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                  <Shield size={12} className="text-brand-orange" />
                  Security Passphrase
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-orange/40 focus:ring-1 focus:ring-brand-orange/20 outline-none transition-all text-white font-medium placeholder:text-white/20 text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={createRoom}
          disabled={isCreating}
          whileTap={{ scale: 0.96 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className={`w-full relative py-5 rounded-2xl font-outfit font-black text-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden border-2 shadow-xl ${isPrivate
            ? 'bg-brand-orange text-white border-brand-orange shadow-brand-orange/20'
            : 'bg-white/5 text-white border-white/10 hover:border-brand-orange/30 hover:text-brand-orange'
            }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="tracking-tight uppercase">Initializing...</span>
              </>
            ) : (
              <>
                <span className="tracking-tight uppercase">Create Room</span>
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-5 transition-opacity" />
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-3xl text-[10px] font-black shadow-lg flex items-center gap-3 backdrop-blur-xl uppercase tracking-widest"
          >
            <AlertCircle size={14} className="shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              onClick={handleCleanup}
              className="bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl transition-colors"
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}