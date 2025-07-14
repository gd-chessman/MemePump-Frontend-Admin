"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Wallet, Percent, Calendar, Search, Copy, Check, TrendingUp, Activity, UserPlus, Award } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { getNormalAffiliateStats, getNormalAffiliateStatistics } from '@/services/api/NormalAffiliateService';
import { toast } from "sonner";
import { useLang } from "@/lang/useLang";

// Helper function to truncate address
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Mock data
const mockReferralData = {
  "data": [
    {
      "walletId": 3251129,
      "nickName": "2333",
      "solanaAddress": "8EbySEW8WJHUrNfmSNe85TuWmsVaV6T7Q6MzwkYyGgnZ",
      "ethAddress": "0x858E9AcF9B03216AE42cFDE137aB775EAE10CA08",
      "refCode": "3251129",
      "stats": {
        "totalInviteeReward": 0.04516,
        "totalInviteeCount": 50,
        "totalReferrerReward": 0.03026,
        "totalReferrerCount": 18,
        "totalReward": 0.07542
      },
      "asInvitee": [
        {
          "referralId": 1,
          "level": 1,
          "totalReward": 0.04516,
          "rewardCount": 50,
          "referent": {
            "walletId": 3251125,
            "nickName": "khanh382",
            "solanaAddress": "s4uJWXe7C3QeKsUBoMTvNDRGtrk5LJYJK1Az7jyfvdy",
            "ethAddress": "0xf68c4644C888216995C39F82DD23a3fAb1bfF026",
            "refCode": "3251125"
          }
        }
      ],
      "asReferrer": [
        {
          "referralId": 5472,
          "level": 1,
          "totalReward": 0.0151,
          "rewardCount": 13,
          "invitee": {
            "walletId": 3255669,
            "nickName": "okbro",
            "solanaAddress": "DWPXN6yvhhqZrnjTqS4fc65BgbG8m3A9WW3FmgomJCT9",
            "ethAddress": "0x71F30531BAf8c595CfF960F177F52E4cA54400c8",
            "refCode": "8URULx"
          }
        },
        {
          "referralId": 720,
          "level": 2,
          "totalReward": 0.01516,
          "rewardCount": 5,
          "invitee": {
            "walletId": 3260717,
            "nickName": "OK11",
            "solanaAddress": "GwhQyPako7KUEXgkBFRsWkT2DyVPVdcznmLpTcYi2bc5",
            "ethAddress": "0x7cBEfA3CF8a2edFdb9d8400d81e408436A34CdaE",
            "refCode": "0z1bTs"
          }
        }
      ]
    },
    {
      "walletId": 3251125,
      "nickName": "khanh382",
      "solanaAddress": "s4uJWXe7C3QeKsUBoMTvNDRGtrk5LJYJK1Az7jyfvdy",
      "ethAddress": "0xf68c4644C888216995C39F82DD23a3fAb1bfF026",
      "refCode": "3251125",
      "stats": {
        "totalInviteeReward": 0,
        "totalInviteeCount": 0,
        "totalReferrerReward": 0.04516,
        "totalReferrerCount": 50,
        "totalReward": 0.04516
      },
      "asInvitee": [],
      "asReferrer": [
        {
          "referralId": 1,
          "level": 1,
          "totalReward": 0.04516,
          "rewardCount": 50,
          "invitee": {
            "walletId": 3251129,
            "nickName": "2333",
            "solanaAddress": "8EbySEW8WJHUrNfmSNe85TuWmsVaV6T7Q6MzwkYyGgnZ",
            "ethAddress": "0x858E9AcF9B03216AE42cFDE137aB775EAE10CA08",
            "refCode": "3251129"
          }
        },
        {
          "referralId": 5937,
          "level": 2,
          "totalReward": 0,
          "rewardCount": 0,
          "invitee": {
            "walletId": 3255669,
            "nickName": "okbro",
            "solanaAddress": "DWPXN6yvhhqZrnjTqS4fc65BgbG8m3A9WW3FmgomJCT9",
            "ethAddress": "0x71F30531BAf8c595CfF960F177F52E4cA54400c8",
            "refCode": "8URULx"
          }
        },
        {
          "referralId": 1138,
          "level": 3,
          "totalReward": 0,
          "rewardCount": 0,
          "invitee": {
            "walletId": 3260717,
            "nickName": "OK11",
            "solanaAddress": "GwhQyPako7KUEXgkBFRsWkT2DyVPVdcznmLpTcYi2bc5",
            "ethAddress": "0x7cBEfA3CF8a2edFdb9d8400d81e408436A34CdaE",
            "refCode": "0z1bTs"
          }
        }
      ]
    },
    {
      "walletId": 3260717,
      "nickName": "OK11",
      "solanaAddress": "GwhQyPako7KUEXgkBFRsWkT2DyVPVdcznmLpTcYi2bc5",
      "ethAddress": "0x7cBEfA3CF8a2edFdb9d8400d81e408436A34CdaE",
      "refCode": "0z1bTs",
      "stats": {
        "totalInviteeReward": 0.01516,
        "totalInviteeCount": 5,
        "totalReferrerReward": 0,
        "totalReferrerCount": 0,
        "totalReward": 0.01516
      },
      "asInvitee": [
        {
          "referralId": 10244,
          "level": 1,
          "totalReward": 0,
          "rewardCount": 0,
          "referent": {
            "walletId": 3255669,
            "nickName": "okbro",
            "solanaAddress": "DWPXN6yvhhqZrnjTqS4fc65BgbG8m3A9WW3FmgomJCT9",
            "ethAddress": "0x71F30531BAf8c595CfF960F177F52E4cA54400c8",
            "refCode": "8URULx"
          }
        },
        {
          "referralId": 720,
          "level": 2,
          "totalReward": 0.01516,
          "rewardCount": 5,
          "referent": {
            "walletId": 3251129,
            "nickName": "2333",
            "solanaAddress": "8EbySEW8WJHUrNfmSNe85TuWmsVaV6T7Q6MzwkYyGgnZ",
            "ethAddress": "0x858E9AcF9B03216AE42cFDE137aB775EAE10CA08",
            "refCode": "3251129"
          }
        },
        {
          "referralId": 1138,
          "level": 3,
          "totalReward": 0,
          "rewardCount": 0,
          "referent": {
            "walletId": 3251125,
            "nickName": "khanh382",
            "solanaAddress": "s4uJWXe7C3QeKsUBoMTvNDRGtrk5LJYJK1Az7jyfvdy",
            "ethAddress": "0xf68c4644C888216995C39F82DD23a3fAb1bfF026",
            "refCode": "3251125"
          }
        }
      ],
      "asReferrer": []
    },
    {
      "walletId": 3255669,
      "nickName": "okbro",
      "solanaAddress": "DWPXN6yvhhqZrnjTqS4fc65BgbG8m3A9WW3FmgomJCT9",
      "ethAddress": "0x71F30531BAf8c595CfF960F177F52E4cA54400c8",
      "refCode": "8URULx",
      "stats": {
        "totalInviteeReward": 0.0151,
        "totalInviteeCount": 13,
        "totalReferrerReward": 0,
        "totalReferrerCount": 0,
        "totalReward": 0.0151
      },
      "asInvitee": [
        {
          "referralId": 5472,
          "level": 1,
          "totalReward": 0.0151,
          "rewardCount": 13,
          "referent": {
            "walletId": 3251129,
            "nickName": "2333",
            "solanaAddress": "8EbySEW8WJHUrNfmSNe85TuWmsVaV6T7Q6MzwkYyGgnZ",
            "ethAddress": "0x858E9AcF9B03216AE42cFDE137aB775EAE10CA08",
            "refCode": "3251129"
          }
        },
        {
          "referralId": 5937,
          "level": 2,
          "totalReward": 0,
          "rewardCount": 0,
          "referent": {
            "walletId": 3251125,
            "nickName": "khanh382",
            "solanaAddress": "s4uJWXe7C3QeKsUBoMTvNDRGtrk5LJYJK1Az7jyfvdy",
            "ethAddress": "0xf68c4644C888216995C39F82DD23a3fAb1bfF026",
            "refCode": "3251125"
          }
        }
      ],
      "asReferrer": [
        {
          "referralId": 10244,
          "level": 1,
          "totalReward": 0,
          "rewardCount": 0,
          "invitee": {
            "walletId": 3260717,
            "nickName": "OK11",
            "solanaAddress": "GwhQyPako7KUEXgkBFRsWkT2DyVPVdcznmLpTcYi2bc5",
            "ethAddress": "0x7cBEfA3CF8a2edFdb9d8400d81e408436A34CdaE",
            "refCode": "0z1bTs"
          }
        }
      ]
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 100
};

export default function NormalAffiliateAdminPage() {
  const { t } = useLang();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedRefCode, setCopiedRefCode] = useState<string | null>(null);

  // Fetch normal affiliate data for table
  const { data: normalAffiliateData, isLoading: tableLoading, error: tableError } = useQuery({
    queryKey: ['normal-affiliate-stats'],
    queryFn: getNormalAffiliateStats,
  });

  // Fetch statistics data for cards
  const { data: statisticsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['normal-affiliate-statistics'],
    queryFn: getNormalAffiliateStatistics,
  });

  // Get all wallets from API data
  const wallets = normalAffiliateData?.data || [];



  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: 'address' | 'refCode') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'address') {
        setCopiedAddress(text);
        toast.success(t('list-wallets.table.addressCopied') || 'Address copied to clipboard');
        setTimeout(() => setCopiedAddress(null), 2000);
      } else {
        setCopiedRefCode(text);
        toast.success('Referral code copied to clipboard');
        setTimeout(() => setCopiedRefCode(null), 2000);
      }
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Get level badge color
  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-900/20 text-emerald-400 border-emerald-500/30";
      case 2:
        return "bg-blue-900/20 text-blue-400 border-blue-500/30";
      case 3:
        return "bg-purple-900/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-900/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Normal Affiliate Management</h1>
          <p className="text-slate-400 text-sm">Manage wallet-based referral relationships and rewards</p>
        </div>
      </div>

            {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Loading...</p>
                    <p className="text-2xl font-bold text-slate-400">...</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <div className="h-4 w-4 bg-slate-400 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Error</p>
                    <p className="text-2xl font-bold text-red-400">-</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <div className="h-4 w-4 bg-red-400 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Wallets</p>
                  <p className="text-2xl font-bold text-cyan-400">{statisticsData?.overview?.totalWallets || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Referral Relations</p>
                  <p className="text-2xl font-bold text-pink-400">{statisticsData?.overview?.totalReferralRelations || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Rewards</p>
                  <p className="text-2xl font-bold text-emerald-400">{(statisticsData?.overview?.totalRewards || 0).toFixed(4)} SOL</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Award className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Top Referrer</p>
                  <p className="text-lg font-bold text-purple-400">{statisticsData?.topPerformers?.topReferrers?.[0]?.nickName || 'N/A'}</p>
                  <p className="text-xs text-slate-400">{(statisticsData?.topPerformers?.topReferrers?.[0]?.totalReferrerReward || 0).toFixed(4)} SOL</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Main Content */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Wallet Referral Overview</CardTitle>
              <CardDescription className="text-slate-400">
                View and manage all wallet referral relationships and their rewards
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          
          {tableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-400">Loading wallet data...</div>
            </div>
          ) : tableError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-400">Error loading wallet data</div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50">
                    <TableHead className="text-slate-300">Wallet ID</TableHead>
                    <TableHead className="text-slate-300">User Info</TableHead>
                    <TableHead className="text-slate-300">Stats</TableHead>
                    <TableHead className="text-slate-300">Invitee Relations</TableHead>
                    <TableHead className="text-slate-300">Referrer Relations</TableHead>
                  </TableRow>
                </TableHeader>
                                <TableBody>
                  {wallets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                        No wallets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    wallets.map((wallet: any, index: number) => (
                    <TableRow key={wallet.walletId} className="border-slate-700/30 hover:bg-slate-700/20">
                      <TableCell className="font-medium text-cyan-400">{wallet.walletId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-100">{wallet.nickName || 'Unknown'}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">{truncateAddress(wallet.solanaAddress || '')}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                              onClick={() => copyToClipboard(wallet.solanaAddress || '', 'address')}
                              title="Copy address"
                            >
                              {copiedAddress === wallet.solanaAddress ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">Ref: {wallet.refCode}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-slate-500 hover:text-cyan-300 hover:bg-cyan-900/20"
                              onClick={() => copyToClipboard(wallet.refCode || '', 'refCode')}
                              title="Copy referral code"
                            >
                              {copiedRefCode === wallet.refCode ? (
                                <Check className="h-2 w-2 text-emerald-500" />
                              ) : (
                                <Copy className="h-2 w-2" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Total:</span>
                            <span className="font-medium text-emerald-400">{(wallet.stats?.totalReward || 0).toFixed(4)} SOL</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Invitee:</span>
                            <span className="font-medium text-blue-400">{(wallet.stats?.totalInviteeReward || 0).toFixed(4)} SOL</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Referrer:</span>
                            <span className="font-medium text-purple-400">{(wallet.stats?.totalReferrerReward || 0).toFixed(4)} SOL</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {wallet.asInvitee.length > 0 ? (
                            <div className="text-xs text-slate-500">
                              {wallet.asInvitee.map((ref: any) => (
                                <div key={ref.referralId} className="flex items-center gap-1">
                                  <Badge variant="secondary" className={getLevelBadgeColor(ref.level)}>
                                    L{ref.level}
                                  </Badge>
                                  <span>{ref.referent?.nickName}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">No invitee relations</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {wallet.asReferrer.length > 0 ? (
                            <div className="text-xs text-slate-500">
                              {wallet.asReferrer.map((ref: any) => (
                                <div key={ref.referralId} className="flex items-center gap-1">
                                  <Badge variant="secondary" className={getLevelBadgeColor(ref.level)}>
                                    L{ref.level}
                                  </Badge>
                                  <span>{ref.invitee?.nickName}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">No referrer relations</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                              </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
