"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, FileText, CheckCircle, X, Download, Loader2, FileJson } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import JiraResultsDisplay from "@/components/results/JiraResultsDisplay"

export function TextExtractionSection() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [extractedText, setExtractedText] = useState<any>(null)
  const [processedData, setProcessedData] = useState<any>(null)
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null)
  const [downloadPath, setDownloadPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const sectionRef = useRef<HTMLElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const handleUpload = () => {
    // Trigger the hidden file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    
    if (fileList && fileList.length > 0) {
      const newFiles = Array.from(fileList)
      setFiles(prev => [...prev, ...newFiles])
      // Clear previous results when new files are added
      setExtractedText(null)
      setProcessedData(null)
      setSavedFilePath(null)
      setDownloadPath(null)
    }
  }

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const fileList = e.dataTransfer.files
    if (fileList && fileList.length > 0) {
      const newFiles = Array.from(fileList)
      setFiles(prev => [...prev, ...newFiles])
      // Clear previous results when new files are added
      setExtractedText(null)
      setProcessedData(null)
      setSavedFilePath(null)
      setDownloadPath(null)
    }
  }

  // Remove a file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    // Clear previous results when files change
    setExtractedText(null)
    setProcessedData(null)
    setSavedFilePath(null)
    setDownloadPath(null)
  }

  // Process files and extract text
  const extractText = async () => {
    if (files.length === 0) {
      console.log("No files selected")
      return
    }

    setIsProcessing(true)
    setActiveTab("processing")
    setSavedFilePath(null)
    setDownloadPath(null)
    setError(null)
    
    // Simulate progress
    let currentProgress = 0
    const progressInterval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(progressInterval)
      }
    }, 200)
    
    try {
      // Create FormData object with files
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      // Send files to text extraction API with timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      try {
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        
        // Store extracted text
        setExtractedText(data.results)
        
        // Process the extracted text using pandas
        const processResponse = await fetch('/api/process-extracted-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ results: data.results }),
        })
        
        if (!processResponse.ok) {
          const errorData = await processResponse.json()
          throw new Error(errorData.error || `Process API error: ${processResponse.status}`)
        }
        
        const processResult = await processResponse.json()
        
        // Store the processed data and download path
        setProcessedData(processResult.data)
        setDownloadPath(processResult.downloadPath)
        
        // Save to file in root folder (original functionality kept for backward compatibility)
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
        
        // Store the path of the saved file
        setSavedFilePath(saveResult.filePath)
        
        // Complete the process
        setTimeout(() => {
          setIsProcessing(false)
          setIsComplete(true)
          setActiveTab("results")
          clearInterval(progressInterval) // Ensure interval is cleared
        }, 500)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond.')
        } else {
          throw fetchError
        }
      }
      
    } catch (error: any) {
      console.error("Error extracting text:", error)
      setError(error.message || "An unknown error occurred")
      setIsProcessing(false)
      clearInterval(progressInterval) // Ensure interval is cleared
      
      // Show the error in the UI
      setTimeout(() => {
        setActiveTab("upload") // Go back to upload tab on error
      }, 1000)
    }
  }
  
  // Download formatted data
  const downloadFormattedData = () => {
    if (downloadPath) {
      window.open(downloadPath, '_blank')
    }
  }
  
  // Download raw extracted text as a file
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

  const resetDemo = () => {
    setIsProcessing(false)
    setProgress(0)
    setIsComplete(false)
    setActiveTab("upload")
    setFiles([])
    setExtractedText(null)
    setProcessedData(null)
    setSavedFilePath(null)
    setDownloadPath(null)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Render section data table for a specific document
  const renderSectionTable = (documentName: string, sectionData: any[]) => {
    if (!sectionData || sectionData.length === 0) {
      return (
        <div key={documentName} className="mt-4">
          <h4 className="font-medium text-lg mb-2">{documentName}</h4>
          <p className="text-muted-foreground">No structured data available for this document.</p>
        </div>
      )
    }

    return (
      <div key={documentName} className="mt-4">
        <h4 className="font-medium text-lg mb-2">{documentName}</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 bg-muted">Section</TableHead>
                <TableHead className="bg-muted">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectionData.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium align-top">{item.Section}</TableCell>
                  <TableCell className="whitespace-pre-line">{item.Details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <section ref={sectionRef} id="text-extraction" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Text Extraction</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Getting your User Stories from BRD</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Upload your Business Requirements Document (BRD) and let our AI-powered system extract and organize it into User Stories for Jira.
          </p>
        </div>

        <Card className="border border-border/50 shadow-lg max-w-4xl mx-auto">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="upload" disabled={isProcessing}>
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="processing" disabled={!isProcessing && !isComplete}>
                  <FileText className="h-4 w-4 mr-2" />
                  Processing
                </TabsTrigger>
                <TabsTrigger value="results" disabled={!isComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
                <div 
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg ${
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/25"
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <FileUp className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Upload Your Document</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Drag and drop your document or click to browse. We support PDF, Word, Excel, and plain text files.
                  </p>
                  {/* Hidden file input */}
                  <Input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.ppt,.pptx"
                    multiple
                  />
                  <Button
                    onClick={handleUpload}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <FileUp className="h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>

                {/* File Chips */}
                {files.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Selected Files:</h4>
                    <div className="flex gap-2 flex-wrap">
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

                    <Button
                      onClick={extractText}
                      className="mt-6 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Extract User Stories"}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="processing" className="mt-0">
                <div className="flex flex-col items-center justify-center p-8">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                      <h3 className="text-xl font-medium mb-2">Processing Your Documents</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Our AI is analyzing your documents and extracting requirements...
                      </p>
                      <div className="w-full max-w-md mb-4">
                        <Progress value={progress} className="h-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">{progress}% Complete</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-16 w-16 text-accent mb-4" />
                      <h3 className="text-xl font-medium mb-2">Processing Complete!</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        We've successfully extracted the requirements from your documents.
                      </p>
                      <Button onClick={() => setActiveTab("results")}>View Results</Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="results" className="mt-0">
                <div className="flex flex-col items-center p-6">
                  <CheckCircle className="h-16 w-16 text-accent mb-4" />
                  <h3 className="text-xl font-medium mb-2">Extraction Complete!</h3>
                  
                  {error && (
                    <div className="my-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md w-full">
                      <p className="font-medium">Error processing text:</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  )}
                  
                  {savedFilePath && (
                    <div className="my-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md w-full">
                      <p className="font-medium">Text extraction successful!</p>
                      <p className="text-sm mt-1">Saved to: <code className="bg-green-200 dark:bg-green-800/50 px-1 rounded">{savedFilePath}</code></p>
                    </div>
                  )}
                  
                  {/* JIRA Generator Results */}
                  {extractedText && (
                    <div className="w-full mt-6">
                      <JiraResultsDisplay extractedText={JSON.stringify(extractedText)} />
                    </div>
                  )}
                  
                  {/* Display processed data in tabular format - Now hidden by default */}
                  {processedData && (
                    <div className="w-full overflow-auto max-h-[600px] mt-6 border rounded-md p-4 hidden">
                      <h3 className="text-lg font-medium mb-4">Extracted Document Structure</h3>
                      {Object.entries(processedData).length > 0 ? (
                        Object.entries(processedData).map(([docName, sectionData]: [string, any]) => 
                          renderSectionTable(docName, sectionData)
                        )
                      ) : (
                        <p className="text-muted-foreground">No structured data available.</p>
                      )}
                    </div>
                  )}
                  
                  {/* Original raw data display (now hidden by default) */}
                  {extractedText && (
                    <div className="w-full p-4 bg-muted rounded-lg mt-4 mb-6 max-h-60 overflow-y-auto hidden">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        {JSON.stringify(extractedText, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 justify-center mt-6">
                    {downloadPath && (
                      <Button
                        onClick={downloadFormattedData}
                        className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        <FileJson className="h-4 w-4" />
                        Download Structured Data
                      </Button>
                    )}
                    
                    <Button
                      onClick={downloadExtractedText}
                      className="gap-2"
                      disabled={!extractedText}
                    >
                      <Download className="h-4 w-4" />
                      Download Raw Data
                    </Button>
                    
                    <Button variant="outline" onClick={resetDemo}>
                      Try Again
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  )
} 