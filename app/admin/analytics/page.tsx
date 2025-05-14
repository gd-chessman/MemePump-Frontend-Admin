"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Monitor, Smartphone, Tablet, Globe, Activity, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { io } from "socket.io-client"
import { useAuth } from "@/hooks/useAuth"

// Define types based on the provided JSON structure
interface Connection {
  clientId: string
  walletId: number
  lastActive: number
  walletAuth?: string
  walletStream?: string | null
  device?: {
    browser: string
    os: string
    device: string
  }
  ip?: string
  tabsCount?: number
}

interface UserTab {
  tabsCount: number
  walletAuth: string
  walletStream: string | null
  device: {
    browser: string
    os: string
    device: string
  }
  ip: string
  lastActive: number
  connections: Connection[]
}

interface DeviceStats {
  browsers: Record<string, number>
  os: Record<string, number>
  deviceTypes: Record<string, number>
}

interface RealtimeData {
  total: number
  master: number
  member: number
  vip: number
  normal: number
  anonymous: number
  userTabs: Record<string, UserTab>
  devices: DeviceStats
  ips: Record<string, number>
  connections: Connection[]
}

// Helper function to format time
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

// Helper function to get time difference
function getTimeDifference(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) {
    return `${Math.floor(diff / 1000)}s ago`
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`
  } else {
    return `${Math.floor(diff / 3600000)}h ago`
  }
}

// Helper function to get color for user type
function getUserTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "master":
      return "bg-purple-500 text-white"
    case "member":
      return "bg-blue-500 text-white"
    case "vip":
      return "bg-amber-500 text-white"
    case "normal":
      return "bg-emerald-500 text-white"
    case "anonymous":
    case "guest":
      return "bg-slate-500 text-white"
    default:
      return "bg-slate-500 text-white"
  }
}

// Helper function to get icon for device type
function getDeviceIcon(type: string) {
  switch (type.toLowerCase()) {
    case "desktop":
      return <Monitor className="h-4 w-4" />
    case "mobile":
      return <Smartphone className="h-4 w-4" />
    case "tablet":
      return <Tablet className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<RealtimeData>({
    total: 0,
    master: 0,
    member: 0,
    vip: 0,
    normal: 0,
    anonymous: 0,
    userTabs: {},
    devices: {
      browsers: {},
      os: {},
      deviceTypes: {},
    },
    ips: {},
    connections: [],
  })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {

    // Connect to WebSocket server
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
      // query: {
      //   walletId: user.wallet_id
      // },
      transports: ['websocket', 'polling'],
      path: '/socket.io'
    })

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket Admin')
      setIsConnected(true)
    })

    // Handle disconnection events
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket Admin')
      setIsConnected(false)
    })

    // Listen for online stats
    socket.on('onlineStats', (stats: RealtimeData) => {
      setData(stats)
      setLastUpdated(new Date())
    })

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat')
    }, 30000)

    // Cleanup when component unmounts
    return () => {
      clearInterval(heartbeatInterval)
      socket.disconnect()
    }
  }, [])

  // Prepare data for charts
  const userTypeData = [
    { name: "Master", value: data.master, color: "#9333ea" },
    { name: "Member", value: data.member, color: "#3b82f6" },
    { name: "VIP", value: data.vip, color: "#f59e0b" },
    { name: "Normal", value: data.normal, color: "#10b981" },
    { name: "Anonymous", value: data.anonymous, color: "#64748b" },
  ].filter((item) => item.value > 0)

  const deviceData = Object.entries(data.devices.deviceTypes).map(([name, value]) => ({
    name,
    value,
    color: name === "desktop" ? "#3b82f6" : name === "mobile" ? "#f59e0b" : "#10b981",
  }))

  const browserData = Object.entries(data.devices.browsers).map(([name, value]) => ({
    name,
    value,
  }))

  const osData = Object.entries(data.devices.os).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Realtime Analytics</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">Live monitoring of user activity and connections.</p>
      </div>

      {/* User Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">Total Users</p>
              <p className="stat-value">{data.total}</p>
              <p className="stat-change flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>Active now</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        {userTypeData.map((type) => (
          <Card key={type.name} className="stat-card">
            <div className="flex justify-between">
              <div>
                <p className="stat-label">{type.name} Users</p>
                <p className="stat-value">{type.value}</p>
                <p className="stat-change flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Active now</span>
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getUserTypeColor(type.name)}`}>
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connections">Active Connections</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* User Types Distribution */}
            <Card className="col-span-1 dashboard-card">
              <CardHeader>
                <CardTitle>User Types</CardTitle>
                <CardDescription>Distribution of active users by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Device Types Distribution */}
            <Card className="col-span-1 dashboard-card">
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>Distribution of active users by device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} devices`, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Browsers & OS */}
            <Card className="col-span-1 dashboard-card">
              <CardHeader>
                <CardTitle>Browsers & OS</CardTitle>
                <CardDescription>Distribution by browser and operating system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...browserData, ...osData]}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
              <CardDescription>All current active connections to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left font-medium">Client ID</th>
                      <th className="h-12 px-4 text-left font-medium">Wallet ID</th>
                      <th className="h-12 px-4 text-left font-medium">User Type</th>
                      <th className="h-12 px-4 text-left font-medium">Device</th>
                      <th className="h-12 px-4 text-left font-medium">IP</th>
                      <th className="h-12 px-4 text-left font-medium">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.connections.map((connection) => (
                      <tr key={connection.clientId} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-mono text-xs">{connection.clientId}</td>
                        <td className="p-4 align-middle">{connection.walletId}</td>
                        <td className="p-4 align-middle">
                          <Badge className={getUserTypeColor(connection.walletAuth || "guest")}>
                            {connection.walletAuth || "Guest"}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            {connection.device && (
                              <>
                                {getDeviceIcon(connection.device.device)}
                                <span>{connection.device.browser}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle font-mono">{connection.ip}</td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {getTimeDifference(connection.lastActive)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Tabs */}
            <Card className="col-span-2 dashboard-card">
              <CardHeader>
                <CardTitle>Active User Sessions</CardTitle>
                <CardDescription>Details of all active user sessions and tabs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(data.userTabs).map(([key, tab]) => (
                    <div key={key} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${getUserTypeColor(tab.walletAuth)}`}
                          >
                            {getDeviceIcon(tab.device.device)}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{tab.device.browser}</h4>
                            <p className="text-xs text-muted-foreground">{tab.device.os}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <Badge variant="outline">{tab.walletAuth}</Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              Last active: {getTimeDifference(tab.lastActive)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center rounded-md border px-3 py-2">
                            <span className="text-2xl font-bold">{tab.tabsCount}</span>
                            <span className="text-xs text-muted-foreground">Tabs</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Connections</h5>
                        <div className="grid gap-2">
                          {tab.connections.map((conn) => (
                            <div
                              key={conn.clientId}
                              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                            >
                              <div className="font-mono text-xs">{conn.clientId}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Wallet ID: {conn.walletId}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getTimeDifference(conn.lastActive)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
