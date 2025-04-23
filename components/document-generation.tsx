"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FileSpreadsheet, Download, Share2, CheckCircle } from "lucide-react"

export function DocumentGeneration() {
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

  return (
    <section ref={sectionRef} id="document-generation" className="py-20 opacity-0">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            <span className="text-primary font-semibold">Document Generation</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Generate Professional Documents
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Automatically generate standardized Word documents and Excel sheets from your requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Word Documents</h3>
                  <p className="text-muted-foreground">
                    Generate comprehensive requirement documents in Microsoft Word format.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Excel Spreadsheets</h3>
                  <p className="text-muted-foreground">
                    Export user stories and requirements to Excel for easy tracking and management.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Shareable Formats</h3>
                  <p className="text-muted-foreground">
                    Share documents with stakeholders in various formats including PDF and HTML.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Customizable Templates</h3>
                  <p className="text-muted-foreground">
                    Use pre-built templates or create your own to match your organization's standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="border border-border/50 shadow-md card-hover">
              <CardContent className="p-6">
                <Tabs defaultValue="word" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="word" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Word Document
                    </TabsTrigger>
                    <TabsTrigger value="excel" className="gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel Sheet
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="word" className="mt-0">
                    <div className="bg-card border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-lg">Requirements Specification</h3>
                        <p className="text-sm text-muted-foreground">v1.0</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">1. Introduction</h4>
                          <p className="text-sm text-muted-foreground">
                            This document outlines the requirements for the AI-powered Requirement Writing System.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">2. Functional Requirements</h4>
                          <ul className="text-sm text-muted-foreground space-y-2 pl-5 list-disc">
                            <li>The system shall allow users to upload documents in various formats.</li>
                            <li>The system shall extract requirements automatically using AI algorithms.</li>
                            <li>The system shall categorize requirements as functional or non-functional.</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">3. Non-Functional Requirements</h4>
                          <ul className="text-sm text-muted-foreground space-y-2 pl-5 list-disc">
                            <li>The system shall have a response time of less than 2 seconds.</li>
                            <li>The system shall support concurrent editing by multiple users.</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Document
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="excel" className="mt-0">
                    <div className="bg-card border rounded-lg p-4 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 text-sm font-medium">ID</th>
                              <th className="text-left p-2 text-sm font-medium">User Story</th>
                              <th className="text-left p-2 text-sm font-medium">Priority</th>
                              <th className="text-left p-2 text-sm font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2 text-sm">US-001</td>
                              <td className="p-2 text-sm">
                                As a user, I want to upload documents so that I can extract requirements.
                              </td>
                              <td className="p-2 text-sm">High</td>
                              <td className="p-2 text-sm">Completed</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 text-sm">US-002</td>
                              <td className="p-2 text-sm">
                                As a user, I want to see extracted requirements categorized by type.
                              </td>
                              <td className="p-2 text-sm">Medium</td>
                              <td className="p-2 text-sm">In Progress</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 text-sm">US-003</td>
                              <td className="p-2 text-sm">
                                As a user, I want to prioritize requirements using MoSCoW method.
                              </td>
                              <td className="p-2 text-sm">High</td>
                              <td className="p-2 text-sm">Planned</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 text-sm">US-004</td>
                              <td className="p-2 text-sm">
                                As a user, I want to generate Word documents from my requirements.
                              </td>
                              <td className="p-2 text-sm">Medium</td>
                              <td className="p-2 text-sm">Completed</td>
                            </tr>
                            <tr>
                              <td className="p-2 text-sm">US-005</td>
                              <td className="p-2 text-sm">
                                As a user, I want to collaborate with my team on requirements.
                              </td>
                              <td className="p-2 text-sm">High</td>
                              <td className="p-2 text-sm">In Progress</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Spreadsheet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
