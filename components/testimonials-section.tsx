"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

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

  const testimonials = [
    {
      quote:
        "ReqAI has transformed our requirement gathering process. What used to take weeks now takes hours, and the quality of our requirements has improved dramatically.",
      name: "Sarah Johnson",
      title: "CTO, TechInnovate",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      quote:
        "The AI-powered extraction is incredibly accurate. It's like having a requirements expert on the team who works 24/7 and never misses a detail.",
      name: "Michael Chen",
      title: "Product Manager, GlobalSoft",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      quote:
        "The collaboration features have made it possible for our distributed team to work together seamlessly. The real-time updates and version control are game-changers.",
      name: "Emily Rodriguez",
      title: "Scrum Master, AgileWorks",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section ref={sectionRef} id="testimonials" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Success Stories</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Trusted by Industry Leaders</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            See what our customers are saying about how ReqAI has transformed their requirement engineering process.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="border border-border/50 shadow-lg card-hover">
            <CardContent className="p-8">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Quote className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xl italic mb-6">"{testimonials[currentIndex].quote}"</p>

                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                      alt={testimonials[currentIndex].name}
                    />
                    <AvatarFallback>{testimonials[currentIndex].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{testimonials[currentIndex].name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonials[currentIndex].title}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6 gap-2">
            <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                className={`w-2 h-2 rounded-full p-0 ${index === currentIndex ? "bg-primary" : "bg-muted"}`}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="sr-only">Go to testimonial {index + 1}</span>
              </Button>
            ))}
            <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-6">Ready to Transform Your Requirement Process?</h3>
          <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white" size="lg">
            Try ReqAI Today
          </Button>
        </div>
      </div>
    </section>
  )
}
