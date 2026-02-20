"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function DebugParamsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Debug: URL Parameters</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">useParams() Output</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(params, null, 2)}
        </pre>
        <div className="mt-4 text-sm text-gray-600">
          <p>roomId: <code className="bg-gray-200 px-2 py-1 rounded">{params.roomId as string || "(undefined)"}</code></p>
          <p>Type: <code className="bg-gray-200 px-2 py-1 rounded">{typeof params.roomId}</code></p>
          <p>Length: <code className="bg-gray-200 px-2 py-1 rounded">{String(params.roomId).length}</code></p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test Links</h2>
        <div className="space-y-4">
          <p className="text-gray-700">Try visiting these URLs to see what params you get:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <a href="/room/test123" className="text-blue-600 hover:underline">
                /room/test123
              </a>
            </li>
            <li>
              <a href="/room/undefined" className="text-blue-600 hover:underline">
                /room/undefined (literally)
              </a>
            </li>
            <li>
              <a href="/room/null" className="text-blue-600 hover:underline">
                /room/null (literally)
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">Note:</h3>
        <p className="text-yellow-700">
          If you're seeing "undefined" as the roomId, it means your URL is literally 
          <code className="mx-1 bg-yellow-100 px-2 py-1 rounded">/room/undefined</code> 
          or Next.js is not getting the param correctly.
        </p>
      </div>
    </div>
  )
}