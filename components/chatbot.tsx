"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Brain, X, Paperclip, Send, FileUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

// Store chat history outside the component to persist across sessions
let chatHistory: Message[] = [
  {
    role: "assistant",
    content: "Hello! I'm the ReqAI assistant. How can I help you extract and manage requirements today?"
  }
];

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

// Mistral AI configuration with valid API key
const MISTRAL_API_KEY = "0zjmsSJLjr0dvpgoN7l0ivkBCDQ5DgtL";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export function Chatbot({ 
  isExpanded = false,
  onClose,
}: { 
  isExpanded?: boolean
  onClose?: () => void 
}) {
  const [expanded, setExpanded] = useState(isExpanded)
  const [messages, setMessages] = useState<Message[]>(chatHistory)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Reset chat when opened
  useEffect(() => {
    if (isExpanded) {
      // If chatHistory is empty (first time), add initial message
      if (chatHistory.length === 0) {
        chatHistory = [
          {
            role: "assistant",
            content: "Hello! I'm the ReqAI assistant. How can I help you extract and manage requirements today?"
          }
        ];
      }
      setMessages(chatHistory);
    }
  }, [isExpanded]);
  
  // Set expanded state from props
  useEffect(() => {
    setExpanded(isExpanded)
  }, [isExpanded])

  // Update chat history when messages change
  useEffect(() => {
    chatHistory = messages;
  }, [messages]);

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

  // Call Mistral AI API
  const callMistralAPI = async (messageHistory: Message[]) => {
    try {
      // Format messages for API
      const formattedMessages = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call Mistral API with fetch
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-small",
          messages: formattedMessages,
          temperature: 0.7,
          top_p: 1,
          max_tokens: 800
        })
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Mistral API:", error);
      return "I'm having trouble connecting to my knowledge base. Please try again in a moment. If you have specific requirements questions, I'd still be happy to assist you with my general knowledge about requirements engineering.";
    }
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;
    
    // Add user message for text input
    if (input.trim()) {
      const userMessage = { role: "user" as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      
      // Start typing indicator
      setIsTyping(true);
      
      // Prepare messages for API call
      const updatedMessages = [...chatHistory, userMessage];
      
      // Call Mistral API
      try {
        const aiResponse = await callMistralAPI(updatedMessages);
        
        // Add AI response
        const assistantMessage = { role: "assistant" as const, content: aiResponse };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error getting response:", error);
        // Add fallback response
        const assistantMessage = { 
          role: "assistant" as const, 
          content: "I apologize, but I'm having trouble processing your request at the moment. Let me know if you'd like to try again or have a different question about requirements engineering." 
        };
        setMessages(prev => [...prev, assistantMessage]);
      } finally {
        setIsTyping(false);
      }
    }
    
    // Handle file uploads
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(", ");
      const fileUploadMessage = { 
        role: "user" as const, 
        content: `I've uploaded the following files: ${fileNames}`
      };
      
      setMessages(prev => [...prev, fileUploadMessage]);
      
      // Start typing indicator
      setIsTyping(true);
      
      // Prepare message about the uploaded files for the AI
      const updatedMessages = [...chatHistory, fileUploadMessage];
      
      // Call Mistral API with context about the files
      try {
        const aiResponse = await callMistralAPI(updatedMessages);
        
        // Add AI response
        const assistantMessage = { 
          role: "assistant" as const, 
          content: aiResponse
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error getting response for files:", error);
        // Add fallback response
        const assistantMessage = { 
          role: "assistant" as const, 
          content: "I've received your files. While I can't directly analyze their contents at the moment, I can help you extract and organize requirements if you tell me about what they contain." 
        };
        setMessages(prev => [...prev, assistantMessage]);
      } finally {
        setFiles([]);
        setIsTyping(false);
      }
    }
  };

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

  // Function to clear chat history
  const clearChat = () => {
    const initialMessage = {
      role: "assistant" as const,
      content: "Hello! I'm the ReqAI assistant. How can I help you extract and manage requirements today?"
    };
    chatHistory = [initialMessage];
    setMessages([initialMessage]);
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
                <h3 className="font-semibold">
                  ReqAI Assistant 
                  <span className="text-xs text-muted-foreground ml-1">
                    (Powered by Mistral AI)
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={clearChat}
                >
                  Clear Chat
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                  transition={{ duration: 0.3, delay: 0.05 }}
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
                    disabled={isTyping || (!input.trim() && files.length === 0)}
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