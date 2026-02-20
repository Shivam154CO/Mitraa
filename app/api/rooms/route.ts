import { type NextRequest, NextResponse } from "next/server"
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

export async function POST(request: NextRequest) {
  try {
    console.log("=== ROOM CREATION REQUEST START ===")

    // Get user IP for proximity discovery
    const ip = request.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1"

    const roomId = generateRoomId()
    console.log(`Generated potential roomId: ${roomId}`)

    // Check if room already exists
    const exists = await storage.roomExists(roomId)
    console.log(`Room collision check: ${exists}`)

    const finalRoomId = exists ? `${roomId}-${Math.floor(Math.random() * 1000)}` : roomId
    const hostKey = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    console.log(`Final roomId: ${finalRoomId}`)

    const room = {
      id: finalRoomId,
      createdAt: Date.now(),
      hostKey: hostKey
    }

    console.log("Storing room in storage...")
    await storage.setRoom(finalRoomId, room)

    // Link room to IP for discovery
    await storage.addRoomToIp(ip, finalRoomId)

    console.log(`✅ successfully created room: ${finalRoomId} for IP: ${ip}`)

    return NextResponse.json({ roomId: finalRoomId, hostKey })
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