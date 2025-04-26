"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUp, FileText, X, Download } from "lucide-react"

export function TextExtractor() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedText, setExtractedText] = useState<any>(null)
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to handle file upload button click
  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Function to handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
      // Clear previous results when new files are added
      setExtractedText(null)
      setSavedFilePath(null)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
      // Clear previous results when new files are added
      setExtractedText(null)
      setSavedFilePath(null)
    }
  }

  // Remove a file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    // Clear previous results when files change
    setExtractedText(null)
    setSavedFilePath(null)
  }

  // Process files and extract text
  const extractText = async () => {
    if (files.length === 0) {
      console.log("No files selected")
      return
    }

    setIsExtracting(true)
    setSavedFilePath(null)
    
    try {
      // Create FormData object with files
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      // Send files to text extraction API
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Log results to console
      console.log("Extracted text:")
      console.log(JSON.stringify(data.results, null, 2))
      
      // Save to file in root folder
      const saveResponse = await fetch('/api/save-extracted-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results: data.results }),
      })
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save extracted text: ${saveResponse.status}`)
      }
      
      const saveResult = await saveResponse.json()
      console.log("Saved extracted text to:", saveResult.filePath)
      
      // Store the path of the saved file
      setSavedFilePath(saveResult.filePath)
      
      // Store extracted text for potential download
      setExtractedText(data.results)
      
    } catch (error) {
      console.error("Error extracting text:", error)
    } finally {
      setIsExtracting(false)
    }
  }
  
  // Download extracted text as a file
  const downloadExtractedText = () => {
    if (!extractedText) return
    
    const blob = new Blob([JSON.stringify(extractedText, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted_text.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Text Extractor</h2>
      
      {/* File Upload Area */}
      <div 
        className={`relative border-2 ${isDragging ? 'border-dashed border-primary/70' : 'border-dashed border-muted-foreground/25'} 
                    rounded-lg p-8 transition-all min-h-[200px] flex flex-col items-center justify-center`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileUp className="h-12 w-12 mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drop files here</p>
        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
        
        <Button 
          onClick={handleFileButtonClick}
          variant="outline"
        >
          Select Files
        </Button>
        
        <Input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />
        
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg bg-background/50 flex items-center justify-center">
            <div className="text-center">
              <FileUp className="h-12 w-12 mx-auto mb-4 text-primary/70" />
              <p className="text-lg font-medium">Drop files here</p>
            </div>
          </div>
        )}
      </div>
      
      {/* File Chips */}
      {files.length > 0 && (
        <div className="my-4 flex gap-2 flex-wrap">
          {files.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-muted px-3 py-2 rounded-full"
            >
              <FileText className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-background rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Success Message */}
      {savedFilePath && (
        <div className="my-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md">
          <p className="font-medium">Text extraction successful!</p>
          <p className="text-sm mt-1">Saved to: <code className="bg-green-200 dark:bg-green-800/50 px-1 rounded">{savedFilePath}</code></p>
          <p className="text-xs mt-2">File is located in the project root directory.</p>
        </div>
      )}
      
      {/* Extract Button */}
      <div className="flex flex-col gap-2">
        {files.length > 0 && (
          <Button 
            onClick={extractText} 
            className="w-full mt-4"
            disabled={isExtracting}
          >
            {isExtracting ? "Extracting..." : "Extract Text"}
          </Button>
        )}
        
        {extractedText && (
          <Button 
            onClick={downloadExtractedText}
            variant="outline"
            className="w-full mt-2 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Extracted Text
          </Button>
        )}
      </div>
      
      {/* Help Text */}
      <p className="text-sm text-muted-foreground mt-6">
        Supported file types: PDF, Word documents (.doc, .docx), PowerPoint presentations (.ppt, .pptx), and text-based files.
        Extracted text will be saved to a file in the project root.
      </p>
    </div>
  )
} 