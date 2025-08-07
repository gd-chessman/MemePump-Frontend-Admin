"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Settings, DollarSign, Users, TrendingUp, Gift, Copy, Check, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createSwapInvestor, getSwapInvestors, getSwapInvestorsStats, getSwapInvestorRewards } from "@/services/api/SwapInvestorService"
import { getSwapSetting, updateSwapSetting } from "@/services/api/SwapSetting"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft } from "lucide-react"
import { useLang } from "@/lang/useLang"


export default function SwapInvestorsPage() {
  const { t } = useLang()
  const [searchQuery, setSearchQuery] = useState('')
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rewardsPage, setRewardsPage] = useState(1)
  const [rewardsSearchQuery, setRewardsSearchQuery] = useState('')
  const [copiedAddresses, setCopiedAddresses] = useState<Set<string>>(new Set())

  // Form states
  const [createForm, setCreateForm] = useState({
    wallet_address: ''
  })

  const [settingsForm, setSettingsForm] = useState({
    swap_fee_percent: '',
    investor_share_percent: ''
  })

  // Fetch investors with useQuery
  const { data: investorsRes, isLoading, refetch } = useQuery({
    queryKey: ["swap-investors", currentPage, searchQuery],
    queryFn: () => getSwapInvestors(currentPage, 10, searchQuery),
  })

  // Fetch settings with useQuery
  const { data: settingsRes, refetch: refetchSettings } = useQuery({
    queryKey: ["swap-settings"],
    queryFn: () => getSwapSetting(),
  })

  // Fetch stats with useQuery
  const { data: statsRes } = useQuery({
    queryKey: ["swap-investors-stats"],
    queryFn: () => getSwapInvestorsStats(),
  })

  // Fetch rewards with useQuery
  const { data: rewardsRes, isLoading: rewardsLoading } = useQuery({
    queryKey: ["swap-investor-rewards", rewardsPage, rewardsSearchQuery],
    queryFn: () => getSwapInvestorRewards(rewardsPage, 10, rewardsSearchQuery),
  })

  // Update settings form when data is loaded
  useEffect(() => {
    if (settingsRes?.data) {
      setSettingsForm({
        swap_fee_percent: settingsRes.data.swap_fee_percent || '',
        investor_share_percent: settingsRes.data.investor_share_percent || ''
      })
    }
  }, [settingsRes])

  const handleCreateInvestor = async () => {
    if (!createForm.wallet_address) {
      toast.error(t('swap-investors.investors.dialog.walletAddressRequired'))
      return
    }

    try {
      await createSwapInvestor(createForm.wallet_address)
      toast.success(t('swap-investors.investors.dialog.createSuccess'))
      setOpenCreateDialog(false)
      setCreateForm({
        wallet_address: ''
      })
      // Refresh data after creating
      refetch()
    } catch (error) {
      toast.error(t('swap-investors.investors.dialog.createError'))
    }
  }

  const handleUpdateSettings = async () => {
    const swapFee = parseFloat(settingsForm.swap_fee_percent)
    const investorShare = parseFloat(settingsForm.investor_share_percent)

    if (isNaN(swapFee) || swapFee < 0 || swapFee > 100) {
      toast.error(t('swap-investors.settings.dialog.validation.swapFeeRange'))
      return
    }

    if (isNaN(investorShare) || investorShare < 0 || investorShare > 100) {
      toast.error(t('swap-investors.settings.dialog.validation.investorShareRange'))
      return
    }

    if (investorShare > swapFee) {
      toast.error(t('swap-investors.settings.dialog.validation.investorShareGreater'))
      return
    }

    try {
      await updateSwapSetting({
        swap_fee_percent: swapFee,
        investor_share_percent: investorShare
      })
      toast.success(t('swap-investors.settings.dialog.updateSuccess'))
      setOpenSettingsDialog(false)
      refetchSettings()
    } catch (error) {
      toast.error(t('swap-investors.settings.dialog.updateError'))
    }
  }

  // Use real data from API
  const investors = investorsRes?.data || []
  const pagination = investorsRes?.pagination || { total: 0, totalPages: 1, currentPage: 1 }
  const stats = statsRes?.data || { totalInvestors: 0, activeInvestors: 0, totalAmount: 0, swapFee: 0 }
  const rewards = rewardsRes?.data || []
  const rewardsPagination = rewardsRes?.pagination || { total: 0, totalPages: 1, currentPage: 1 }

  const filteredInvestors = investors.filter((investor: any) => {
    const matchesSearch = investor.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleRewardsPreviousPage = () => {
    if (rewardsPage > 1) {
      setRewardsPage(rewardsPage - 1)
    }
  }

  const handleRewardsNextPage = () => {
    if (rewardsPagination.totalPages && rewardsPage < rewardsPagination.totalPages) {
      setRewardsPage(rewardsPage + 1)
    }
  }

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddresses(prev => new Set(prev).add(address))
      
      // Reset the check mark after 2 seconds
      setTimeout(() => {
        setCopiedAddresses(prev => {
          const newSet = new Set(prev)
          newSet.delete(address)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast.error(t('swap-investors.investors.table.copyError') || 'Failed to copy address')
    }
  }

  const handleOpenSolscan = (transactionHash: string) => {
    if (transactionHash) {
      window.open(`https://solscan.io/tx/${transactionHash}`, '_blank')
    }
  }

  const formatSwapType = (swapType: string) => {
    switch (swapType) {
      case 'usdt_to_sol':
        return 'USDT → SOL'
      case 'sol_to_usdt':
        return 'SOL → USDT'
      default:
        return swapType || 'N/A'
    }
  }

  const formatStatus = (status: string) => {
    return t(`swap-investors.rewards.table.statuses.${status}`) || status || 'N/A'
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">{t('swap-investors.pageTitle')}</h2>
        <p className="text-muted-foreground">{t('swap-investors.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.totalInvestors')}</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalInvestors}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.activeInvestors')}</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.activeInvestors}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.totalAmount')}</p>
                <p className="text-2xl font-bold text-purple-400">${stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-white font-semibold text-sm">{t('swap-investors.stats.swapFee')}</p>
                <p className="text-2xl font-bold text-orange-400">{stats.swapFee}%</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Settings className="h-4 w-4 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="investors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="investors">{t('swap-investors.tabs.investors')}</TabsTrigger>
          <TabsTrigger value="rewards">{t('swap-investors.tabs.rewards')}</TabsTrigger>
          <TabsTrigger value="settings">{t('swap-investors.tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="space-y-4">
          <Card className="dashboard-card p-0 md:p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">{t('swap-investors.investors.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('swap-investors.investors.description')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('swap-investors.investors.addNew')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('swap-investors.investors.dialog.title')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>{t('swap-investors.investors.dialog.walletAddress')} <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Enter wallet address..."
                            value={createForm.wallet_address}
                            onChange={e => setCreateForm(f => ({ ...f, wallet_address: e.target.value }))}
                          />
                        </div>
                        

                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>
                          {t('swap-investors.investors.dialog.cancel')}
                        </Button>
                        <Button onClick={handleCreateInvestor} className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                          {t('swap-investors.investors.dialog.create')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('swap-investors.investors.searchPlaceholder')}
                    className="pl-8 w-full md:max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.stt')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.walletAddress')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.amount')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.status')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.investors.table.createdAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestors.length > 0 ? (
                      filteredInvestors.map((investor: any, index: number) => (
                        <TableRow key={investor.swap_investor_id}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">
                                {investor.wallet_address.slice(0, 8)}...{investor.wallet_address.slice(-6)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopyAddress(investor.wallet_address)}
                              >
                                {copiedAddresses.has(investor.wallet_address) ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {investor.amount_sol > 0 && (
                                <div className="text-sm whitespace-nowrap">
                                  <span className="font-semibold">{investor.amount_sol}</span> SOL
                                </div>
                              )}
                              {investor.amount_usdt > 0 && (
                                <div className="text-sm whitespace-nowrap">
                                  <span className="font-semibold">{investor.amount_usdt.toLocaleString()}</span> USDT
                                </div>
                              )}
                              {investor.amount_usd > 0 && (
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  ≈ ${investor.amount_usd.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={investor.active ? "default" : "secondary"} className="whitespace-nowrap">
                              {investor.active ? t('swap-investors.investors.table.active') : t('swap-investors.investors.table.inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(investor.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          {t('swap-investors.investors.table.noResults')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="dashboard-card p-0 md:p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">{t('swap-investors.rewards.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('swap-investors.rewards.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('swap-investors.rewards.searchPlaceholder')}
                    className="pl-8 w-full md:max-w-sm"
                    value={rewardsSearchQuery}
                    onChange={(e) => setRewardsSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.investorWallet')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.solAmount')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.swapType')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.status')}</TableHead>
                      <TableHead className="font-semibold text-foreground">{t('swap-investors.rewards.table.createdAt')}</TableHead>
                      <TableHead className="font-semibold text-foreground"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {t('swap-investors.rewards.table.loading')}
                        </TableCell>
                      </TableRow>
                    ) : rewards.length > 0 ? (
                      rewards.map((reward: any) => (
                        <TableRow key={reward.swap_investor_reward_id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">
                                {reward.investor_wallet_address.slice(0, 8)}...{reward.investor_wallet_address.slice(-6)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopyAddress(reward.investor_wallet_address)}
                              >
                                {copiedAddresses.has(reward.investor_wallet_address) ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                              {reward.reward_sol_amount.toFixed(6)} SOL
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="whitespace-nowrap">
                              {formatSwapType(reward.swapOrder?.swap_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              reward.status === 'paid' ? "default" : 
                              reward.status === 'failed' ? "destructive" :
                              reward.status === 'pending' || reward.status === 'wait_balance' ? "secondary" : 
                              "secondary"
                            } className="whitespace-nowrap">
                              {formatStatus(reward.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(reward.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            {reward.transaction_hash ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-blue-400 hover:text-blue-600"
                                onClick={() => handleOpenSolscan(reward.transaction_hash)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {t('swap-investors.rewards.table.noResults')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRewardsPreviousPage}
                  disabled={rewardsPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {rewardsPage} / {rewardsPagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRewardsNextPage}
                  disabled={!rewardsPagination.totalPages || rewardsPage >= rewardsPagination.totalPages}
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-black dark:text-white font-bold">{t('swap-investors.settings.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('swap-investors.settings.description')}</CardDescription>
                </div>
                <Dialog open={openSettingsDialog} onOpenChange={setOpenSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('swap-investors.settings.editSettings')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('swap-investors.settings.dialog.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{t('swap-investors.settings.dialog.swapFeeLabel')} <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="3"
                          value={settingsForm.swap_fee_percent}
                          onChange={e => setSettingsForm(f => ({ ...f, swap_fee_percent: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('swap-investors.settings.dialog.swapFeeDescription')}
                        </p>
                      </div>
                      <div>
                        <Label>{t('swap-investors.settings.dialog.investorShareLabel')} <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="2"
                          value={settingsForm.investor_share_percent}
                          onChange={e => setSettingsForm(f => ({ ...f, investor_share_percent: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('swap-investors.settings.dialog.investorShareDescription')}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenSettingsDialog(false)}>
                        {t('swap-investors.settings.dialog.cancel')}
                      </Button>
                      <Button onClick={handleUpdateSettings} className="bg-[#00e09e] hover:bg-[#00d08e] text-black font-medium">
                        {t('swap-investors.settings.dialog.update')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">{t('swap-investors.settings.currentSwapFee')}</Label>
                    <p className="text-2xl font-bold text-blue-400">{settingsRes?.data?.swap_fee_percent || '0'}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('swap-investors.settings.currentInvestorShare')}</Label>
                    <p className="text-2xl font-bold text-emerald-400">{settingsRes?.data?.investor_share_percent || '0'}%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">{t('swap-investors.settings.information')}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>{t('swap-investors.settings.infoPoints.swapFee')}</li>
                      <li>{t('swap-investors.settings.infoPoints.investorShare')}</li>
                      <li>{t('swap-investors.settings.infoPoints.totalPercentage')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 