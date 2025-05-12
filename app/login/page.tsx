"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, User, BarChart2, Users, Shield, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    try {
      setIsLoading(true)

      // Simulate API call with timeout
      console.log(username, password)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, hardcode a successful login with specific credentials
      if (username === "admin" && password === "admin123") {
        // Redirect to admin dashboard
        router.push("/admin")
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Welcome section with improved design */}
      <div className="hidden md:block md:w-1/2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-shapes.png')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <div className="max-w-md mx-auto space-y-8">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">AdminPanel</div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Welcome to your <span className="text-primary">Admin Dashboard</span>
              </h1>
              <p className="text-slate-300 text-lg">Powerful, intuitive, and designed for your business needs.</p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="feature-card group">
                <div className="feature-icon bg-blue-500/20 text-blue-400">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="feature-title">Real-time Analytics</h3>
                  <p className="feature-description">Monitor performance with live data insights</p>
                </div>
              </div>

              <div className="feature-card group">
                <div className="feature-icon bg-purple-500/20 text-purple-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="feature-title">User Management</h3>
                  <p className="feature-description">Manage accounts, roles and permissions</p>
                </div>
              </div>

              <div className="feature-card group">
                <div className="feature-icon bg-emerald-500/20 text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="feature-title">Advanced Security</h3>
                  <p className="feature-description">Enterprise-grade protection for your data</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-sm">
          © 2023 AdminPanel. All rights reserved.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">Access your admin dashboard</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
