import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    console.log(`Fetching room: ${params.roomId}`)

    const room = await storage.getRoom(params.roomId)

    if (!room) {
      console.log(`Room ${params.roomId} not found`)
      return NextResponse.json({ error: "Room not found or has expired" }, { status: 404 })
    }

    if (!room.id || !room.createdAt) {
      console.error(`Room ${params.roomId} has invalid data structure:`, room)
      return NextResponse.json({ error: "Room data is corrupted" }, { status: 500 })
    }

    const now = Date.now()
    const expireTime = 24 * 60 * 60 * 1000

    if (now - room.createdAt > expireTime) {
      console.log(`Room ${params.roomId} has expired`)
      return NextResponse.json({ error: "Room has expired" }, { status: 404 })
    }

    console.log(`Room ${params.roomId} retrieved successfully`)
    return NextResponse.json(room)
  } catch (error) {
    console.error(`Failed to get room ${params.roomId}:`, error)
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 })
  }
}
