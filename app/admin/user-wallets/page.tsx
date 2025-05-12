import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserWalletTable } from "@/components/user-wallet-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"

export default function UserWalletsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Wallets</h2>
        <p className="text-muted-foreground">Manage user wallets and their authorizations.</p>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Wallet List</CardTitle>
              <CardDescription>View and manage user wallets and their associated accounts.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search by ID or Telegram ID..." className="pl-8 w-full md:max-w-sm" />
            </div>
          </div>
          <UserWalletTable />
        </CardContent>
      </Card>
    </div>
  )
}
