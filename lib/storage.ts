// /lib/storage.ts - FIXED VERSION
import type { Room, Message } from "@/lib/types"
import { Redis } from "@upstash/redis"

let redisInstance: Redis | null = null

function getRedis(): Redis {
  if (redisInstance) return redisInstance

  console.log("🔄 Initializing Redis connection...")

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error("Redis environment variables missing. Check .env.local")
  }

  try {
    redisInstance = new Redis({ url, token })
    console.log("✅ Redis connected successfully")
    return redisInstance
  } catch (error) {
    console.error("❌ Redis connection failed:", error)
    throw error
  }
}

class RedisStorage {
  private ttl = 24 * 60 * 60

  async setRoom(roomId: string, room: Room): Promise<void> {
    const normalizedId = roomId.toLowerCase()
    console.log(`[Redis] Storing room: ${normalizedId}`)
    const redis = getRedis()

    // Ensure we store STRINGIFIED JSON
    const roomJson = JSON.stringify(room)
    console.log(`Room JSON length: ${roomJson.length} chars`)

    await redis.setex(`room:${normalizedId}`, this.ttl, roomJson)
    console.log(`✅ Room ${normalizedId} stored`)
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const normalizedId = roomId.toLowerCase()
    console.log(`[Redis] Getting room: ${normalizedId}`)
    const redis = getRedis()

    try {
      const data = await redis.get(`room:${roomId}`)

      if (!data) {
        console.log(`Room ${normalizedId} not found in Redis`)
        return null
      }

      console.log(`Data type from Redis: ${typeof data}, Value: ${String(data).substring(0, 100)}...`)

      // Handle different data types from Redis
      let parsed: any

      if (typeof data === 'string') {
        // It's already a string, parse it
        parsed = JSON.parse(data)
      } else if (typeof data === 'object' && data !== null) {
        // Redis might return an object directly
        // Check if it's already a Room object
        if ('id' in data && 'createdAt' in data) {
          return data as Room
        }
        // Otherwise stringify and parse
        parsed = JSON.parse(JSON.stringify(data))
      } else {
        // Unknown type
        console.error(`Unexpected data type from Redis: ${typeof data}`, data)
        return null
      }

      // Validate the parsed object
      if (parsed && parsed.id && typeof parsed.createdAt === 'number') {
        console.log(`✅ Successfully parsed room ${roomId}`)

        // Refresh TTL on successful retrieval
        await this.refreshTTL(normalizedId)

        return parsed as Room
      } else {
        console.error(`Invalid room data for ${roomId}:`, parsed)
        return null
      }

    } catch (error) {
      console.error(`❌ Failed to parse room ${roomId}:`, error)
      return null
    }
  }

  async refreshTTL(roomId: string): Promise<void> {
    const normalizedId = roomId.toLowerCase()
    const redis = getRedis()
    await redis.expire(`room:${normalizedId}`, this.ttl)
    await redis.expire(`messages:${normalizedId}`, this.ttl)
    console.log(`🔄 TTL refreshed for room and messages: ${normalizedId}`)
  }

  async roomExists(roomId: string): Promise<boolean> {
    const redis = getRedis()
    const normalizedId = roomId.toLowerCase()
    const exists = await redis.exists(`room:${normalizedId}`)
    console.log(`[Redis] Room ${normalizedId} exists: ${exists === 1}`)
    return exists === 1
  }

  async addMessage(roomId: string, message: Message): Promise<void> {
    const normalizedId = roomId.toLowerCase()
    console.log(`[Redis] Adding message to: ${normalizedId}`)
    const redis = getRedis()

    // Stringify the message
    const messageJson = JSON.stringify(message)
    await redis.rpush(`messages:${normalizedId}`, messageJson)
    await redis.expire(`messages:${normalizedId}`, this.ttl)

    console.log(`✅ Message added to room ${normalizedId}`)

    // Refresh room TTL when a message is added
    await this.refreshTTL(normalizedId)
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const normalizedId = roomId.toLowerCase()
    console.log(`[Redis] Getting messages for: ${normalizedId}`)
    const redis = getRedis()

    try {
      const data = await redis.lrange(`messages:${normalizedId}`, 0, -1)

      if (!data || !Array.isArray(data)) {
        console.log(`No messages found for room ${normalizedId}`)
        return []
      }

      const messages: Message[] = []

      for (const item of data) {
        try {
          if (typeof item === 'string') {
            messages.push(JSON.parse(item))
          } else if (typeof item === 'object' && item !== null) {
            // Already an object
            messages.push(item as Message)
          }
        } catch (parseError) {
          console.error(`Failed to parse message:`, item, parseError)
        }
      }

      console.log(`✅ Retrieved ${messages.length} messages for ${normalizedId}`)
      return messages

    } catch (error) {
      console.error(`❌ Failed to get messages for ${normalizedId}:`, error)
      return []
    }
  }

  async getAllRooms(): Promise<string[]> {
    const redis = getRedis()
    const keys = await redis.keys("room:*")
    return keys.map(key => key.replace("room:", ""))
  }

  getStorageType(): string {
    return "Redis"
  }

  async deleteRoom(roomId: string): Promise<void> {
    const normalizedId = roomId.toLowerCase()
    const redis = getRedis()
    await redis.del(`room:${normalizedId}`)
    await redis.del(`messages:${normalizedId}`)
    console.log(`🗑️ Room ${normalizedId} and its messages have been deleted`)
  }

  async addRoomToIp(ip: string, roomId: string): Promise<void> {
    const redis = getRedis()
    const key = `ip_rooms:${ip}`
    await redis.sadd(key, roomId)
    await redis.expire(key, this.ttl)
    console.log(`📡 Linked room ${roomId} to IP ${ip}`)
  }

  async getRoomsByIp(ip: string): Promise<string[]> {
    const redis = getRedis()
    const key = `ip_rooms:${ip}`
    const rooms = await redis.smembers(key)
    console.log(`📡 Found ${rooms.length} rooms for IP ${ip}`)
    return rooms
  }

  // Debug: Clear test data
  async clearTestData(): Promise<void> {
    const redis = getRedis()
    const keys = await redis.keys("test-*")
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`Cleared ${keys.length} test keys`)
    }
  }
}

export const storage = new RedisStorage()