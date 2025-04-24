"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Users, History, CheckCircle } from "lucide-react"

export function SecuritySection() {
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

  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard encryption protocols.",
      icon: Lock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Role-Based Access Control",
      description: "Granular access controls ensure users only see what they're authorized to access.",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Audit Logging",
      description: "Comprehensive audit logs track all user actions for compliance and security monitoring.",
      icon: History,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      title: "Compliance Ready",
      description: "Built to meet enterprise security standards including GDPR, HIPAA, and SOC 2.",
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <section ref={sectionRef} id="security" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Enterprise Security</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Bank-Grade Security & Compliance
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Our system is built with security at its core, ensuring your sensitive requirements and data are always
            protected.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="border border-border/50 shadow-md card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-lg font-medium">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl animate-pulse-slow"></div>
              <Card className="relative border border-border/50 shadow-xl card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Shield className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Security Certification</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <h4 className="font-medium">ISO 27001 Certified</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Our information security management system is ISO 27001 certified.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <h4 className="font-medium">GDPR Compliant</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        We adhere to all GDPR requirements for data protection and privacy.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <h4 className="font-medium">SOC 2 Type II</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Our system has undergone rigorous SOC 2 Type II auditing.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-muted/50 p-2 animate-pulse-slow">
                      <div className="w-full h-full rounded-full border-4 border-primary flex items-center justify-center">
                        <Lock className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
