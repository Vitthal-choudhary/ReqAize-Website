"use client"

import { useEffect, useState } from "react"
import { TextExtractor } from "@/components/TextExtractor"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function TextExtractorPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    // Mark as loaded on client-side
    setIsLoaded(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">File Text Extraction</h1>
        {isLoaded && <TextExtractor />}
      </div>
      <Footer />
    </div>
  )
} 