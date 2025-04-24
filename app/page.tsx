import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { DemoSection } from "@/components/sections/demo-section"
import { ChatbotPreview } from "@/components/chat/chatbot-preview"
import { PrioritizationSection } from "@/components/sections/prioritization-section"
import { CollaborationSection } from "@/components/sections/collaboration-section"
import { DocumentGeneration } from "@/components/sections/document-generation"
import { TechStackSection } from "@/components/sections/tech-stack-section"
import { SecuritySection } from "@/components/sections/security-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <ChatbotPreview />
      <PrioritizationSection />
      <CollaborationSection />
      <DocumentGeneration />
      <TechStackSection />
      <SecuritySection />
      <TestimonialsSection />
      <Footer />
    </main>
  )
}
