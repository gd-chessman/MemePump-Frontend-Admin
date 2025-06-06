"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ListWalletsTable } from "@/components/list-wallets-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"
import { getListWallets } from "@/services/api/ListWalletsService"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
export default function UserWalletsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { data: listWallets, refetch: refetchListWallets } = useQuery({
    queryKey: ["list-wallets", searchQuery],
    queryFn: () => getListWallets(searchQuery),
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchListWallets()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">List Wallets</h2>
        <p className="text-muted-foreground">Manage user wallets and their authorizations.</p>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>List Wallets</CardTitle>
              <CardDescription>View and manage user wallets and their associated accounts.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search by Wallet ID or Nickname ..." className="pl-8 w-full md:max-w-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  refetchListWallets();
                }}
              />
            </div>
          </div>
          <ListWalletsTable searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </div>
  )
}
