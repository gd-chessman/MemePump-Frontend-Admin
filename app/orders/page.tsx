"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getOrderHistory } from "@/services/api/OrderService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Copy, Check, ChevronLeft, ExternalLink, ArrowDownLeft, ArrowUpRight } from "lucide-react"

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null)
  useEffect(() => { setPage(1) }, [search])
  const { data, isLoading } = useQuery({
    queryKey: ["orders-history", search, page],
    queryFn: () => getOrderHistory(search, page, limit),
  })

  const orders = (data && typeof data === 'object' && 'data' in data) ? (data as any).data || [] : []
  const totalPages = (data && typeof data === 'object' && 'totalPages' in data) ? (data as any).totalPages || 1 : 1

  function formatDate(dateStr?: string) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString()
  }

  function truncateMiddle(str: string, start: number = 4, end: number = 4) {
    if (!str) return '-';
    if (str.length <= start + end + 3) return str;
    return `${str.slice(0, start)}...${str.slice(-end)}`;
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTxHash(text)
      setTimeout(() => setCopiedTxHash(null), 2000)
    } catch {}
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
        <p className="text-muted-foreground">View and search all order transactions.</p>
      </div>
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order List</CardTitle>
              <CardDescription>All executed and failed orders.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Wallet Address, Token Name, Token Address..."
                className="pl-8 w-full md:max-w-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">STT</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">SOL Address</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Trade</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Token</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Quantity</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Price</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Total</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Status</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Created At</th>
                  <th className="h-12 px-4 text-left font-medium whitespace-nowrap">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={11} className="text-center py-8">Loading...</td></tr>
                ) : orders.length ? (
                  orders.map((order: any, idx: number) => (
                    <tr key={order.order_id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2 text-xs text-center">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <span>{truncateMiddle(order.solAddress)}</span>
                          {order.solAddress && (
                            <button
                              className="p-0.5 hover:bg-muted rounded"
                              onClick={() => handleCopy(order.solAddress)}
                              title="Copy SOL Address"
                            >
                              {copiedTxHash === order.solAddress ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            order.order_trade_type === 'buy'
                              ? 'inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm border border-emerald-200'
                              : 'inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm border border-red-200'
                          }
                        >
                          {order.order_trade_type === 'buy' ? (
                            <ArrowDownLeft className="h-2.5 w-2.5 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-2.5 w-2.5 text-red-500" />
                          )}
                          {order.order_trade_type.charAt(0).toUpperCase() + order.order_trade_type.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-semibold">{order.order_token_name || '-'}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground break-all">
                          <span>{truncateMiddle(order.order_token_address)}</span>
                          {order.order_token_address && (
                            <button
                              className="p-0.5 hover:bg-muted rounded"
                              onClick={() => handleCopy(order.order_token_address)}
                              title="Copy Token Address"
                            >
                              {copiedTxHash === order.order_token_address ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">{order.order_qlty}</td>
                      <td className="px-4 py-2">{order.order_price}</td>
                      <td className="px-4 py-2">{order.order_total_value}</td>
                      <td className="px-4 py-2">
                        <span className={
                          order.order_status === 'executed'
                            ? 'bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs'
                            : 'bg-red-100 text-red-700 px-2 py-1 rounded text-xs'
                        }>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">{formatDate(order.order_created_at)}</td>
                      <td className="px-4 py-2 font-mono text-xs break-all max-w-[180px]">
                        {order.order_tx_hash ? (
                          <a
                            href={`https://solscan.io/tx/${order.order_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            title="View on Solscan"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={11} className="text-center py-8">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
