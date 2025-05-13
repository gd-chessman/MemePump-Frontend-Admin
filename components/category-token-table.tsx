"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Trash, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditableCell } from "@/components/editable-cell"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getCategoryToken, deleteCategoryToken, updateCategoryToken } from "@/services/api/CategorysTokenService"
import { toast } from "react-toastify"

type CategoryToken = {
  slct_id: number
  slct_name: string
  slct_slug: string
  slct_prioritize: "yes" | "no"
  sltc_status: "active" | "hidden"
  slct_created_at: string
  slct_updated_at: string
}

export function CategoryTokenTable() {
  const queryClient = useQueryClient()
  const { data: categoryToken, isLoading } = useQuery({
    queryKey: ["category-token"],
    queryFn: getCategoryToken,
  });

  const [data, setData] = useState<CategoryToken[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [openAlert, setOpenAlert] = useState<{ [key: string]: boolean }>({})

  // Update data when API response changes
  useEffect(() => {
    if (categoryToken?.data) {
      setData(categoryToken.data)
    }
  }, [categoryToken])

  const updateCategoryField = async (id: number, field: keyof CategoryToken, value: string) => {
    try {
      // Update local state first for optimistic update
      setData((prev) =>
        prev.map((category) => {
          if (category.slct_id === id) {
            return { ...category, [field]: value }
          }
          return category
        }),
      )

      // Call API to update
      await updateCategoryToken({
        slct_id: id.toString(),
        [field]: value
      })

      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success("Category updated successfully")
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Failed to update category")
      // Revert local state on error
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
    }
  }

  // Toggle prioritize value between "yes" and "no"
  const togglePrioritize = async (id: number) => {
    try {
      // Update local state first for optimistic update
      setData((prev) =>
        prev.map((category) => {
          if (category.slct_id === id) {
            const newValue = category.slct_prioritize === "yes" ? "no" : "yes"
            return { ...category, slct_prioritize: newValue }
          }
          return category
        }),
      )

      // Get the new value
      const category = data.find((c) => c.slct_id === id)
      if (!category) return

      // Call API to update
      await updateCategoryToken({
        slct_id: id.toString(),
        slct_prioritize: category.slct_prioritize === "yes" ? "no" : "yes"
      })

      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success("Category prioritize updated successfully")
    } catch (error) {
      console.error("Error updating category prioritize:", error)
      toast.error("Failed to update category prioritize")
      // Revert local state on error
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
    }
  }

  // Toggle status value between "active" and "hidden"
  const toggleStatus = async (id: number) => {
    try {
      // Update local state first for optimistic update
      setData((prev) =>
        prev.map((category) => {
          if (category.slct_id === id) {
            const newValue = category.sltc_status === "active" ? "hidden" : "active"
            return { ...category, sltc_status: newValue }
          }
          return category
        }),
      )

      // Get the new value
      const category = data.find((c) => c.slct_id === id)
      if (!category) return

      // Call API to update
      await updateCategoryToken({
        slct_id: id.toString(),
        sltc_status: category.sltc_status === "active" ? "hidden" : "active"
      })

      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success("Category status updated successfully")
    } catch (error) {
      console.error("Error updating category status:", error)
      toast.error("Failed to update category status")
      // Revert local state on error
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
    }
  }

  // Delete a category
  const deleteCategory = async (id: number) => {
    try {
      await deleteCategoryToken(id.toString())
      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    }
  }

  // Auto-generate slug from name
  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
  }

  const columns: ColumnDef<CategoryToken>[] = [
    {
      accessorKey: "slct_name",
      header: "Category Name",
      cell: ({ row }) => {
        const category = row.original
        return (
          <EditableCell
            value={category.slct_name}
            onSave={async (value) => {
              await updateCategoryField(category.slct_id, "slct_name", value)
            }}
            className="font-medium"
          />
        )
      },
    },
    {
      accessorKey: "slct_slug",
      header: "Slug",
      cell: ({ row }) => {
        const category = row.original
        return (
          <EditableCell
            value={category.slct_slug}
            onSave={async (value) => {
              await updateCategoryField(category.slct_id, "slct_slug", value)
            }}
            className="text-muted-foreground"
          />
        )
      },
    },
    {
      accessorKey: "slct_prioritize",
      header: "Prioritize",
      cell: ({ row }) => {
        const category = row.original
        const isPrioritized = category.slct_prioritize === "yes"

        return (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 transition-colors duration-200 ${
                isPrioritized
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-500 hover:text-white hover:border-slate-500"
              } dark:${
                isPrioritized
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                  : "bg-slate-950/30 text-slate-400 border-slate-800/50 hover:bg-slate-600 hover:text-white hover:border-slate-600"
              }`}
              onClick={async () => await togglePrioritize(category.slct_id)}
            >
              {isPrioritized ? (
                <CheckCircle2 className={`h-3.5 w-3.5 ${isPrioritized ? "text-emerald-500" : "text-slate-500"}`} />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>{isPrioritized ? "Yes" : "No"}</span>
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "sltc_status",
      header: "Status",
      cell: ({ row }) => {
        const category = row.original
        const isActive = category.sltc_status === "active"

        return (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 transition-colors duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                  : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500"
              } dark:${
                isActive
                  ? "bg-blue-950/30 text-blue-400 border-blue-800/50 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  : "bg-amber-950/30 text-amber-400 border-amber-800/50 hover:bg-amber-600 hover:text-white hover:border-amber-600"
              }`}
              onClick={async () => await toggleStatus(category.slct_id)}
            >
              {isActive ? (
                <Eye className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span>{isActive ? "Active" : "Hidden"}</span>
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "slct_created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Created Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original
        const open = openAlert[category.slct_id.toString()] || false

        return (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: true }))}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>

            <AlertDialog
              open={open}
              onOpenChange={(open) => setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: open }))}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the category "{category.slct_name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: false }))}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      await deleteCategory(category.slct_id)
                      setOpenAlert((prevState) => ({ ...prevState, [category.slct_id.toString()]: false }))
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of{" "}
          {data.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
