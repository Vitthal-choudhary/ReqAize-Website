"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, Brain, X, Paperclip, Send, FileUp, FileText, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import { useAuth } from "@/components/auth/AuthContext"
import { LoginModal } from "@/components/auth/LoginModal"
import { Document, Paragraph, Packer, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';

// Store chat history outside the component to persist across sessions
let chatHistory: Message[] = [];

// Default system prompt - controls how Mistral behaves
const DEFAULT_SYSTEM_PROMPT = `You are SMART Requirements Analyst, an AI designed to gather comprehensive project requirements through thoughtful conversation. Your goal is to collect all necessary information to create a detailed Business Requirements Document (BRD).

PROCESS:
1. Begin by asking about the project's general purpose and objectives - ONE QUESTION AT A TIME
2. For each response, ask a relevant follow-up question to deepen understanding
3. Cover all required areas for the BRD through sequential questioning
4. Maintain context throughout the conversation
5. Once sufficient information is gathered, compile a detailed BRD using the template structure

QUESTIONING FRAMEWORK:
- Ask only ONE question at a time and wait for a response
- Follow a logical progression through these areas:
  * Project background and objectives
  * Stakeholder identification
  * Functional requirements with SMART analysis
  * Constraints and limitations
  * Timeline and milestones
  * Budget considerations
  * Project phases and implementation approach
  * RAID analysis components

SMART ANALYSIS TECHNIQUE:
For each requirement mentioned, ask targeted follow-up questions to ensure it is:
- Specific: "Can you describe exactly what this feature should do?"
- Measurable: "How will we measure successful implementation?"
- Achievable: "What potential barriers exist to implementing this?"
- Relevant: "How does this align with your overall objectives?"
- Time-bound: "When does this need to be implemented?"

RAID ANALYSIS TECHNIQUE:
- Risks: Ask about potential obstacles and their likelihood
- Assumptions: Clarify any premises the project relies upon
- Issues: Identify existing problems that need resolution
- Dependencies: Determine what external factors the project depends on

BRD COMPILATION:
After gathering sufficient information, compile a comprehensive BRD with these sections:
- Objective
- Executive Summary
- Stakeholders
- Functional Requirements
- Constraints
- Timeline and Deadlines
- Budget
- Project Phases
- RAID Analysis

Begin by asking a single, open-ended question about the general purpose of the project.
`;

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
  const [waitingForResponse, setWaitingForResponse] = useState(false)
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

      // Send files to text extraction API with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        // Send files to text extraction API
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
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
        setWaitingForResponse(true);
        
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
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond.');
        } else {
          throw fetchError;
        }
      }
      
    } catch (error) {
      console.error("Error processing files:", error);
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: `Error processing files: ${(error as Error).message || "Unknown error occurred"}. Please try again or try a different file.`
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

  // Function to export the last assistant response as BRD
  const exportBRD = () => {
    const assistantMessages = messages.filter(m => m.role === "assistant");
    
    if (assistantMessages.length === 0) {
      alert("No assistant responses to export");
      return;
    }
    
    // Get the last assistant message
    const lastResponse = assistantMessages[assistantMessages.length - 1].content;
    
    // Remove markdown formatting and asterisks
    const cleanContent = lastResponse.replace(/\\/g, '').replace(/\*/g, '');
    
    // Parse content into sections
    const sections = parseContentIntoSections(cleanContent);
    
    // Create document with title
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "BUSINESS REQUIREMENTS DOCUMENT",
            heading: HeadingLevel.HEADING_1,
            alignment: 'center',
            spacing: {
              after: 200
            }
          }),
          // Main content table with all sections
          createStructuredTable(sections)
        ],
      }],
    });
    
    // Generate Word document as a blob
    Packer.toBlob(doc).then((blob: Blob) => {
      // Save the blob as a file with a descriptive name
      saveAs(blob, "Business_Requirements_Document.docx");
      
      // Show notification
      setShowExportNotification(true);
      setTimeout(() => setShowExportNotification(false), 3000);
    });
  };
  
  // Helper function to parse content into sections
  const parseContentIntoSections = (content: string): Record<string, string> => {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    
    let currentSection = '';
    let currentContent: string[] = [];
    
    // Common section headers in requirements documents
    const sectionHeaders = [
      'Objective', 'Executive Summary', 'Stakeholders', 'Functional Requirements', 
      'Non-Functional Requirements', 'Constraints', 'Timeline', 'Budget', 
      'Project Phases', 'RAID Analysis', 'Risks', 'Assumptions', 'Issues',
      'Dependencies', 'Business Rules', 'Definitions'
    ];
    
    // Process each line
    lines.forEach(line => {
      // Check if this line is a section header
      const headerMatch = line.match(/^#+\s+(.+)/) || line.match(/^([A-Z][a-zA-Z\s]+):/);
      const isHeader = headerMatch || sectionHeaders.some(header => 
        line.toLowerCase().includes(header.toLowerCase() + ':') || 
        line.toLowerCase() === header.toLowerCase()
      );
      
      if (isHeader) {
        // Found a new section
        
        // Save the previous section if we have one
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        
        // Extract section name
        if (headerMatch && headerMatch[1]) {
          currentSection = headerMatch[1].replace(/:/g, '').trim();
        } else {
          // Try to find which section header is in the line
          const matchedHeader = sectionHeaders.find(h => 
            line.toLowerCase().includes(h.toLowerCase() + ':') || 
            line.toLowerCase() === h.toLowerCase()
          );
          currentSection = matchedHeader || 'Miscellaneous';
        }
          
        // Reset content collection
        currentContent = [];
      } else if (line.trim() && currentSection) {
        // Add line to current section
        currentContent.push(line.trim());
      }
    });
    
    // Add the last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }
    
    return sections;
  };
  
  // Helper function to create a structured table for the document
  const createStructuredTable = (sections: Record<string, string>): Table => {
    // Create rows for the table
    const rows: TableRow[] = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 20,
              type: WidthType.PERCENTAGE,
            },
            children: [
              new Paragraph({
                text: "Section",
                style: "strong",
              })
            ],
            shading: {
              fill: "F2F2F2",
            },
          }),
          new TableCell({
            width: {
              size: 80,
              type: WidthType.PERCENTAGE,
            },
            children: [
              new Paragraph({
                text: "Details",
                style: "strong",
              })
            ],
            shading: {
              fill: "F2F2F2",
            },
          }),
        ],
      }),
    ];
    
    // Add each section to the rows array
    Object.keys(sections).forEach(sectionName => {
      const content = sections[sectionName];
      
      // Format section name to ensure correct capitalization
      // Convert first letter to uppercase and rest to lowercase if it's all uppercase
      const formattedSectionName = sectionName.replace(/^\w/, c => c.toUpperCase());
      
      // Add section row to the rows array
      rows.push(
        new TableRow({
          children: [
            // First column - Section name
            new TableCell({
              width: {
                size: 20,
                type: WidthType.PERCENTAGE,
              },
              children: [
                new Paragraph({
                  text: formattedSectionName,
                  style: "strong",
                }),
              ],
              verticalAlign: VerticalAlign.TOP, // Align text to top
            }),
            // Second column - Content
            new TableCell({
              width: {
                size: 80,
                type: WidthType.PERCENTAGE,
              },
              children: processContentForCell(content),
              verticalAlign: VerticalAlign.TOP, // Align text to top
            }),
          ],
        })
      );
    });
    
    // Create the table with all rows
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: rows,
    });
  };
  
  // Helper function to process content text into appropriate paragraphs
  const processContentForCell = (content: string): Paragraph[] => {
    const paragraphs: Paragraph[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.trim()) {
        // Handle bullet points that start with dash
        if (line.match(/^\s*-\s+/)) {
          paragraphs.push(
            new Paragraph({
              text: line, // Keep the dash for the exact formatting in the screenshot
              spacing: {
                before: 80,
                after: 80,
              }
            })
          );
        } 
        // Format numbered lists
        else if (line.match(/^\s*\d+[\.)\]]\s+/)) {
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: {
                before: 80,
                after: 80,
              }
            })
          );
        } 
        // Regular text
        else {
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: {
                after: 120, // Add spacing after paragraphs
              }
            })
          );
        }
      }
    });
    
    return paragraphs;
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportBRD()} 
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    EXPORT BRD
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