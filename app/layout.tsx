"use client";
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react"
import { Toaster } from "sonner";


// Configure Inter font with all required weights
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

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
      <head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/logo.jpg`} type="image/jpeg" />
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/logo.jpeg`} type="image/jpeg" />
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/logo.png`} type="image/png" />
      </head>
      <body className={`${inter.variable} ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ThemeProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
