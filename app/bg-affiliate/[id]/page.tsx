"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Percent, Users, Calendar, Wallet, Activity, Copy, Check, Power } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBgAffiliateTreeDetail, updateBgAffiliateNodeStatus } from '@/services/api/BgAffiliateService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from "@/lang/useLang";

// --- Helper: truncateAddress ---
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (!address) return "";
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Hàm tính level cho node từ cấu trúc tree
function getNodeLevel(node: any, treeData: any, level: number = 1): any {
  if (!treeData.downlineStructure) return level;
  
  for (const downlineNode of treeData.downlineStructure) {
    if (downlineNode.walletId === node.walletId) {
      return level + 1;
    }
    // Tìm trong children
    if (downlineNode.children && downlineNode.children.length > 0) {
      const foundInChildren = findNodeInChildren(downlineNode.children, node.walletId, level + 1);
      if (foundInChildren) return foundInChildren;
    }
  }
  return level;
}

// Hàm tìm node trong children
function findNodeInChildren(children: any[], targetWalletId: number, currentLevel: number): number | null {
  for (const child of children) {
    if (child.walletId === targetWalletId) {
      return currentLevel + 1;
    }
    if (child.children && child.children.length > 0) {
      const found = findNodeInChildren(child.children, targetWalletId, currentLevel + 1);
      if (found) return found;
    }
  }
  return null;
}

// Hàm flatten tree structure thành array
function flattenTreeStructure(treeData: any): any[] {
  const result: any[] = [];
  
  if (treeData.downlineStructure) {
    for (const node of treeData.downlineStructure) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        result.push(...flattenTreeStructure({ downlineStructure: node.children }));
      }
    }
  }
  
  return result;
}

// --- Main Detail Page ---
export default function BgAffiliateTreeDetailPage() {
  const { t } = useLang();
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  const queryClient = useQueryClient();



  // Tất cả hook phải ở đầu
  const { data: treeData, isLoading, error } = useQuery({
    queryKey: ['bg-affiliate-tree-detail', id],
    queryFn: () => getBgAffiliateTreeDetail(Number(id)),
    enabled: !!id,
  });



  // Update node status mutation
  const updateNodeStatusMutation = useMutation({
    mutationFn: ({ walletId, status }: { walletId: number, status: boolean }) =>
      updateBgAffiliateNodeStatus(walletId, status),
    onSuccess: (data) => {
      console.log('Node status updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-tree-detail', id] });
      toast.success(t('bg-affiliate.detail.table.statusUpdated'));
    },
    onError: (error: any) => {
      if (error.response?.data?.message === "Không thể tắt trạng thái của root BG") {
        toast.error(t('bg-affiliate.detail.table.cannotDisableRoot'));
      } else {
        toast.error(t('bg-affiliate.detail.table.statusUpdateFailed'));
      }
    }
  });

  const [selectedLevel, setSelectedLevel] = useState("all");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Sau đó mới return điều kiện
  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-slate-400">{t('bg-affiliate.detail.loading')}</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-400">{t('bg-affiliate.detail.error')}</div>;
  }
  if (!treeData) return notFound();

  // Flatten tree structure và tính level
  const allNodes = flattenTreeStructure(treeData);
  const nodesWithLevel = allNodes.map((node: any) => ({
    ...node,
    level: getNodeLevel(node, treeData)
  }));

  // Thêm root node vào danh sách
  const rootNode = {
    nodeId: 0,
    walletId: treeData.currentWallet.walletId,
    commissionPercent: treeData.treeInfo.totalCommissionPercent,
    effectiveFrom: treeData.treeInfo.createdAt,
    walletInfo: treeData.currentWallet,
    level: 1,
    status: treeData.currentWallet.status // Sử dụng status từ API
  };

  const allNodesWithRoot = [rootNode, ...nodesWithLevel];
  const levels = Array.from(new Set(allNodesWithRoot.map((n: any) => n.level)));
  const levelsSorted = (levels as number[]).sort((a, b) => a - b);
  const filteredNodes = selectedLevel === "all"
    ? allNodesWithRoot
    : allNodesWithRoot.filter((n: any) => n.level === Number(selectedLevel));



  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success(t('list-wallets.table.addressCopied'));
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error(t('list-wallets.table.copyFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t('bg-affiliate.detail.title', { treeId: treeData.treeInfo.treeId })}</h1>
          <p className="text-slate-400 text-sm">
            {t('bg-affiliate.detail.rootInfo', { 
              nickname: treeData.currentWallet.nickName
            })} &bull; &nbsp;
            <span className="items-center gap-1 inline-flex">
              {truncateAddress(treeData.currentWallet.solanaAddress)}
              <button
                className="ml-1 p-1 rounded hover:bg-slate-700 transition-colors"
                title="Copy address"
                onClick={() => copyToClipboard(treeData.currentWallet.solanaAddress)}
              >
                {copiedAddress === treeData.currentWallet.solanaAddress ? (
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
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.rootCommission')}</p>
                <p className="text-2xl font-bold text-emerald-400">{treeData.treeInfo.totalCommissionPercent}%</p>
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
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.totalMembers')}</p>
                <p className="text-2xl font-bold text-purple-400">{treeData.totalMembers}</p>
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
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.created')}</p>
                <p className="text-2xl font-bold text-cyan-400">{new Date(treeData.treeInfo.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree View */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">{t('bg-affiliate.detail.treeStructure')}</CardTitle>
              <CardDescription className="text-slate-400">
                {t('bg-affiliate.detail.treeDescription')}
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
              {t('bg-affiliate.detail.tabs.all')}
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
                {t('bg-affiliate.detail.tabs.level', { level })}
              </button>
            ))}
          </div>
          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full bg-slate-900 border-slate-700/50">
              <TableHeader className="bg-slate-800/30">
                <TableRow>
                  <TableHead className="px-4 py-2 text-left text-slate-300">{t('bg-affiliate.detail.table.nickname')}</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">{t('bg-affiliate.detail.table.solanaAddress')}</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">{t('bg-affiliate.detail.table.commission')}</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">{t('bg-affiliate.detail.table.level')}</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">{t('bg-affiliate.detail.table.status')}</TableHead>
                  <TableHead className="px-4 py-2 text-left text-slate-300">{t('bg-affiliate.detail.table.joined')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-6">{t('bg-affiliate.detail.table.noMembers')}</TableCell>
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
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={node.status !== false}
                              onChange={(e) => {
                                updateNodeStatusMutation.mutate({
                                  walletId: node.walletId,
                                  status: e.target.checked
                                });
                              }}
                              disabled={updateNodeStatusMutation.isPending}
                              className="sr-only"
                              id={`toggle-${node.walletId}`}
                            />
                            <label
                              htmlFor={`toggle-${node.walletId}`}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                                node.status !== false 
                                  ? 'bg-emerald-500' 
                                  : 'bg-slate-600'
                              } ${updateNodeStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >


                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                  node.status !== false ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </label>
                          </div>
                        </div>
                      </TableCell>
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
