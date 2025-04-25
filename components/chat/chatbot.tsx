"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Brain, X, Paperclip, Send, FileUp, FileText, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import { useAuth } from "@/components/auth/AuthContext"
import { LoginModal } from "@/components/auth/LoginModal"

// Store chat history outside the component to persist across sessions
let chatHistory: Message[] = [];

// Default system prompt - controls how Mistral behaves
const DEFAULT_SYSTEM_PROMPT = `You are a requirements analyst focused on crafting SMART (Specific, Measurable, Achievable, Relevant, Time-bound) requirements. Given the input below, generate one precise, open-ended follow-up question to clarify or strengthen the requirement.

Requirement ID: [reqId] 
Type: [type]  
Requirement Text: [requirement]
Priority: [priority]

Your question should aim to identify or explore one of the following:  
- Gaps in detail (e.g., missing quantities, thresholds, or operational parameters)  
- Ambiguities in wording (e.g., subjective terms like "quick," "intuitive," or "reliable")  
- Clear and testable acceptance criteria (e.g., how completion or success will be verified)  
- Constraints, edge cases, or environmental factors that could impact implementation

Only return the single follow-up question. Do not include any introductory text or explanation.

Examples for inspiration:  
- What does "minimal downtime" specifically mean in terms of hours or minutes?  
- How will we determine that the interface is "intuitive" for users?  
- Are there any scenarios where this functionality should be disabled?  
- What is the maximum acceptable delay between input and system response?`;

