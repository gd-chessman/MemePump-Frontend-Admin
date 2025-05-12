import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardCharts } from "@/components/dashboard-charts"
import { RecentSales } from "@/components/recent-sales"
import { Overview } from "@/components/overview"
import { ArrowUpRight, Users, CreditCard, Activity } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Hello, Admin!</h2>
        <p className="text-muted-foreground">Here's an overview of your system's performance this month.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value">$45,231.89</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>20.1% from last month</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex justify-between">
            <div>
              <p className="stat-label">New Users</p>
              <p className="stat-value">+2,350</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>10.5% from last month</span>
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
              <p className="stat-label">Active Users</p>
              <p className="stat-value">+573</p>
              <p className="stat-change stat-change-positive flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>12.5% from last hour</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <Activity className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue chart for the current year</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3 dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>You have 265 active users this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <DashboardCharts />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and create reports here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {["Revenue Report", "User Activity Report", "System Performance Report"].map((report) => (
                  <div
                    key={report}
                    className="flex flex-col gap-2 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold">{report}</h3>
                    <p className="text-sm text-muted-foreground">View details and export report</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
