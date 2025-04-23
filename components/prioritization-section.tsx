"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle, MinusCircle } from "lucide-react"
import { Chart, ChartContainer, ChartLegend, ChartLegendItem, ChartPie, ChartTooltip } from "@/components/ui/chart"

export function PrioritizationSection() {
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

  const pieData = [
    { name: "Must-have", value: 40, color: "hsl(var(--primary))" },
    { name: "Should-have", value: 30, color: "hsl(var(--accent))" },
    { name: "Could-have", value: 20, color: "hsl(var(--gold))" },
    { name: "Won't-have", value: 10, color: "hsl(var(--muted))" },
  ]

  return (
    <section ref={sectionRef} id="prioritization" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Smart Prioritization</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Focus on What Matters Most</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Our AI automatically prioritizes requirements using the MoSCoW method, helping your team focus on the most
            critical features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Card className="border border-border/50 shadow-md card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowUpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Must-have</h3>
                    <p className="text-sm text-muted-foreground">Critical requirements that must be included</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <div className="mt-1 text-right text-sm">40%</div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-md card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <ArrowRightCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Should-have</h3>
                    <p className="text-sm text-muted-foreground">Important but not critical requirements</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-accent h-2.5 rounded-full" style={{ width: "30%" }}></div>
                </div>
                <div className="mt-1 text-right text-sm">30%</div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-md card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <ArrowDownCircle className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Could-have</h3>
                    <p className="text-sm text-muted-foreground">Desirable but not necessary requirements</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-gold h-2.5 rounded-full" style={{ width: "20%" }}></div>
                </div>
                <div className="mt-1 text-right text-sm">20%</div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-md card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <MinusCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Won't-have</h3>
                    <p className="text-sm text-muted-foreground">Requirements that won't be implemented now</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-muted-foreground h-2.5 rounded-full" style={{ width: "10%" }}></div>
                </div>
                <div className="mt-1 text-right text-sm">10%</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Card className="border border-border/50 shadow-md w-full max-w-md aspect-square card-hover">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Requirement Distribution</h3>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full h-full max-w-[300px] max-h-[300px]">
                    <ChartContainer>
                      <Chart className="w-full aspect-square">
                        <ChartPie data={pieData} paddingAngle={2} cornerRadius={4} className="animate-spin-slow" />
                        <ChartTooltip />
                      </Chart>
                      <ChartLegend className="mt-4 justify-center">
                        {pieData.map((entry, index) => (
                          <ChartLegendItem key={`item-${index}`} color={entry.color} className="capitalize">
                            {entry.name}
                          </ChartLegendItem>
                        ))}
                      </ChartLegend>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
