"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { CategoryTokenTable } from "@/components/category-token-table"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { useQuery } from "@tanstack/react-query"
import { getCategoryToken } from "@/services/api/CategorysTokenService"
import { useState } from "react"

export default function CategoriesTokenPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categoryToken, refetch: refetchCategoryToken } = useQuery({
    queryKey: ["category-token", searchQuery],
    queryFn: () => getCategoryToken(searchQuery, 1, 100),
  });
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories Token</h2>
        <p className="text-muted-foreground">Manage token categories in your system.</p>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories Token List</CardTitle>
              <CardDescription>A list of all token categories in your system.</CardDescription>
            </div>
            <div>
              <AddCategoryDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search categories..." 
                className="pl-8 w-full md:max-w-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  refetchCategoryToken();
                }}
              />
            </div>
          </div>
          <CategoryTokenTable searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </div>
  )
}
