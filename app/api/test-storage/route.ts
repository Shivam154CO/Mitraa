// /app/api/test-storage/route.ts
import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    console.log("=== TESTING STORAGE ===")
    
    // Test 1: Check storage instance
    console.log("Storage constructor:", storage.constructor?.name)
    console.log("Has setRoom?", typeof storage.setRoom === "function")
    
    // Test 2: Try to store something
    const testId = `test-${Date.now()}`
    console.log(`Creating test room: ${testId}`)
    
    const testRoom = { id: testId, createdAt: Date.now() }
    await storage.setRoom(testId, testRoom)
    
    // Test 3: Try to retrieve it
    const retrieved = await storage.getRoom(testId)
    const exists = await storage.roomExists(testId)
    
    return NextResponse.json({
      success: true,
      test: {
        stored: testRoom,
        retrieved,
        exists,
        match: retrieved?.id === testId
      },
      storageInfo: {
        type: storage.getStorageType?.(),
        hasSetRoom: typeof storage.setRoom === "function",
        hasGetRoom: typeof storage.getRoom === "function"
      }
    })
    
  } catch (error) {
    console.error("Storage test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}