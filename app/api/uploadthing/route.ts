import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from 'fs/promises'
import { join } from 'path'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uniqueId = crypto.randomUUID()
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${uniqueId}-${safeFilename}`
    
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
    
  } catch (error) {
    console.error("Large upload error:", error)
    return NextResponse.json({ 
      error: "Upload failed. Please try again." 
    }, { status: 500 })
  }
}