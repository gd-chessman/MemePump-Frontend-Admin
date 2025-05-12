import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { UserActivity } from "@/components/user-activity"
import { SystemPerformance } from "@/components/system-performance"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Detailed analytics and insights about your system.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="performance">System Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <AnalyticsOverview />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <UserActivity />
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <SystemPerformance />
        </TabsContent>
      </Tabs>
    </div>
  )
}
