interface Room {
  id: string
  createdAt: number
}

interface Message {
  id: string
  roomId: string
  userId: string
  content: string
  type: "text" | "image"
  createdAt: number
  fileName?: string
  fileSize?: number
  fileType?: string
}

const globalForMemoryStore = globalThis as unknown as {
  _memoryStore?: {
    rooms: Map<string, Room>
    messages: Map<string, Message[]>
  }
}

class MemoryStore {
  private rooms: Map<string, Room>
  private messages: Map<string, Message[]>

  constructor() {
    if (!globalForMemoryStore._memoryStore) {
      globalForMemoryStore._memoryStore = {
        rooms: new Map(),
        messages: new Map()
      }
      console.log("Initialized new global memory store")
    }
    
    this.rooms = globalForMemoryStore._memoryStore.rooms
    this.messages = globalForMemoryStore._memoryStore.messages
    
    console.log(`Memory store initialized with ${this.rooms.size} rooms, ${this.messages.size} message sets`)
  }

  private cleanup() {
    const now = Date.now()
    const expireTime = 24 * 60 * 60 * 1000
    let cleaned = 0

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.createdAt > expireTime) {
        this.rooms.delete(roomId)
        this.messages.delete(roomId)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired rooms`)
    }
  }

  setRoom(roomId: string, room: Room) {
    this.cleanup()
    this.rooms.set(roomId, room)
    console.log(`Room ${roomId} stored in memory (Total rooms: ${this.rooms.size})`)
  }

  getRoom(roomId: string): Room | null {
    this.cleanup()
    const room = this.rooms.get(roomId)
    return room || null
  }

  roomExists(roomId: string): boolean {
    this.cleanup()
    return this.rooms.has(roomId)
  }

  addMessage(roomId: string, message: Message) {
    this.cleanup()
    
    if (!this.rooms.has(roomId)) {
      console.error(`Cannot add message: Room ${roomId} does not exist`)
      return
    }
    
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, [])
      console.log(`Created new messages array for room ${roomId}`)
    }
    
    const roomMessages = this.messages.get(roomId)!
    roomMessages.push(message)
    console.log(`Message added to room ${roomId} (Total messages in room: ${roomMessages.length})`)
  }

  getMessages(roomId: string): Message[] {
    this.cleanup()
    const messages = this.messages.get(roomId) || []
    return messages.sort((a, b) => a.createdAt - b.createdAt)
  }

  getAllRooms(): string[] {
    this.cleanup()
    return Array.from(this.rooms.keys())
  }

  debugState() {
    return {
      rooms: Array.from(this.rooms.entries()).map(([id, room]) => ({
        id,
        createdAt: new Date(room.createdAt).toISOString(),
        ageInHours: (Date.now() - room.createdAt) / (1000 * 60 * 60)
      })),
      messages: Array.from(this.messages.entries()).map(([roomId, msgs]) => ({
        roomId,
        messageCount: msgs.length,
        messages: msgs.map(msg => ({
          id: msg.id,
          type: msg.type,
          contentLength: msg.content.length
        }))
      }))
    }
  }
}

export const memoryStore = new MemoryStore()