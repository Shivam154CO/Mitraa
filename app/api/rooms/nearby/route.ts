import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Get user IP
        const ip = request.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1"

        console.log(`📡 Fetching nearby rooms for IP: ${ip}`)

        const roomIds = await storage.getRoomsByIp(ip)

        // Fetch details for each room and filter out expired ones
        const roomPromises = roomIds.map(async (id) => {
            const room = await storage.getRoom(id)
            return room
        })

        const allRooms = await Promise.all(roomPromises)
        const activeRooms = allRooms
            .filter((r) => r !== null)
            .map(r => {
                const { password, ...roomData } = r!
                return roomData
            })

        console.log(`📡 Found ${activeRooms.length} active nearby rooms`)

        return NextResponse.json(activeRooms)
    } catch (error) {
        console.error("Failed to fetch nearby rooms:", error)
        return NextResponse.json({ error: "Failed to fetch nearby rooms" }, { status: 500 })
    }
}
