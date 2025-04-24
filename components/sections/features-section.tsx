"use client"

import { useEffect, useRef } from "react"
import { Brain, FileText, Users, BarChart4, FileOutput, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    const cards = document.querySelectorAll(".feature-card")
    cards.forEach((card) => {
      observer.observe(card)
    })

    return () => {
      cards.forEach((card) => {
        observer.unobserve(card)
      })
    }
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Extraction",
      description:
        "Automatically extract and organize requirements from various document formats including Word, PDF, and emails.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: BarChart4,
      title: "Smart Prioritization",
      description:
        "Utilize AI to prioritize requirements using the MoSCoW method, ensuring focus on what matters most.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Work together with your team in real-time with version control and collaborative editing features.",
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      icon: FileOutput,
      title: "Document Generation",
      description: "Generate standardized Word documents and Excel sheets with user stories and requirements.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: FileText,
      title: "Requirement Refinement",
      description: "Interact with the AI to refine, clarify, and improve the quality of extracted requirements.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with data encryption and compliance with industry standards.",
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
  ]

  return (
    <section ref={sectionRef} id="features" className="py-20 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Powerful Features</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Streamline Your Requirement Process
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Our AI-powered system offers a comprehensive suite of features to transform how you gather, organize, and
            manage requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card opacity-0 card-hover border border-border/50">
              <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
