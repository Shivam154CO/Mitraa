// /app/api/cleanup/route.ts
import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

export async function POST() {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    
    // List all keys
    const allKeys = await redis.keys("*")
    console.log(`Found ${allKeys.length} keys in Redis`)
    
    // Delete test and corrupted data
    const keysToDelete = allKeys.filter(key => 
      key.startsWith("test-") || 
      key.startsWith("room:test") ||
      key.includes("corrupt")
    )
    
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete)
      console.log(`Deleted ${keysToDelete.length} test/corrupted keys`)
    }
    
    return NextResponse.json({
      success: true,
      totalKeys: allKeys.length,
      deleted: keysToDelete.length,
      remaining: allKeys.length - keysToDelete.length,
      message: "Cleanup completed"
    })
    
  } catch (error) {
    console.error("Cleanup failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}