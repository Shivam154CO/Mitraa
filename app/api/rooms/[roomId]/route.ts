// /app/api/rooms/[roomId]/route.ts
import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const { roomId } = params
    console.log(`Fetching room: ${roomId}`)

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    const room = await storage.getRoom(roomId)

    if (!room) {
      console.log(`Room ${roomId} not found or expired`)
      return NextResponse.json({ error: "Room not found or has expired" }, { status: 404 })
    }

    // Refresh the TTL when the room is accessed? 
    // Usually a good idea for temporary rooms to keep them alive while active
    // But for now, let's just return the room data.

    console.log(`Room ${roomId} retrieved successfully`)
    return NextResponse.json(room)
  } catch (error) {
    console.error(`Failed to get room ${params?.roomId}:`, error)
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 })
  }
}
