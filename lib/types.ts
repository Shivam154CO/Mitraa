export interface Room {
  id: string
  createdAt: number
  hostKey?: string
  isPrivate?: boolean
  password?: string
}

export interface Message {
  id: string
  roomId: string
  userId: string
  content: string
  type: "text" | "image" | "pdf" | "file"
  fileName?: string
  fileSize?: number
  fileType?: string
  createdAt: number
}

export type FileType = "image" | "pdf" | "file"
