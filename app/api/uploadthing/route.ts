import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow more time for large uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Increased limit to 100MB for the proxy
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 100MB." }, { status: 400 })
    }

    console.log(`📤 Proxying ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) to TmpFiles...`)

    // Convert File to Blob for the proxy fetch
    const bytes = await file.arrayBuffer()
    const blob = new Blob([bytes], { type: file.type })

    // Prepare for external upload
    const externalFormData = new FormData()
    externalFormData.append("file", blob, file.name)

    // Upload to TmpFiles (anonymous)
    const tfResponse = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: externalFormData,
    })

    if (!tfResponse.ok) {
      const errorText = await tfResponse.text()
      console.error("❌ TmpFiles upload failed status:", tfResponse.status)
      console.error("❌ TmpFiles error body:", errorText)
      throw new Error(`External storage upload failed: ${tfResponse.status}`)
    }

    const tfData = await tfResponse.json()

    // TmpFiles returns URL in data.url
    // Example: https://tmpfiles.org/12345/file.png
    let fileUrl = tfData.data.url

    // Convert to direct link if possible (tmpfiles.org/dl/...)
    if (fileUrl.includes("tmpfiles.org/")) {
      fileUrl = fileUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/")
    }

    console.log(`✅ Proxy upload complete: ${fileUrl}`)

    return NextResponse.json({
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      provider: "tmpfiles"
    })
  } catch (error) {
    console.error("❌ CRITICAL UPLOAD PROXY ERROR:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


