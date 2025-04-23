"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Brain } from "lucide-react"
import { Chatbot } from "@/components/chatbot"
import { cn } from "@/lib/utils"

export function ChatbotPreview() {
  const [showChatbot, setShowChatbot] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Blinking cursor animation
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (previewRef.current) {
      observer.observe(previewRef.current)
    }

    return () => {
      if (previewRef.current) {
        observer.unobserve(previewRef.current)
      }
    }
  }, [])

  return (
    <section ref={previewRef} id="demo" className="py-20 relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Interactive Demo</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Try ReqAI Chatbot
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Experience our AI chatbot that can help you extract, organize, and prioritize requirements
          </p>
        </div>

        <div 
          className={cn(
            "transition-all duration-700 transform",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-8">
            <Button 
              onClick={() => setShowChatbot(true)} 
              className="gap-2 bg-gradient-to-r from-primary via-accent to-gold hover:opacity-90"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Try Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <div className="relative w-full max-w-[500px] aspect-square mx-auto" onClick={() => setShowChatbot(true)}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-gold/20 rounded-3xl blur-xl animate-pulse-slow"></div>
              <div className="relative bg-card border rounded-3xl shadow-xl overflow-hidden h-full animate-float cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">ReqAI Assistant</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">Hello! I'm the ReqAI chatbot. How can I help you with requirements today?</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg max-w-[80%] ml-auto">
                      <p className="text-sm">I need help extracting requirements from my document.</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">I can help you extract, categorize and prioritize requirements.</p>
                    </div>
                  </div>
                  <div className="mt-4 relative">
                    <div className="h-10 bg-muted rounded-md flex items-center px-3">
                      <span className="text-sm text-muted-foreground">Ask a question...{cursorVisible && <span className="inline-block w-2 h-4 bg-primary/70 ml-1 animate-pulse"></span>}</span>
                    </div>
                    <Button size="icon" className="absolute right-1 top-1 h-8 w-8 bg-primary hover:bg-primary/90">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Overlay hint */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xl font-bold px-6 py-3 bg-primary/80 rounded-full shadow-xl">
                      Click to Try Demo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Chatbot */}
      {showChatbot && (
        <Chatbot 
          isExpanded={true} 
          onClose={() => setShowChatbot(false)}
        />
      )}
    </section>
  )
} 