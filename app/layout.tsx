"use client";
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react"


// Configure Inter font with all required weights
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Modern admin dashboard with light and dark mode",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

    // Khởi tạo QueryClient trong component để nó không bị chia sẻ giữa các yêu cầu
    const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnMount: false,
        },
      },
    }));
    
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
