import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Restaurant Accessibility Analyzer",
  description: "Evaluate wheelchair accessibility for restaurants in the US and Canada",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="gradient-background">
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">{children}</main>
      </body>
    </html>
  )
}



import './globals.css'