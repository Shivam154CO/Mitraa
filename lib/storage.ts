// /lib/storage.ts - FIXED VERSION
import type { Room, Message } from "@/lib/types"
import { Redis } from "@upstash/redis"

let redisInstance: Redis | null = null

function getRedis(): Redis {
  if (redisInstance) return redisInstance

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error("Redis environment variables missing. Check .env.local")
  }

  try {
    redisInstance = new Redis({ url, token })
    return redisInstance
  } catch (error) {
    throw error
  }
}

class RedisStorage {
  private ttl = 24 * 60 * 60

  async setRoom(roomId: string, room: Room): Promise<void> {
    const normalizedId = roomId.toLowerCase()
    const redis = getRedis()
    const roomJson = JSON.stringify(room)
    await redis.setex(`room:${normalizedId}`, this.ttl, roomJson)
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const normalizedId = roomId.toLowerCase()
    const redis = getRedis()

    try {
      const data = await redis.get(`room:${roomId}`)

      if (!data) {
        return null
      }

      let parsed: any

      if (typeof data === 'string') {
        parsed = JSON.parse(data)
      } else if (typeof data === 'object' && data !== null) {
        if ('id' in data && 'createdAt' in data) {
          return data as Room
        }
        parsed = JSON.parse(JSON.stringify(data))
      } else {
        return null
      }

      if (parsed && parsed.id && typeof parsed.createdAt === 'number') {
        await this.refreshTTL(normalizedId)
        return parsed as Room
      } else {
        return null
      }

    } catch (error) {
      return null
    }
  }

  async refreshTTL(roomId: string): Promise<void> {
    const normalizedId = roomId.toLowerCase()
    const redis = getRedis()
    await redis.expire(`room:${normalizedId}`, this.ttl)
    await redis.expire(`messages:${normalizedId}`, this.ttl)
  }

  async roomExists(roomId: string): Promise<boolean> {
    const redis = getRedis()
    const normalizedId = roomId.toLowerCase()
    const exists = await redis.exists(`room:${normalizedId}`)
    return exists === 1
  }

  async addMessage(roomId: string, message: Message): Promise<void> {
    const normalizedId = roomId.toLowerCase()
    const redis = getRedis()
    const messageJson = JSON.stringify(message)
    await redis.rpush(`messages:${normalizedId}`, messageJson)
    await redis.expire(`messages:${normalizedId}`, this.ttl)
    await this.refreshTTL(normalizedId)
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const normalizedId = roomId.toLowerCase()
    const redis = getRedis()

    try {
      const data = await redis.lrange(`messages:${normalizedId}`, 0, -1)

      if (!data || !Array.isArray(data)) {
        return []
      }

      const messages: Message[] = []

      for (const item of data) {
        try {
          if (typeof item === 'string') {
            messages.push(JSON.parse(item))
          } else if (typeof item === 'object' && item !== null) {
            messages.push(item as Message)
          }
        } catch (parseError) {
          // Skip unparseable messages
        }
      }

      return messages

    } catch (error) {
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
  }

  async addRoomToIp(ip: string, roomId: string): Promise<void> {
    const redis = getRedis()
    const key = `ip_rooms:${ip}`
    await redis.sadd(key, roomId)
    await redis.expire(key, this.ttl)
  }

  async getRoomsByIp(ip: string): Promise<string[]> {
    const redis = getRedis()
    const key = `ip_rooms:${ip}`
    const rooms = await redis.smembers(key)
    return rooms
  }

  async clearTestData(): Promise<void> {
    const redis = getRedis()
    const keys = await redis.keys("test-*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}

export const storage = new RedisStorage()