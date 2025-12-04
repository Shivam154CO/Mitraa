import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    const roomExists = await storage.roomExists(roomId)
    const room = await storage.getRoom(roomId)
    const messages = await storage.getMessages(roomId)

    return NextResponse.json({
      roomId,
      exists: roomExists,
      room,
      messages,
      messageCount: messages.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test room error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
