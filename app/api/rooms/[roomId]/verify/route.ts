import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { createHash } from "crypto"

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const { roomId } = params
        const { password } = await request.json()

        if (!roomId || !password) {
            return NextResponse.json({ error: "Room ID and Password are required" }, { status: 400 })
        }

        const room = await storage.getRoom(roomId)

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 })
        }

        if (!room.isPrivate) {
            return NextResponse.json({ success: true, message: "Room is not password protected" })
        }

        const hashedPassword = createHash('sha256').update(password).digest('hex')

        if (room.password === hashedPassword) {
            return NextResponse.json({ success: true, message: "Password verified" })
        } else {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
        }
    } catch (error) {
        console.error(`Verification failed for room ${params?.roomId}:`, error)
        return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }
}
