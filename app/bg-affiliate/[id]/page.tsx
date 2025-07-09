"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Percent, Users, Calendar, Wallet, Plus, Activity, Copy, Check } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBgAffiliateTreeDetail } from '@/services/api/BgAffiliateService';
import { useQuery } from '@tanstack/react-query';

// --- Helper: truncateAddress ---
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}


// Hàm tính level cho node
function getNodeLevel(node: any, nodes: any[], cache: any = {}): any {
  if (node.parentWalletId === null) return 1;
  if (cache[node.walletId]) return cache[node.walletId];
  const parent = nodes.find((n: any) => n.walletId === node.parentWalletId);
  const level: any = parent ? getNodeLevel(parent, nodes, cache) + 1 : 1;
  cache[node.walletId] = level;
  return level;
}

// --- Main Detail Page ---
export default function BgAffiliateTreeDetailPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;

  // Tất cả hook phải ở đầu
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['bg-affiliate-tree-detail', id],
    queryFn: () => getBgAffiliateTreeDetail(Number(id)),
    enabled: !!id,
  });
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Sau đó mới return điều kiện
  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">Loading tree...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-400">Error loading tree. Please try again.</div>;
  }
  if (!tree) return notFound();

  // Tính level cho từng node
  const levelCache: any = {};
  const nodesWithLevel = tree ? tree.nodes.map((node: any) => ({
    ...node,
    level: getNodeLevel(node, tree.nodes, levelCache)
  })) : [];
  const levels = Array.from(new Set(nodesWithLevel.map((n: any) => n.level)));
  const levelsSorted = (levels as number[]).sort((a, b) => a - b);
  const filteredNodes = selectedLevel === "all"
    ? nodesWithLevel
    : nodesWithLevel.filter((n: any) => n.level === Number(selectedLevel));

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success("Address copied!");
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">BG Affiliate Tree #{tree.treeId}</h1>
          <p className="text-slate-400 text-sm">
            Root: <span className="font-semibold text-cyan-400">{tree.rootWallet.nickName}</span> &bull; 
            <span className="items-center gap-1 inline-flex">
              {truncateAddress(tree.rootWallet.solanaAddress)}
              <button
                className="ml-1 p-1 rounded hover:bg-slate-700 transition-colors"
                title="Copy address"
                onClick={() => copyToClipboard(tree.rootWallet.solanaAddress)}
              >
                {copiedAddress === tree.rootWallet.solanaAddress ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            </span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Root Commission</p>
                <p className="text-2xl font-bold text-emerald-400">{tree.totalCommissionPercent}%</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Percent className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-purple-400">{tree.nodes.length}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Created</p>
                <p className="text-2xl font-bold text-cyan-400">{new Date(tree.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {/* <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/20"
          disabled
        >
          <Percent className="h-4 w-4 mr-1" />
          Update Commission
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/20"
          disabled
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Member
        </Button>
      </div> */}

      {/* Tree View */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Affiliate Tree Structure</CardTitle>
              <CardDescription className="text-slate-400">
                Interactive view of the complete affiliate hierarchy with commission percentages
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab bar */}
          <div className="flex gap-2 p-2 bg-[#181C23] rounded-lg border border-slate-700/50 mb-4">
            <button
              className={`min-w-[90px] px-3 py-1 rounded-lg text-sm font-medium transition-all duration-150
                ${selectedLevel === "all"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm border border-blue-400/60"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600/80 hover:text-white hover:border hover:border-blue-400/30"}
              `}
              onClick={() => setSelectedLevel("all")}
            >
              All
            </button>
            {levelsSorted.map((level: any) => (
              <button
                key={level}
                className={`min-w-[90px] px-3 py-1 rounded-lg text-sm font-medium transition-all duration-150
                  ${selectedLevel === String(level)
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm border border-blue-400/60"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600/80 hover:text-white hover:border hover:border-blue-400/30"}
                `}
                onClick={() => setSelectedLevel(String(level))}
              >
                Level {level}
              </button>
            ))}
          </div>
          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full bg-slate-900 border-slate-700/50">
              <TableHeader className="bg-slate-800/30">
                <TableRow>
                  <TableHead className="px-4 py-2 text-left text-slate-300">Nickname</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">Solana Address</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">Commission (%)</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">Level</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-6">No members found</TableCell>
                  </TableRow>
                ) : (
                  filteredNodes.map((node: any) => (
                    <TableRow key={node.nodeId} className="border-b border-slate-700/30 hover:bg-slate-800/40">
                      <TableCell className="px-4 py-2 font-medium text-slate-100">{node.walletInfo.nickName}</TableCell>
                      <TableCell className="px-4 py-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <span>{truncateAddress(node.walletInfo.solanaAddress)}</span>
                          <button
                            className="ml-1 p-1 rounded hover:bg-slate-700 transition-colors"
                            title="Copy address"
                            onClick={() => copyToClipboard(node.walletInfo.solanaAddress)}
                          >
                            {copiedAddress === node.walletInfo.solanaAddress ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-emerald-400 font-semibold">{node.commissionPercent}</TableCell>
                      <TableCell className="px-4 py-2 text-slate-400">{node.level}</TableCell>
                      <TableCell className="px-4 py-2 text-slate-400">{node.effectiveFrom ? new Date(node.effectiveFrom).toLocaleDateString() : ""}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
