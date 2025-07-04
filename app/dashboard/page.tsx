"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/overview"
import { ArrowUpRight, Users, CreditCard, Activity, Monitor, Smartphone, Tablet } from "lucide-react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/lang/useLang"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"


const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

// Define types for analytics data
interface AnalyticsData {
  total: number
  master: number
  member: number
  vip: number
  normal: number
  anonymous: number
  devices: {
    deviceTypes: Record<string, number>
    browsers: Record<string, number>
    os: Record<string, number>
  }
  connections: Array<{
    clientId: string
    walletId: number
    lastActive: number
    device?: {
      browser: string
      os: string
      device: string
    }
  }>
}

export default function AdminDashboard() {
  const { t } = useLang()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    total: 0,
    master: 0,
    member: 0,
    vip: 0,
    normal: 0,
    anonymous: 0,
    devices: {
      deviceTypes: {},
      browsers: {},
      os: {}
    },
    connections: []
  })

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
      query: {
        keyAdmin: 'ws-admin-key'
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io'
    })

    socket.on('onlineStats', (stats: AnalyticsData) => {
      setAnalyticsData(stats)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Helper function to get device icon
  function getDeviceIcon(type: string) {
    switch (type.toLowerCase()) {
      case "desktop":
        return <Monitor className="h-4 w-4" />
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  // Transform device data for charts
  const deviceDistributionData = Object.entries(analyticsData.devices.deviceTypes).map(([name, value]) => ({
    name,
    value: (value / analyticsData.total) * 100 || 0
  }))

  // Transform browser data for charts
  const browserData = Object.entries(analyticsData.devices.browsers).map(([name, value]) => ({
    name,
    value
  }))

  // Transform OS data for charts
  const osData = Object.entries(analyticsData.devices.os).map(([name, value]) => ({
    name,
    value
  }))

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.hello')}</h2>
        <p className="text-muted-foreground">{t('dashboard.overview')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('dashboard.totalRevenue')}</p>
              <p className="stat-value">$45,231.89</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>20.1% {t('dashboard.fromLastMonth')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card> */}
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('dashboard.activeUsers')}</p>
              <p className="stat-value">{analyticsData.total}</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{t('dashboard.onlineNow')}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">{t('dashboard.deviceDistribution.title')}</p>
              <div className="flex gap-2 mt-2">
                {Object.entries(analyticsData.devices.deviceTypes).map(([type, count]) => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1">
                    {getDeviceIcon(type)}
                    <span>{count}</span>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <Monitor className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="overview">{t('dashboard.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.tabs.analytics')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>{t('dashboard.revenueOverview.title')}</CardTitle>
                <CardDescription>{t('dashboard.revenueOverview.description')}</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>{t('dashboard.userDistribution.title')}</CardTitle>
                <CardDescription>{t('dashboard.userDistribution.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('dashboard.userDistribution.masterUsers')}</span>
                    <Badge variant="secondary">{analyticsData.master}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('dashboard.userDistribution.memberUsers')}</span>
                    <Badge variant="secondary">{analyticsData.member}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('dashboard.userDistribution.anonymousUsers')}</span>
                    <Badge variant="secondary">{analyticsData.anonymous}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>{t('dashboard.trafficAnalysis.title')}</CardTitle>
                <CardDescription>{t('dashboard.trafficAnalysis.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="area">
                  <TabsList className="mb-4">
                    <TabsTrigger value="area">{t('dashboard.trafficAnalysis.area')}</TabsTrigger>
                    <TabsTrigger value="line">{t('dashboard.trafficAnalysis.line')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="area">
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart
                        data={browserData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id="browserGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="osGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                          }}
                          cursor={{ fill: "hsl(var(--muted))" }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-1))"
                          fill="url(#browserGradient)"
                          strokeWidth={2}
                          animationDuration={1500}
                          animationBegin={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="line">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={osData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                          }}
                          cursor={{ fill: "hsl(var(--muted))" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ 
                            fill: "hsl(var(--chart-2))",
                            strokeWidth: 2,
                            r: 4
                          }}
                          activeDot={{ 
                            fill: "hsl(var(--chart-2))",
                            stroke: "hsl(var(--background))",
                            strokeWidth: 2,
                            r: 6
                          }}
                          animationDuration={1500}
                          animationBegin={0}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card className="col-span-3 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>{t('dashboard.deviceDistribution.title')}</CardTitle>
                <CardDescription>{t('dashboard.deviceDistribution.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={deviceDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="hsl(var(--chart-1))"
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={0}
                      >
                        {deviceDistributionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#gradient-${index % COLORS.length})`}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        formatter={(value, entry) => (
                          <span style={{ color: "hsl(var(--foreground))" }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t('dashboard.activeConnections.title')}</CardTitle>
              <CardDescription>{t('dashboard.activeConnections.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.clientId')}</th>
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.walletId')}</th>
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.device')}</th>
                        <th className="h-12 px-4 text-left font-medium">{t('dashboard.activeConnections.lastActive')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.connections.map((connection) => (
                        <tr key={connection.clientId} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-mono text-xs">{connection.clientId}</td>
                          <td className="p-4 align-middle">{connection.walletId}</td>
                          <td className="p-4 align-middle">
                            {connection.device && (
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(connection.device.device)}
                                <span>{connection.device.browser}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 align-middle text-muted-foreground">
                            {new Date(connection.lastActive).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
