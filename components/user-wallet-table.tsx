"use client"

import { useState } from "react"
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
import { ChevronDown, ChevronRight, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Define types based on the provided JSON structure
interface WalletAuth {
  wa_id: number
  wa_user_id: number
  wa_wallet_id: number
  wa_type: string
  wa_name: string
}

interface UserWallet {
  uw_id: number
  uw_telegram_id: string
  uw_phone: string | null
  uw_email: string | null
  uw_password: string | null
  wallet_auths: WalletAuth[]
}

interface UserWalletResponse {
  data: UserWallet[]
  total: number
  page: number
  limit: number
}

// Sample data based on the provided JSON
const sampleData: UserWalletResponse = {
  data: [
    {
      uw_id: 7255603,
      uw_telegram_id: "8102748433",
      uw_phone: null,
      uw_email: null,
      uw_password: null,
      wallet_auths: [
        {
          wa_id: 10,
          wa_user_id: 7255603,
          wa_wallet_id: 3255842,
          wa_type: "main",
          wa_name: "Le Van Quy",
        },
        {
          wa_id: 20,
          wa_user_id: 7255603,
          wa_wallet_id: 3259634,
          wa_type: "other",
          wa_name: "Test 1",
        },
      ],
    },
    // Add more sample data for demonstration
    {
      uw_id: 7255604,
      uw_telegram_id: "8102748434",
      uw_phone: null,
      uw_email: null,
      uw_password: null,
      wallet_auths: [
        {
          wa_id: 11,
          wa_user_id: 7255604,
          wa_wallet_id: 3255843,
          wa_type: "main",
          wa_name: "Nguyen Van A",
        },
      ],
    },
    {
      uw_id: 7255605,
      uw_telegram_id: "8102748435",
      uw_phone: null,
      uw_email: null,
      uw_password: null,
      wallet_auths: [
        {
          wa_id: 12,
          wa_user_id: 7255605,
          wa_wallet_id: 3255844,
          wa_type: "main",
          wa_name: "Tran Thi B",
        },
        {
          wa_id: 21,
          wa_user_id: 7255605,
          wa_wallet_id: 3259635,
          wa_type: "other",
          wa_name: "Business Account",
        },
        {
          wa_id: 22,
          wa_user_id: 7255605,
          wa_wallet_id: 3259636,
          wa_type: "other",
          wa_name: "Personal Savings",
        },
      ],
    },
  ],
  total: 3,
  page: 1,
  limit: 10,
}

export function UserWalletTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const toggleRow = (uwId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [uwId]: !prev[uwId],
    }))
  }

  const columns: ColumnDef<UserWallet>[] = [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const userWallet = row.original
        const isExpanded = expandedRows[userWallet.uw_id] || false

        return (
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => toggleRow(userWallet.uw_id)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )
      },
    },
    {
      accessorKey: "uw_id",
      header: "User ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("uw_id")}</div>,
    },
    {
      accessorKey: "uw_telegram_id",
      header: "Telegram ID",
      cell: ({ row }) => <div>{row.getValue("uw_telegram_id")}</div>,
    },
    {
      accessorKey: "wallet_count",
      header: "Wallets",
      cell: ({ row }) => {
        const walletCount = row.original.wallet_auths.length
        const mainWallet = row.original.wallet_auths.find((w) => w.wa_type === "main")

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
            >
              {walletCount} {walletCount === 1 ? "wallet" : "wallets"}
            </Badge>
            {mainWallet && (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
              >
                Main: {mainWallet.wa_name}
              </Badge>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: sampleData.data,
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
                <>
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                  {expandedRows[row.original.uw_id] && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="p-4 bg-muted/30">
                          <h4 className="text-sm font-medium mb-2">Wallet Authorizations</h4>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {row.original.wallet_auths.map((wallet) => (
                              <Card key={wallet.wa_id} className="overflow-hidden">
                                <CardContent className="p-0">
                                  <div className="flex items-start p-4">
                                    <div
                                      className={`flex h-9 w-9 items-center justify-center rounded-full mr-3 ${
                                        wallet.wa_type === "main"
                                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                                          : "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                                      }`}
                                    >
                                      <Wallet className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-medium text-sm">{wallet.wa_name}</h5>
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${
                                            wallet.wa_type === "main"
                                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                                              : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
                                          }`}
                                        >
                                          {wallet.wa_type}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Wallet ID: {wallet.wa_wallet_id}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Auth ID: {wallet.wa_id}</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            sampleData.total,
          )}{" "}
          of {sampleData.total} entries
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
