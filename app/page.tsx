import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { DemoSection } from "@/components/demo-section"
import { PrioritizationSection } from "@/components/prioritization-section"
import { CollaborationSection } from "@/components/collaboration-section"
import { DocumentGeneration } from "@/components/document-generation"
import { TechStackSection } from "@/components/tech-stack-section"
import { SecuritySection } from "@/components/security-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
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
