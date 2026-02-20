// /app/api/rooms/[roomId]/messages/route.ts
import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { generateId, generateUserId } from "@/lib/utils"
import type { Message } from "@/lib/types"

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    console.log(`Fetching messages for room: ${params.roomId}`)

    const roomExists = await storage.roomExists(params.roomId)
    console.log(`Room ${params.roomId} exists: ${roomExists}`)

    if (!roomExists) {
      console.log(`Room ${params.roomId} not found`)
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const messages = await storage.getMessages(params.roomId)
    console.log(`Retrieved ${messages.length} messages for room ${params.roomId}`)

    const validMessages = Array.isArray(messages) ? messages : []

    const sanitizedMessages = validMessages.filter((msg) => {
      return (
        msg &&
        typeof msg === "object" &&
        msg.id &&
        msg.roomId &&
        msg.userId &&
        msg.content &&
        msg.type &&
        typeof msg.createdAt === "number"
      )
    })

    console.log(`Returning ${sanitizedMessages.length} valid messages`)
    return NextResponse.json(sanitizedMessages)
  } catch (error) {
    console.error(`Failed to get messages for room ${params.roomId}:`, error)
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    console.log(`Posting message to room: ${params.roomId}`)

    const roomExists = await storage.roomExists(params.roomId)
    if (!roomExists) {
      console.log(`Room ${params.roomId} not found`)
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const body = await request.json()
    const { content, type = "text", fileName, fileSize, fileType } = body

    if (!content) {
      console.log("Missing content in message")
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const messageId = generateId()
    const userId = generateUserId()

    const message: Message = {
      id: messageId,
      roomId: params.roomId,
      userId,
      content,
      type,
      fileName,
      fileSize,
      fileType,
      createdAt: Date.now(),
    }

    console.log(`Storing message ${messageId} in room ${params.roomId}`)
    await storage.addMessage(params.roomId, message)
    console.log(`Message stored successfully`)

    return NextResponse.json(message)
  } catch (error) {
    console.error(`Failed to create message for room ${params.roomId}:`, error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
