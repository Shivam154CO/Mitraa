"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import RoomHeader from "@/components/RoomHeader"
import ContentGrid from "@/components/ContentGrid"
import ContentInput from "@/components/ContentInput"
import { useRoomStore } from "@/store/roomStore"
import type { Room } from "@/lib/types"
import { Lock, Shield, Zap, Clock, ArrowRight, CheckCircle2 } from "lucide-react"

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  if (!roomId || roomId === "undefined" || roomId === "null" || roomId.length < 3) {
    const [showError, setShowError] = useState(false)

    useEffect(() => {
      const timer = setTimeout(() => {
        if (!roomId || roomId === "undefined") {
          setShowError(true)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }, [roomId])

    if (showError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 font-outfit">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Room</h2>
            <p className="text-gray-600 mb-2 font-sans">
              Room ID is missing or invalid: <code className="bg-gray-100 px-2 py-1 rounded">{roomId || "(empty)"}</code>
            </p>
            <p className="text-sm text-gray-500 mb-4 font-sans">
              This usually happens when the URL is incorrect or the room was deleted.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl transition-colors uppercase tracking-widest text-xs"
            >
              Back to Home
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center font-outfit">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    )
  }

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)

  // Password Protection State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordAttempt, setPasswordAttempt] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const { messages, setMessages, addMessage } = useRoomStore()

  useEffect(() => {
    let mounted = true

    const fetchRoom = async () => {
      if (!roomId || roomId === "undefined") {
        if (mounted) {
          setError("Invalid room ID")
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/rooms/${roomId}`, {
          cache: "no-store",
        })

        if (!mounted) return

        if (response.ok) {
          const roomData = await response.json()
          setRoom(roomData)

          const savedHostKey = localStorage.getItem(`hostKey_${roomId}`)
          if (savedHostKey) {
            setIsHost(true)
            setIsAuthenticated(true)
          } else if (!roomData.isPrivate) {
            setIsAuthenticated(true)
          } else {
            const isPreviouslyVerified = sessionStorage.getItem(`verified_${roomId}`) === "true"
            if (isPreviouslyVerified) {
              setIsAuthenticated(true)
            }
          }

          if (roomData.messages && Array.isArray(roomData.messages)) {
            setMessages(roomData.messages)
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Room not found" }))
          setError(errorData.error || "Room not found or has expired")
        }
      } catch (err) {
        if (mounted) setError("Network error. Please check your connection.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchRoom()
    return () => { mounted = false }
  }, [roomId, setMessages])

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordAttempt) return

    setVerifying(true)
    setVerificationError(null)

    try {
      const response = await fetch(`/api/rooms/${roomId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordAttempt })
      })

      if (response.ok) {
        setIsAuthenticated(true)
        sessionStorage.setItem(`verified_${roomId}`, "true")
      } else {
        const data = await response.json()
        setVerificationError(data.error || "Incorrect password")
      }
    } catch (err) {
      setVerificationError("Verification failed. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let mounted = true

    if (room && isAuthenticated && roomId && roomId !== "undefined") {
      const fetchContent = async () => {
        if (!mounted || !roomId) return
        try {
          setContentLoading(true)
          const response = await fetch(`/api/rooms/${roomId}/messages`, { cache: "no-store" })
          if (response.ok && mounted) {
            const contentData = await response.json()
            if (Array.isArray(contentData)) setMessages(contentData)
          }
        } catch (err) {
          // Silent error in polling
        } finally {
          if (mounted) setContentLoading(false)
        }
      }

      fetchContent()
      interval = setInterval(fetchContent, 3000)
    }

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
    }
  }, [room, roomId, setMessages, isAuthenticated])

  const handleSubmitContent = async (
    content: string,
    type: "text" | "image" | "pdf" | "file",
    fileName?: string,
    fileSize?: number,
    fileType?: string,
  ) => {
    if (!roomId || roomId === "undefined") return

    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type, fileName, fileSize, fileType }),
      })

      if (response.ok) {
        const newContent = await response.json()
        addMessage(newContent)
      }
    } catch (err) {
      // Silent error
    }
  }

  const handleDestroyRoom = async () => {
    if (!window.confirm("ARE YOU SURE? This will permanently delete this room and all its content!")) return
    const hostKey = localStorage.getItem(`hostKey_${roomId}`)
    if (!hostKey) return

    setIsDestroying(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: { "x-host-key": hostKey }
      })
      if (response.ok) {
        localStorage.removeItem(`hostKey_${roomId}`)
        router.push("/")
      }
    } catch (err) {
      // Silent error
    } finally {
      setIsDestroying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center font-outfit">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Entering Room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto p-8 font-outfit">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Room Unavailable</h2>
          <p className="text-gray-600 mb-6 font-sans">{error}</p>
          <button onClick={() => router.push("/")} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest">
            Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated && room?.isPrivate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100"
        >
          <div className="text-center mb-8 font-outfit">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-tight">Private Room</h2>
            <p className="text-gray-600 font-sans text-sm">This room is protected. Please enter the password to join the conversation.</p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-6 font-outfit">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Password Required</label>
              <input
                type="password"
                autoFocus
                value={passwordAttempt}
                onChange={(e) => setPasswordAttempt(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-sky-400 focus:ring-1 focus:ring-sky-200 outline-none transition-all text-gray-900 text-lg tracking-widest placeholder:tracking-normal font-sans"
              />
              {verificationError && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">
                  {verificationError}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying || !passwordAttempt}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-sm tracking-widest"
            >
              {verifying ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Join Room"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full text-gray-400 hover:text-gray-600 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Go Back
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {room && <RoomHeader room={room} />}

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ContentGrid items={messages} loading={contentLoading && messages.length === 0} />
        </div>

        <div className="border-t border-gray-100 bg-white p-6">
          <ContentInput onSubmit={handleSubmitContent} />

          {isHost && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center font-outfit">
              <button
                onClick={handleDestroyRoom}
                disabled={isDestroying}
                className="text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 group"
              >
                <Shield className="w-4 h-4 group-hover:animate-pulse" />
                <span>{isDestroying ? "Destroying..." : "Destroy Room Permanently"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}