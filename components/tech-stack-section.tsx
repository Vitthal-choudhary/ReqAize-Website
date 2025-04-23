"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Code, Database, Cloud, Zap, Braces, Server } from "lucide-react"

export function TechStackSection() {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const technologies = [
    {
      name: "Python AI",
      description: "Advanced natural language processing for requirement extraction",
      icon: Code,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "Mistral API",
      description: "State-of-the-art language model for understanding requirements",
      icon: Braces,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      name: "JIRA Integration",
      description: "Seamless integration with JIRA for project management",
      icon: Server,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      name: "Cloud Infrastructure",
      description: "Scalable cloud infrastructure for enterprise-level performance",
      icon: Cloud,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "Secure Database",
      description: "Encrypted database for secure storage of sensitive information",
      icon: Database,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      name: "Real-time Processing",
      description: "High-performance processing for instant requirement extraction",
      icon: Zap,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
  ]

  return (
    <section ref={sectionRef} id="tech-stack" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Technology Stack</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powered by Cutting-Edge Technology
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Our system leverages the latest advancements in AI and cloud technology to deliver a powerful and reliable
            solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech, index) => (
            <Card key={index} className="border border-border/50 shadow-md card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${tech.bgColor} flex items-center justify-center`}>
                    <tech.icon className={`h-6 w-6 ${tech.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{tech.name}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground">{tech.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Card className="border border-border/50 shadow-md max-w-4xl w-full card-hover">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary via-accent to-gold flex items-center justify-center animate-spin-slow">
                    <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center">
                      <Code className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-medium mb-2">API-First Architecture</h3>
                  <p className="text-muted-foreground mb-4">
                    Our system is built with an API-first approach, making it easy to integrate with your existing tools
                    and workflows. Connect with JIRA, GitHub, Confluence, and more.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary">REST API</div>
                    <div className="px-3 py-1 bg-accent/10 rounded-full text-sm text-accent">GraphQL</div>
                    <div className="px-3 py-1 bg-gold/10 rounded-full text-sm text-gold">Webhooks</div>
                    <div className="px-3 py-1 bg-muted rounded-full text-sm">OAuth 2.0</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
