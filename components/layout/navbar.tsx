"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Brain, Sparkles, CircuitBoard } from "lucide-react"
import { Chatbot } from "../chat/chatbot"
import { LoginButton } from "../auth/LoginButton"
import { useAuth } from "../auth/AuthContext"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add smooth scroll function for navigation
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, closeSheet = false) => {
    e.preventDefault()
    
    // Close mobile nav sheet if needed
    if (closeSheet) {
      setIsSheetOpen(false)
    }
    
    // If href is # or empty, scroll to top
    if (href === "#" || href === "") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
      return
    }
    
    // If it's a full page navigation (starts with "/"), use router
    if (href.startsWith("/")) {
      router.push(href)
      if (closeSheet) {
        setIsSheetOpen(false)
      }
      return
    }
    
    // Otherwise scroll to the section
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      })
    }
  }

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Demo", href: "#demo" },
    { name: "Collaboration", href: "#collaboration" },
    { name: "Technology", href: "#tech-stack" },
    { name: "Security", href: "#security" },
  ]

  const handleDemoClick = () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    setShowChatbot(true)
    if (isSheetOpen) {
      setIsSheetOpen(false)
    }
  }

  const handleJiraNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/jira-integration')
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={(e) => scrollToSection(e as any, "#")}
        >
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">
            Req<span className="text-accent">AI</span>ze
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={(e) => scrollToSection(e, link.href)}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="hidden md:flex items-center gap-2 text-blue-500 border-blue-500 hover:bg-blue-50 hover:text-blue-600"
            onClick={handleJiraNavigation}
          >
            <CircuitBoard className="h-4 w-4" />
            JIRA Integration
          </Button>
          <LoginButton />
          <ModeToggle />
          <Button 
            className="hidden md:flex gap-2 bg-gradient-to-r from-primary via-accent to-gold hover:opacity-90"
            onClick={handleDemoClick}
          >
            <Sparkles className="h-4 w-4" />
            Try Demo
          </Button>

          {/* Mobile Navigation */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={(e) => scrollToSection(e, link.href, true)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/jira-integration"
                  className="text-lg font-medium text-blue-500 hover:text-blue-600 flex items-center gap-2"
                  onClick={(e) => scrollToSection(e, "/jira-integration", true)}
                >
                  <CircuitBoard className="h-5 w-5" />
                  JIRA Integration
                </Link>
                <div className="flex items-center gap-2 mt-4">
                  <LoginButton />
                </div>
                <Button 
                  className="mt-4 gap-2 bg-gradient-to-r from-primary via-accent to-gold hover:opacity-90"
                  onClick={handleDemoClick}
                >
                  <Sparkles className="h-4 w-4" />
                  Try Demo
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Expanded Chatbot */}
      {showChatbot && (
        <Chatbot 
          isExpanded={true} 
          onClose={() => setShowChatbot(false)}
        />
      )}
    </header>
  )
}
