// /app/api/rooms/[roomId]/route.ts
import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const { roomId } = params

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    const room = await storage.getRoom(roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found or has expired" }, { status: 404 })
    }

    const { password: _, ...roomData } = room
    return NextResponse.json(roomData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const { roomId } = params
    const hostKey = request.headers.get("x-host-key")

    if (!roomId || !hostKey) {
      return NextResponse.json({ error: "Room ID and Host Key are required" }, { status: 400 })
    }

    const room = await storage.getRoom(roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.hostKey !== hostKey) {
      return NextResponse.json({ error: "Unauthorized: Invalid Host Key" }, { status: 403 })
    }

    await storage.deleteRoom(roomId)

    return NextResponse.json({ success: true, message: "Room destroyed successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 })
  }
}
