import { NextResponse } from "next/server"

export async function GET() {
  // Get ALL environment variables (careful with secrets)
  const envVars = {
    // Redis variables
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL 
      ? `SET (${process.env.UPSTASH_REDIS_REST_URL.substring(0, 30)}...)` 
      : "NOT SET",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN 
      ? "SET (hidden)" 
      : "NOT SET",
    
    // Other Redis naming conventions
    KV_REST_API_URL: process.env.KV_REST_API_URL ? "SET" : "NOT SET",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "SET" : "NOT SET",
    
    // App info
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    
    // Uploadthing
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET ? "SET" : "NOT SET",
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID ? "SET" : "NOT SET",
  }
  
  // Try to create a Redis client
  let redisTest = "NOT ATTEMPTED"
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = await import("@upstash/redis")
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      await redis.ping()
      redisTest = "SUCCESS"
    }
  } catch (error) {
    redisTest = `FAILED: ${error instanceof Error ? error.message : String(error)}`
  }
  
  return NextResponse.json({
    environment: envVars,
    redisTest,
    recommendations: [
      "Ensure .env.local exists in project root",
      "Restart dev server after changing .env.local",
      "Redis URL should start with https://",
      "No quotes around values in .env.local"
    ]
  })
}