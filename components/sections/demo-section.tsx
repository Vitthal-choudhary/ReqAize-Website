"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, FileText, CheckCircle, FileQuestion, ArrowRight, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function DemoSection() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

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
    const files = event.target.files
    
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    // Start processing after file is selected
    setIsProcessing(true)
    
    // Simulate progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsProcessing(false)
          setIsComplete(true)
          setActiveTab("results")
        }, 500)
      }
    }, 200)
  }

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
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const resetDemo = () => {
    setIsProcessing(false)
    setProgress(0)
    setIsComplete(false)
    setActiveTab("upload")
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const requirements = [
    {
      id: 1,
      text: "The system shall allow users to upload documents in various formats (PDF, DOCX, TXT).",
      type: "Functional",
      priority: "Must-have",
      status: "Approved",
    },
    {
      id: 2,
      text: "The system shall extract requirements automatically using AI algorithms.",
      type: "Functional",
      priority: "Must-have",
      status: "Approved",
    },
    {
      id: 3,
      text: "The system shall categorize requirements as functional or non-functional.",
      type: "Functional",
      priority: "Should-have",
      status: "Pending",
    },
    {
      id: 4,
      text: "The system shall prioritize requirements using the MoSCoW method.",
      type: "Functional",
      priority: "Should-have",
      status: "Approved",
    },
    {
      id: 5,
      text: "The system shall have a response time of less than 2 seconds for all operations.",
      type: "Non-functional",
      priority: "Could-have",
      status: "Pending",
    },
    {
      id: 6,
      text: "The system shall support concurrent editing by multiple users.",
      type: "Functional",
      priority: "Must-have",
      status: "Approved",
    },
  ]

  return (
    <section ref={sectionRef} id="demo" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Interactive Demo</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">See ReqAI in Action</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Experience how our AI-powered system extracts and organizes requirements from your documents.
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
                  ref={dropZoneRef}
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
                  <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Upload Your Document</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Drag and drop your document or click to browse. We support PDF, Word, Excel, and plain text files.
                  </p>
                  {/* Hidden file input */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.txt"
                  />
                  <Button
                    onClick={handleUpload}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <FileUp className="h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="processing" className="mt-0">
                <div className="flex flex-col items-center justify-center p-8">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                      <h3 className="text-xl font-medium mb-2">Processing Your Document</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Our AI is analyzing your document and extracting requirements...
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
                        We've successfully extracted the requirements from your document.
                      </p>
                      <Button onClick={() => setActiveTab("results")} className="gap-2">
                        View Results
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="results" className="mt-0">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Extracted Requirements</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        Must-have
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                        Should-have
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gold"></div>
                        Could-have
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {requirements.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 border rounded-lg flex items-start gap-4 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 ${
                            req.priority === "Must-have"
                              ? "bg-primary"
                              : req.priority === "Should-have"
                                ? "bg-accent"
                                : "bg-gold"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="mb-2">{req.text}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 bg-muted rounded-full">{req.type}</span>
                            <span className="px-2 py-1 bg-muted rounded-full">{req.priority}</span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                req.status === "Approved" ? "bg-accent/20 text-accent" : "bg-gold/20 text-gold"
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                        </div>
                        {req.status === "Pending" && (
                          <Button variant="outline" size="sm" className="shrink-0">
                            Approve
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={resetDemo}>
                      Start Over
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <FileText className="h-4 w-4" />
                      Generate Report
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
