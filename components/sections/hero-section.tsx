"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, FileText, Brain } from "lucide-react"
import { Chatbot } from "@/components/chat/chatbot"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div
            className={`flex flex-col justify-center space-y-4 transition-all duration-700 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              <span className="text-primary font-semibold">Barclays Hackerearth Hackathon</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Revolutionizing Requirement Engineering with <span className="gradient-text">AI</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Transform your software development process with our AI-powered requirement writing system. Extract,
                organize, and prioritize requirements automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button 
                className="gap-2 bg-gradient-to-r from-primary via-accent to-gold hover:opacity-90" 
                size="lg"
                onClick={() => setShowChatbot(true)}
              >
                <Sparkles className="h-4 w-4" />
                Try Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <FileText className="h-4 w-4" />
                Learn More
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-4 w-4 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-4 w-4 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-4 w-4 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg className="h-4 w-4 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <div className="text-sm">
                Trusted by <span className="font-medium">500+</span> development teams
              </div>
            </div>
          </div>
          <div
            className={`flex items-center justify-center transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative w-full max-w-[500px] aspect-square cursor-pointer" onClick={() => setShowChatbot(true)}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-gold/20 rounded-3xl blur-xl animate-pulse-slow"></div>
              <div className="relative bg-card border rounded-3xl shadow-xl overflow-hidden p-6 h-full animate-float transition-transform duration-300 hover:scale-[1.02]">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">ReqAI Assistant</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">I've analyzed your document and extracted 24 requirements.</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg max-w-[80%] ml-auto">
                      <p className="text-sm">Can you categorize them by priority?</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">I've categorized them using MoSCoW prioritization:</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Must-have: 8 requirements</li>
                        <li>• Should-have: 10 requirements</li>
                        <li>• Could-have: 4 requirements</li>
                        <li>• Won't-have: 2 requirements</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 relative">
                    <div className="h-10 bg-muted rounded-md flex items-center px-3">
                      <span className="text-sm text-muted-foreground">Ask a question...</span>
                    </div>
                    <Button size="icon" className="absolute right-1 top-1 h-8 w-8 bg-primary hover:bg-primary/90">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
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
