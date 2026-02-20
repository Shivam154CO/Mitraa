"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import RoomHeader from "@/components/RoomHeader"
import ContentGrid from "@/components/ContentGrid"
import ContentInput from "@/components/ContentInput"
import { useRoomStore } from "@/store/roomStore"
import type { Room } from "@/lib/types"

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  // 🚨 DEBUG: Log what we receive from useParams
  console.log("=== ROOM PAGE RENDER ===")
  console.log("params:", params)
  console.log("roomId from params:", roomId)
  console.log("typeof roomId:", typeof roomId)
  console.log("roomId length:", roomId?.length)

  // 🚨 CRITICAL FIX: Check if roomId is truly invalid
  if (!roomId || roomId === "undefined" || roomId === "null" || roomId.length < 3) {
    console.error("❌ Invalid room ID detected:", {
      roomId,
      type: typeof roomId,
      length: roomId?.length,
      params: JSON.stringify(params)
    })

    // Wait a moment to see if params update (Next.js hydration)
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
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Room</h2>
            <p className="text-gray-600 mb-2">
              Room ID is missing or invalid: <code className="bg-gray-100 px-2 py-1 rounded">{roomId || "(empty)"}</code>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This usually happens when the URL is incorrect or the room was deleted.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Create New Room
            </button>
          </div>
        </div>
      )
    }

    // Show loading while waiting for params
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
          <p className="text-sm text-gray-500 mt-2">Validating room ID...</p>
        </div>
      </div>
    )
  }

  // Valid roomId, continue with normal flow
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)

  const { messages, setMessages, addMessage } = useRoomStore()

  useEffect(() => {
    let mounted = true

    const fetchRoom = async () => {
      // Final validation
      if (!roomId || roomId === "undefined") {
        console.error("fetchRoom: Invalid roomId", roomId)
        if (mounted) {
          setError("Invalid room ID")
          setLoading(false)
        }
        return
      }

      if (!mounted) return

      try {
        console.log(`🔄 fetchRoom called for: ${roomId}`)
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/rooms/${roomId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        console.log(`📊 Room fetch response status: ${response.status}`)

        if (!mounted) return

        if (response.ok) {
          const roomData = await response.json()
          console.log("✅ Room data received:", {
            id: roomData.id,
            messageCount: roomData.messageCount,
            createdAt: new Date(roomData.createdAt).toISOString()
          })
          setRoom(roomData)
          setError(null)

          // Also set initial messages
          if (roomData.messages && Array.isArray(roomData.messages)) {
            setMessages(roomData.messages)
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Room not found" }))
          console.error("❌ Room not found:", errorData)
          setError(errorData.error || "Room not found or has expired")
        }

        // Check if current user is the host
        const savedHostKey = localStorage.getItem(`hostKey_${roomId}`)
        if (savedHostKey) {
          setIsHost(true)
        }
      } catch (err) {
        console.error("❌ Error fetching room:", err)
        if (mounted) {
          setError("Network error. Please check your connection.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Small delay to ensure params are stable
    const timer = setTimeout(() => {
      fetchRoom()
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [roomId, setMessages])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let mounted = true

    // Only poll if room exists AND roomId is valid
    if (room && roomId && roomId !== "undefined") {
      console.log("🔄 Starting content polling for room:", room.id)

      const fetchContent = async () => {
        if (!mounted || !roomId) return

        try {
          setContentLoading(true)
          const response = await fetch(`/api/rooms/${roomId}/messages`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (!mounted) return

          if (response.ok) {
            const contentData = await response.json()
            if (Array.isArray(contentData)) {
              setMessages(contentData)
            }
          }
        } catch (err) {
          console.error("Error during content polling:", err)
        } finally {
          if (mounted) {
            setContentLoading(false)
          }
        }
      }

      fetchContent()
      interval = setInterval(fetchContent, 3000)
    }

    return () => {
      mounted = false
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [room, roomId, setMessages])

  const handleSubmitContent = async (
    content: string,
    type: "text" | "image" | "pdf" | "file",
    fileName?: string,
    fileSize?: number,
    fileType?: string,
  ) => {
    if (!roomId || roomId === "undefined") {
      console.error("Cannot submit content: Invalid roomId", roomId)
      alert("Invalid room. Please refresh the page.")
      return
    }

    try {
      console.log(`📤 Sending ${type} content to room ${roomId}`)
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          type,
          fileName,
          fileSize,
          fileType,
        }),
      })

      if (response.ok) {
        const newContent = await response.json()
        console.log("✅ Content shared successfully:", newContent.id)
        addMessage(newContent)
      } else {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error("❌ Failed to share content:", response.status, errorText)
        alert(`Failed to share content: ${errorText}`)
      }
    } catch (err) {
      console.error("❌ Error sharing content:", err)
      alert("Network error while sharing content")
    }
  }

  const handleCreateNewRoom = () => {
    router.push("/")
  }

  const handleDestroyRoom = async () => {
    if (!window.confirm("ARE YOU SURE? This will permanently delete this room and all its content for everyone!")) {
      return
    }

    const hostKey = localStorage.getItem(`hostKey_${roomId}`)
    if (!hostKey) return

    setIsDestroying(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          "x-host-key": hostKey
        }
      })

      if (response.ok) {
        localStorage.removeItem(`hostKey_${roomId}`)
        router.push("/")
      } else {
        alert("Failed to destroy room")
      }
    } catch (err) {
      console.error("Error destroying room:", err)
      alert("Network error while destroying room")
    } finally {
      setIsDestroying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
          <p className="text-sm text-gray-500 mt-2">Room ID: {roomId.toUpperCase()}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Room ID: {roomId.toUpperCase()}</p>
          <button
            onClick={handleCreateNewRoom}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Create New Room
          </button>
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

        <div className="border-t bg-white p-4">
          <ContentInput onSubmit={handleSubmitContent} />

          {isHost && (
            <div className="mt-4 pt-4 border-t flex justify-center">
              <button
                onClick={handleDestroyRoom}
                disabled={isDestroying}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{isDestroying ? "Destroying..." : "Destroy Room Permanently (Host Only)"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}