import type { Room, Message } from "@/lib/types"
import { memoryStore } from "./memory-store"

class StorageManager {
  private redis: any = null
  private useRedis = false
  private initialized = false

  private async initialize() {
    if (this.initialized) return

    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const { Redis } = await import("@upstash/redis")
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })

        await this.redis.ping()
        this.useRedis = true
      } else {
        console.log("Using memory store")
      }
    } catch (error) {
      console.log("Redis connection failed:", error)
      this.useRedis = false
    }

    this.initialized = true
  }

  async clearCorruptedData(): Promise<void> {
    await this.initialize()
    
    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys("*")
        
        for (const key of keys) {
          try {
            const data = await this.redis.get(key)
            JSON.parse(data)
          } catch (error) {
            await this.redis.del(key)
          }
        }
      } catch (error) {
        console.error("Error clearing corrupted data:", error)
      }
    }
  }

  private safeJsonParse(data: any): any {
    try {
      if (typeof data === "object" && data !== null) {
        return data
      }

      if (typeof data === "string") {
        return JSON.parse(data)
      }

      console.error("Unexpected data type:", typeof data, data)
      return null
    } catch (error) {
      console.error("JSON parse error:", error, "Data:", data)
      return null
    }
  }

  private safeJsonStringify(data: any): string {
    try {
      return JSON.stringify(data)
    } catch (error) {
      console.error("JSON stringify error:", error)
      throw error
    }
  }

  async setRoom(roomId: string, room: Room): Promise<void> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const jsonString = this.safeJsonStringify(room)
        await this.redis.setex(`room:${roomId}`, 24 * 60 * 60, jsonString)
        return
      } catch (error) {
        console.error("Redis setRoom error:", error)
        this.useRedis = false
      }
    }

    memoryStore.setRoom(roomId, room)
  }

  async getRoom(roomId: string): Promise<Room | null> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(`room:${roomId}`)
        if (data) {
          const parsed = this.safeJsonParse(data)
          if (parsed) {
            return parsed as Room
          } else {
            await this.redis.del(`room:${roomId}`)
          }
        }
      } catch (error) {
        console.error("Redis getRoom error:", error)
        this.useRedis = false
      }
    }

    const room = memoryStore.getRoom(roomId)
    return room
  }

  async roomExists(roomId: string): Promise<boolean> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const exists = await this.redis.exists(`room:${roomId}`)
        return exists > 0
      } catch (error) {
        console.error("Redis roomExists error:", error)
        this.useRedis = false
      }
    }

    const exists = memoryStore.roomExists(roomId)
    return exists
  }

  async addMessage(roomId: string, message: Message): Promise<void> {
    await this.initialize()

    const roomExists = await this.roomExists(roomId)
    if (!roomExists) {
      console.error(`Cannot add message: Room ${roomId} does not exist`)
      throw new Error(`Room ${roomId} does not exist`)
    }

    if (this.useRedis && this.redis) {
      try {
        const jsonString = this.safeJsonStringify(message)
        await this.redis.rpush(`messages:${roomId}`, jsonString)
        await this.redis.expire(`messages:${roomId}`, 24 * 60 * 60)
        return
      } catch (error) {
        console.error("Redis addMessage error:", error)
        this.useRedis = false
      }
    }

    memoryStore.addMessage(roomId, message)
  }

  async getMessages(roomId: string): Promise<Message[]> {
    await this.initialize()

    const roomExists = await this.roomExists(roomId)
    if (!roomExists) {
      console.error(`Cannot get messages: Room ${roomId} does not exist`)
      return []
    }

    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.lrange(`messages:${roomId}`, 0, -1)
        const messages = data.map((item: string) => {
          try {
            return JSON.parse(item)
          } catch (error) {
            console.error("Error parsing message:", error)
            return null
          }
        }).filter((msg: Message | null) => msg !== null) as Message[]
        
        return messages
      } catch (error) {
        console.error("Redis getMessages error:", error)
        this.useRedis = false
      }
    }

    const messages = memoryStore.getMessages(roomId)
    return messages
  }

  async getAllRooms(): Promise<string[]> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys("room:*")
        return keys.map((key: string) => key.replace("room:", ""))
      } catch (error) {
        console.error("Redis getAllRooms error:", error)
        this.useRedis = false
      }
    }

    return memoryStore.getAllRooms()
  }

  getStorageType(): string {
    return this.useRedis ? "Redis" : "Memory"
  }
}

export const storage = new StorageManager()