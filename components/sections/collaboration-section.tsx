"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, History, GitBranch, Clock, CheckCircle2, XCircle, Edit } from "lucide-react"

export function CollaborationSection() {
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

  const activities = [
    {
      user: { name: "Sarah K.", avatar: "/placeholder.svg?height=40&width=40" },
      action: "added",
      item: "User authentication requirement",
      time: "2 minutes ago",
      icon: CheckCircle2,
      iconColor: "text-accent",
    },
    {
      user: { name: "John D.", avatar: "/placeholder.svg?height=40&width=40" },
      action: "commented on",
      item: "Data encryption standard",
      time: "15 minutes ago",
      icon: MessageSquare,
      iconColor: "text-primary",
    },
    {
      user: { name: "Alex M.", avatar: "/placeholder.svg?height=40&width=40" },
      action: "modified",
      item: "API integration requirement",
      time: "1 hour ago",
      icon: Edit,
      iconColor: "text-gold",
    },
    {
      user: { name: "Lisa T.", avatar: "/placeholder.svg?height=40&width=40" },
      action: "rejected",
      item: "Offline mode feature",
      time: "3 hours ago",
      icon: XCircle,
      iconColor: "text-destructive",
    },
    {
      user: { name: "Mike P.", avatar: "/placeholder.svg?height=40&width=40" },
      action: "approved",
      item: "User dashboard layout",
      time: "Yesterday",
      icon: CheckCircle2,
      iconColor: "text-accent",
    },
  ]

  return (
    <section ref={sectionRef} id="collaboration" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Real-Time Collaboration</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Work Together Seamlessly</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Collaborate with your team in real-time with version control, comments, and activity tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <Card className="border border-border/50 shadow-md card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Recent Activity
                  </h3>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Live Updates
                  </Badge>
                </div>

                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span> {activity.action}{" "}
                          <span className="font-medium">{activity.item}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <activity.icon className={`h-5 w-5 ${activity.iconColor} shrink-0`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Multi-User Editing</h3>
                  <p className="text-muted-foreground">
                    Multiple team members can work on the same document simultaneously.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Contextual Comments</h3>
                  <p className="text-muted-foreground">
                    Add comments directly to specific requirements for clear feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                  <History className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Version History</h3>
                  <p className="text-muted-foreground">Track changes and revert to previous versions when needed.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Branching & Merging</h3>
                  <p className="text-muted-foreground">
                    Create alternative requirement sets and merge them when ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
