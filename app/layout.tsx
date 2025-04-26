import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { AuthProvider } from "@/components/auth/AuthContext"
import { JiraProvider } from "@/lib/jira/context"
import Script from "next/script"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "ReqAI - AI-Powered Requirement Writing System",
  description: "Revolutionizing Requirement Engineering with AI",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <JiraProvider>
              {children}
            </JiraProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* Force immediate client-side hydration */}
        <Script id="hydration-fix" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined') {
              window.onload = function() {
                // Force a re-render if content isn't fully loaded
                if (document.querySelectorAll('main > *').length <= 1) {
                  console.log('Forcing re-render to fix hydration...');
                  window.location.reload();
                }
              }
            }
          `}
        </Script>
      </body>
    </html>
  )
}