// Helper function to create a requirements prompt with actual data
const createRequirementsPrompt = (reqId: string, type: string, requirement: string, priority: string) => {
  return DEFAULT_SYSTEM_PROMPT
    .replace('[reqId]', reqId)
    .replace('[type]', type)
    .replace('[requirement]', requirement)
    .replace('[priority]', priority);
};

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
  systemPrompt = DEFAULT_SYSTEM_PROMPT, // Allow custom system prompt to be passed as prop
  isRequirementsAnalyst = false, // Flag to use requirements analyst mode
  requirementData = null, // Data for requirement analysis
}: { 
  isExpanded?: boolean
  onClose?: () => void 
  systemPrompt?: string
  isRequirementsAnalyst?: boolean // Flag for requirements mode
  requirementData?: { reqId: string, type: string, requirement: string, priority: string } | null
}) {
  const [expanded, setExpanded] = useState(isExpanded)
  const [messages, setMessages] = useState<Message[]>(chatHistory)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showExportNotification, setShowExportNotification] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  
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
      // Always include the system prompt at the beginning if not already present
      let messagesWithSystemPrompt = [...messageHistory];
      
      // Check if the first message is a system message
      if (messagesWithSystemPrompt.length === 0 || messagesWithSystemPrompt[0].role !== "system") {
        // Get the appropriate system prompt based on mode
        let promptContent = systemPrompt;
        
        if (isRequirementsAnalyst && requirementData) {
          // Use the formatted requirements prompt with actual data
          promptContent = createRequirementsPrompt(
            requirementData.reqId,
            requirementData.type,
            requirementData.requirement,
            requirementData.priority
          );
        }
        
        // Insert the system prompt at the beginning
        messagesWithSystemPrompt = [
          { role: "system", content: promptContent },
          ...messagesWithSystemPrompt
        ];
      }
      
      // Format messages for the API
      const formattedMessages = messagesWithSystemPrompt.map(msg => ({
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
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status} - ${await response.text()}`);
        throw new Error("API request failed");
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Mistral API:", error);
      throw error;
    }
  };

  // Process files and call Mistral API with the extracted content
  const processFiles = async (uploadedFiles: File[]) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setIsTyping(true);
    
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
      
      // Create a context message with the extracted text
      const contextMessage: Message = {
        role: "system",
        content: `Extracted content from files: ${JSON.stringify(data.results)}`
      };
      
      // Add the context message to our state (not visible to user)
      const updatedMessages = [...messages, contextMessage];
      
      // Use the existing input as the prompt or use a default prompt
      const promptText = input.trim() || "Analyze the content from these files";
      const userMessage: Message = {
        role: "user",
        content: promptText
      };
      
      // Add user message to the UI and set messages
      setMessages(prev => [...prev, userMessage]);
      
      // Call Mistral with the prompt and include context
      const aiResponse = await callMistralAPI([...updatedMessages, userMessage]);
      
      // Add AI response
      const assistantMessage = { 
        role: "assistant" as const, 
        content: aiResponse 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save the assistant message to the responses file
      try {
        await fetch('/api/save-chat-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: assistantMessage }),
        });
      } catch (saveError) {
        console.error('Error saving chat response:', saveError);
      }
      
      setInput("");
      
    } catch (error) {
      console.error("Error processing files:", error);
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "Error processing files. Please try again."
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to responses file
      try {
        await fetch('/api/save-chat-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: errorMessage }),
        });
      } catch (saveError) {
        console.error('Error saving chat error response:', saveError);
      }
    } finally {
      setIsTyping(false);
      setFiles([]);
    }
  };

  const handleSend = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!input.trim() && files.length === 0) return;
      
    // If files are present, process them
    if (files.length > 0) {
      await processFiles(files);
      return;
    }
    
    // Handle text-only input
    setIsTyping(true);
    
    try {
      // Add user message
      const userMessage = { role: "user" as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      
      // Call Mistral API
      const aiResponse = await callMistralAPI([...messages, userMessage]);
      
      // Add AI response
      const assistantMessage = { 
        role: "assistant" as const, 
        content: aiResponse 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save the assistant message to the responses file
      try {
        await fetch('/api/save-chat-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: assistantMessage }),
        });
      } catch (saveError) {
        console.error('Error saving chat response:', saveError);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, an error occurred. Please try again."
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to responses file
      try {
        await fetch('/api/save-chat-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: errorMessage }),
        });
      } catch (saveError) {
        console.error('Error saving chat error response:', saveError);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearChat = async () => {
    setMessages([]);
    chatHistory = [];
    
    // Clear the chat responses file
    try {
      await fetch('/api/clear-chat-responses', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error clearing chat responses:', error);
    }
  };
  
  // If not expanded, show the floating chatbot button
  if (!expanded) {
    return (
      <motion.button
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-primary via-accent to-gold text-white shadow-lg z-50"
        onClick={() => {
          if (!user) {
            setShowLoginModal(true);
            return;
          }
          setExpanded(true);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="h-6 w-6" />
      </motion.button>
    );
  }

  // If a user is not authenticated, show the login prompt
  if (!user && expanded) {
    return (
      <>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-lg w-full max-w-md p-6 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-6">Please log in to use the AI chatbot.</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowLoginModal(true)}
                className="gap-2 bg-gradient-to-r from-primary via-accent to-gold hover:opacity-90"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => {
          setShowLoginModal(false);
          if (onClose) onClose();
        }} />
      </>
    );
  }

  // Function to export chat responses to Excel
  const exportResponses = async () => {
    try {
      // Filter out system messages for export
      const messagesToExport = messages.filter(m => m.role !== "system");
      
      if (messagesToExport.length === 0) {
        alert("No messages to export");
        return;
      }
      
      // Call the API to export messages
      const response = await fetch('/api/export-chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesToExport }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export messages');
      }
      
      // Show notification
      setShowExportNotification(true);
      setTimeout(() => setShowExportNotification(false), 3000);
      
    } catch (error) {
      console.error('Error exporting messages:', error);
      alert('Failed to export messages: ' + (error as Error).message);
    }
  };

  // Full chatbot UI
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4",
          expanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card border shadow-lg rounded-lg w-full max-w-4xl h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">ReqAIze Assistant</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportResponses} 
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Export
                  </Button>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Export Success Notification */}
              <AnimatePresence>
                {showExportNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-md shadow-md"
                  >
                    Requirements extracted successfully
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                    <Brain className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">How can I help you?</h3>
                    <p className="max-w-md text-sm">
                      I'm your AI assistant specialized in requirements analysis. Ask me questions or upload documents for analysis.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.filter(m => m.role !== "system").map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex gap-3 p-4 rounded-lg",
                          message.role === "assistant" 
                            ? "bg-muted" 
                            : "bg-primary-foreground/50 border"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                          {message.role === "assistant" ? (
                            <Brain className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="bg-primary h-full w-full rounded-full flex items-center justify-center text-white">
                              U
                            </div>
                          )}
                        </div>
                        <div className="prose prose-sm dark:prose-invert flex-1 break-words overflow-hidden">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
                
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
                <div className="p-3 border-t flex gap-2 flex-wrap">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button 
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-background rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Footer */}
              <div className="p-4 border-t">
                <div className="relative flex items-center">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  <button 
                    onClick={handleFileButtonClick}
                    className="absolute left-3 p-1 hover:bg-muted rounded-full text-muted-foreground"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    className="w-full rounded-full border bg-background px-12 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isTyping}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isTyping || (!input.trim() && files.length === 0)}
                    className={cn(
                      "absolute right-3 p-1 rounded-full",
                      (!input.trim() && files.length === 0)
                        ? "text-muted-foreground" 
                        : "bg-primary text-white"
                    )}
                    aria-label="Send message"
                  >
                    {isTyping ? (
                      <div className="h-5 w-5 flex items-center justify-center">
                        <div className="animate-spin h-3 w-3 border-2 border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Extra controls */}
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <button onClick={clearChat} className="hover:text-primary">
                    Clear chat
                  </button>
                  <div>
                    Powered by Mistral AI
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
} 