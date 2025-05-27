"use client"

import { Fragment, useState } from "react"
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
import { ChevronDown, ChevronRight, Wallet, CheckCircle2, XCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getListWallets, updateListWalletsAuth } from "@/services/api/ListWalletsService"
import { truncateString } from "@/utils/format"
import { toast } from "react-toastify"

// Define types based on the provided JSON structure
interface WalletAuth {
  wa_id: number
  wa_user_id: number
  wa_wallet_id: number
  wa_type: string
  wa_name: string | null
}

interface UserWallet {
  wallet_id: number
  wallet_solana_address: string
  wallet_eth_address: string
  wallet_auth: string
  wallet_stream: string | null
  wallet_status: boolean
  wallet_nick_name: string | null
  wallet_country: string | null
  wallet_auths: WalletAuth[]
}

interface UserWalletResponse {
  data: UserWallet[]
  total: number
  page: number
  limit: number
}


export function ListWalletsTable({ searchQuery }: { searchQuery: string }) {
  const queryClient = useQueryClient()
  const { data: listWallets, isLoading } = useQuery({
    queryKey: ["list-wallets", searchQuery],
    queryFn: () => getListWallets(searchQuery),
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const toggleRow = (walletId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [walletId]: !prev[walletId],
    }))
  }

  const handleUpdateAuth = async (walletId: number, currentAuth: string) => {
    try {
      await updateListWalletsAuth(walletId.toString(), {
        wallet_auth: currentAuth === "master" ? "member" : "master"
      })
      // Invalidate and refetch the list
      queryClient.invalidateQueries({ queryKey: ["list-wallets"] })
    } catch (error) {
      console.error("Failed to update wallet auth:", error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(text)
      toast.success("Address copied to clipboard")
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      toast.error("Failed to copy address")
    }
  }

  const columns: ColumnDef<UserWallet>[] = [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const userWallet = row.original
        const isExpanded = expandedRows[userWallet.wallet_id] || false

        return (
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => toggleRow(userWallet.wallet_id)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )
      },
    },
    {
      accessorKey: "wallet_id",
      header: "Wallet ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("wallet_id")}</div>,
    },
    {
      accessorKey: "wallet_nick_name",
      header: "Nickname",
      cell: ({ row }) => <div>{row.getValue("wallet_nick_name") || "N/A"}</div>,
    },
    {
      accessorKey: "wallet_auth",
      header: "Auth Type",
      cell: ({ row }) => {
        const authType = row.getValue("wallet_auth") as string
        const isMaster = authType === "master"

        return (
          <div className="flex">
            <Badge
              variant="outline"
              className={`cursor-pointer flex items-center gap-1 px-3 py-1 transition-colors duration-200 ${
                isMaster
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-500 hover:text-white hover:border-slate-500"
              } dark:${
                isMaster
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                  : "bg-slate-950/30 text-slate-400 border-slate-800/50 hover:bg-slate-600 hover:text-white hover:border-slate-600"
              }`}
              onClick={() => handleUpdateAuth(row.original.wallet_id, authType)}
            >
              <span>{isMaster ? "Master" : "Member"}</span>
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "wallet_stream",
      header: "Stream",
      cell: ({ row }) => {
        const stream = row.getValue("wallet_stream") as string | null
        return stream ? (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
          >
            {stream}
          </Badge>
        ) : (
          "N/A"
        )
      },
    },
    {
      accessorKey: "wallet_country",
      header: "Country",
      cell: ({ row }) => <div>{row.getValue("wallet_country") || "N/A"}</div>,
    },
  ]

  const table = useReactTable({
    data: listWallets?.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
    state: {
      sorting,
      columnFilters,
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="max-h-[32rem] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
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
                table.getRowModel().rows.map((row, index) => (
                  <Fragment key={index}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                    {expandedRows[row.original.wallet_id] && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0">
                          <div className="p-4 bg-muted/30">
                            <h4 className="text-sm font-medium mb-2">Wallet Details</h4>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              <Card className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-sm font-medium">Solana Address:</span>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground break-all">{truncateString(row.original.wallet_solana_address, 14)}</p>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => copyToClipboard(row.original.wallet_solana_address)}
                                        >
                                          {copiedAddress === row.original.wallet_solana_address ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">ETH Address:</span>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground break-all">{truncateString(row.original.wallet_eth_address, 14)}</p>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => copyToClipboard(row.original.wallet_eth_address)}
                                        >
                                          {copiedAddress === row.original.wallet_eth_address ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">Status:</span>
                                      <Badge
                                        variant="outline"
                                        className={`ml-2 ${
                                          row.original.wallet_status
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                                            : "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50"
                                        }`}
                                      >
                                        {row.original.wallet_status ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
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
      </div>
    </div>
  )
}
