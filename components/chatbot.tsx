"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Brain, X, Paperclip, Send, FileUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

type Message = {
  role: "user" | "assistant"
  content: string
}

export function Chatbot({ 
  isExpanded = false,
  onClose,
}: { 
  isExpanded?: boolean
  onClose?: () => void 
}) {
  const [expanded, setExpanded] = useState(isExpanded)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I've analyzed your document and extracted 24 requirements."
    },
    {
      role: "user",
      content: "Can you categorize them by priority?"
    },
    {
      role: "assistant",
      content: "I've categorized them using MoSCoW prioritization:\n• Must-have: 8 requirements\n• Should-have: 10 requirements\n• Could-have: 4 requirements\n• Won't-have: 2 requirements"
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Set expanded state from props
  useEffect(() => {
    setExpanded(isExpanded)
  }, [isExpanded])

  // Function to handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
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
    }
  }

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(false)
      }, 2000)
      
      return () => clearTimeout(timeout)
    }
  }, [isTyping])

  // Handle sending a message
  const handleSend = () => {
    if (!input.trim() && files.length === 0) return
    
    // Add user message
    if (input.trim()) {
      setMessages(prev => [...prev, { role: "user", content: input }])
    }
    
    setInput("")
    
    // Reset files after sending
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(", ")
      setMessages(prev => [...prev, { 
        role: "user", 
        content: `I've uploaded: ${fileNames}` 
      }])
      setFiles([])
    }

    // Simulate assistant typing
    setIsTyping(true)
    
    // Simulate assistant response after delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: "I've received your message. How else can I help with your requirements today?" 
        }
      ])
      setIsTyping(false)
    }, 2000)
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Function to remove a file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle click on file button
  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col bg-card border rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full h-[80vh] max-h-[700px]"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">ReqAI Assistant</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {messages.map((message, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    message.role === "assistant" 
                      ? "bg-muted" 
                      : "bg-primary/10 ml-auto"
                  )}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted p-3 rounded-lg max-w-[80%]"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "400ms" }}></div>
                  </div>
                </motion.div>
              )}
              
              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90 border-2 border-dashed border-primary/50 rounded-lg z-10">
                  <div className="text-center">
                    <FileUp className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Drop your files here</h3>
                    <p className="text-muted-foreground">Upload documents to extract requirements</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* File attachments */}
            {files.length > 0 && (
              <div className="px-4 py-2 border-t border-border/50 bg-muted/50">
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-xs">
                      <FileText className="h-3 w-3 text-primary" />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 ml-1 hover:bg-background/50 rounded-full" 
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={handleFileButtonClick}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask a question..."
                    className="w-full h-10 bg-muted rounded-md flex items-center px-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-1 top-1 h-8 w-8 bg-primary hover:bg-primary/90"
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 