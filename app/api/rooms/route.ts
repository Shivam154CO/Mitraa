import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { generateRoomId } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rooms = await storage.getAllRooms()
    return NextResponse.json({
      success: true,
      count: rooms.length,
      rooms: rooms
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to list rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { isPrivate, password } = body

    // Get user IP for proximity discovery
    const ip = request.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1"

    const roomId = generateRoomId()

    // Check if room already exists
    const exists = await storage.roomExists(roomId)

    const finalRoomId = exists ? `${roomId}-${Math.floor(Math.random() * 1000)}` : roomId
    const hostKey = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)

    // Basic password hashing using built-in crypto
    let hashedPassword = undefined
    if (isPrivate && password) {
      const { createHash } = await import('crypto')
      hashedPassword = createHash('sha256').update(password).digest('hex')
    }

    const room = {
      id: finalRoomId,
      createdAt: Date.now(),
      hostKey: hostKey,
      isPrivate: !!isPrivate,
      password: hashedPassword
    }

    await storage.setRoom(finalRoomId, room)

    // Link room to IP for discovery
    await storage.addRoomToIp(ip, finalRoomId)

    return NextResponse.json({ roomId: finalRoomId, hostKey })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create room",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}