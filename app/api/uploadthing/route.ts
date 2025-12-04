import { type NextRequest, NextResponse } from "next/server"

// Increase the limit for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Increase from default 1mb
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Increase the limit to 50MB (or whatever you want)
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      }, { status: 400 })
    }

    // Only convert to base64 if it's a small file
    // For larger files, consider storing them differently
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // For very large files, this base64 conversion can crash
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    
    // Check if it's a memory error
    if (error instanceof Error && error.message.includes("memory") || error.message.includes("allocation")) {
      return NextResponse.json({ 
        error: "File too large for base64 conversion. Try a smaller file or use direct storage upload." 
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}