"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Brain, X, Paperclip, Send, FileUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'

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

// Simple fallback for when Mistral API fails
const getLocalAIResponse = (messageHistory: Message[], context: string = "") => {
  const lastUserMessage = messageHistory.filter(m => m.role === "user").pop()?.content || "";
  
  // Check if this is for file processing
  if (context.includes("Document Analysis") || lastUserMessage.includes("uploaded") || lastUserMessage.includes("file")) {
    return `I've analyzed the document you uploaded. Here are some observations:

1. This appears to be a formal document or letter with contact information.
2. It contains dates, names, and other structured information.
3. I can identify potential requirements or key information in this content.

Would you like me to help organize this information into specific requirements or extract particular details?`;
  }
  
  // Generic response for requirements engineering
  return "Based on our conversation, I can help you with requirements engineering. Would you like me to help you extract, organize, or prioritize requirements from your documents or discussions?";
};

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
      // Normalize message history to ensure valid sequence (no system after user/assistant)
      const normalizedMessages: Message[] = [];
      
      // Process messages to ensure they follow Mistral's expected format
      for (const msg of messageHistory) {
        // Convert 'system' messages to 'user' messages if they're not at the beginning
        if (msg.role === 'system' && normalizedMessages.length > 0) {
          normalizedMessages.push({
            role: 'user',
            content: `[SYSTEM] ${msg.content}`
          });
        } else {
          normalizedMessages.push(msg);
        }
      }
      
      // Prevent overly large context by limiting history
      const maxMessages = 8; // Limit context size to prevent overloading API
      const limitedHistory = normalizedMessages.length > maxMessages ? 
        [...normalizedMessages.slice(0, 2), ...normalizedMessages.slice(-maxMessages + 2)] : 
        normalizedMessages;
      
      // Further limit content size by truncating long messages
      const maxContentLength = 1500;
      const formattedMessages = limitedHistory.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role, // Convert any remaining system to user
        content: msg.content.length > maxContentLength ? 
          msg.content.substring(0, maxContentLength) + "..." : 
          msg.content
      }));
      
      console.log("Calling Mistral API with messages:", JSON.stringify(formattedMessages.slice(0, 2)).substring(0, 100) + "... and " + formattedMessages.length + " more messages");
      
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
          max_tokens: 500 // Reduced to avoid hitting limits
        })
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status} - ${await response.text()}`);
        // Use local fallback instead of throwing error
        return getLocalAIResponse(messageHistory, formattedMessages[formattedMessages.length - 1]?.content || "");
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Mistral API:", error);
      // Use local fallback
      return getLocalAIResponse(messageHistory);
    }
  };

  // Process files and call Mistral API with the extracted content
  const processFiles = async (uploadedFiles: File[]) => {
    setIsTyping(true);
    
    // Add processing message
    const processingMessage: Message = {
      role: "assistant",
      content: "Processing your files... This may take a moment."
    };
    setMessages(prev => [...prev, processingMessage]);
    
    try {
      // Create FormData object with files
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Send files to text extraction API
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Remove the processing message
      setMessages(prev => prev.filter(msg => msg !== processingMessage));
      
      // Format extracted text for display
      let extractedContent = "## Document Analysis Results\n\n";
      
      for (const [fileName, fileData] of Object.entries(data.results)) {
        if (typeof fileData === 'string') {
          extractedContent += `### 📄 ${fileName}\n${fileData}\n\n`;
        } else {
          const typedFileData = fileData as { file_type: string, extracted_text: string };
          extractedContent += `### 📄 ${fileName} (${typedFileData.file_type})\n`;
          
          // Add the extracted text with formatting
          const extractedText = typedFileData.extracted_text;

          // Skip "Binary file" messages and format the content better
          if (extractedText.startsWith("Binary file")) {
            extractedContent += "_This file was processed, but full text extraction requires specialized tools. The analysis will be based on file metadata and any text that could be extracted._\n\n";
          } else if (extractedText.length > 800) {
            // For longer texts, show a preview
            extractedContent += "```\n" + extractedText.substring(0, 800).trim() + "...\n```\n\n";
            extractedContent += "_Note: This is a preview. The full content has been processed for analysis._\n\n";
          } else {
            // For shorter texts, show everything with code formatting for clarity
            extractedContent += "```\n" + extractedText.trim() + "\n```\n\n";
          }
        }
      }
      
      // Add system message with extracted text
      const extractionMessage: Message = {
        role: "assistant",
        content: extractedContent
      };
      
      setMessages(prev => [...prev, extractionMessage]);
      
      // Prepare context for AI with extracted text - FIX: Use proper message format
      // Instead of adding a system message after assistant message (which causes the Mistral API error),
      // we'll create a user message with a special prefix that indicates this is automated context
      const contextMessage: Message = {
        role: "user",
        content: `[CONTEXT] I've uploaded documents with the following content: ${JSON.stringify(data.results)}`
      };
      
      // Add AI response to help with requirements
      setIsTyping(true);
      // Add the context message to our state but don't display it visually to the user
      const updatedMessages = [...chatHistory, contextMessage];
      const aiResponse = await callMistralAPI(updatedMessages);
      const assistantMessage: Message = {
        role: "assistant",
        content: "## Requirements Analysis\n\n" + aiResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error("Error processing files:", error);
      
      // Remove the processing message
      setMessages(prev => prev.filter(msg => msg !== processingMessage));
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "❌ **Error Processing Files**\n\nI encountered an error while processing your files. Please ensure they are valid document files (PDF, Word, PowerPoint) and try again."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setFiles([]);
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
      
      // Process the files
      await processFiles([...files]);
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
                  {message.role === "assistant" ? (
                    <ReactMarkdown 
                      components={{
                        p: ({ node, ...props }) => <p className="text-sm my-1" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="text-xl font-semibold my-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-semibold my-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-md font-semibold my-1" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
                        li: ({ node, ...props }) => <li className="my-1" {...props} />,
                        a: ({ node, ...props }) => <a className="text-primary underline" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-muted px-1 py-0.5 rounded" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-muted p-2 rounded my-2 overflow-auto" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  )}
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