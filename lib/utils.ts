import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function generateRoomId(): string {
  const timeInSeconds = Math.floor(Date.now() / 1000)
  const timeBase36 = timeInSeconds.toString(36)
  const randomChars = Math.random().toString(36).substring(2, 4)
  const shortTimeId = timeBase36.slice(-3) + randomChars

  return shortTimeId.toLowerCase()
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 8)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
