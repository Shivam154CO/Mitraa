// /app/api/rooms/[roomId]/messages/route.ts
import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { generateId, generateUserId } from "@/lib/utils"
import type { Message } from "@/lib/types"

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const roomExists = await storage.roomExists(params.roomId)

        if (!roomExists) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }

        const messages = await storage.getMessages(params.roomId)
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

        return NextResponse.json(sanitizedMessages)
    } catch (error) {
        return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const roomExists = await storage.roomExists(params.roomId)
        if (!roomExists) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }

        const body = await request.json()
        const { content, type = "text", fileName, fileSize, fileType } = body

        if (!content) {
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

        await storage.addMessage(params.roomId, message)

        return NextResponse.json(message)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
    }
}
