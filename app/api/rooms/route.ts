// /app/api/rooms/route.ts
import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { generateRoomId } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log("Fetching all rooms...")
    const rooms = await storage.getAllRooms()
    return NextResponse.json({
      success: true,
      count: rooms.length,
      rooms: rooms
    })
  } catch (error) {
    console.error("Failed to list rooms:", error)
    return NextResponse.json({ error: "Failed to list rooms" }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log("=== ROOM CREATION REQUEST START ===")
    const roomId = generateRoomId()
    console.log(`Generated potential roomId: ${roomId}`)

    // Check if room already exists
    const exists = await storage.roomExists(roomId)
    console.log(`Room collision check: ${exists}`)

    const finalRoomId = exists ? `${roomId}-${Math.floor(Math.random() * 1000)}` : roomId
    console.log(`Final roomId: ${finalRoomId}`)

    const room = {
      id: finalRoomId,
      createdAt: Date.now(),
    }

    console.log("Storing room in storage...")
    await storage.setRoom(finalRoomId, room)
    console.log(`✅ successfully created and stored room: ${finalRoomId}`)

    return NextResponse.json({ roomId: finalRoomId })
  } catch (error) {
    console.error("❌ CRITICAL ERROR IN ROOM CREATION:", error)
    return NextResponse.json(
      {
        error: "Failed to create room",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}