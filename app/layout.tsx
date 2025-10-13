import type React from "react"
import type { Metadata } from "next"
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

import { Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"], variable: '--font-geist' })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"], variable: '--font-geist-mono' })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"], variable: '--font-source-serif-4' })

export const metadata: Metadata = {
  title: "LLM Analytics Dashboard",
  description: "Monitor and analyze your AI model token usage and costs",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.variable} ${_geistMono.variable} ${_sourceSerif_4.variable} font-sans antialiased`} style={{ fontFamily: 'var(--font-geist), var(--font-geist-mono), var(--font-source-serif-4), sans-serif' }} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            }
          >
            {children}
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
