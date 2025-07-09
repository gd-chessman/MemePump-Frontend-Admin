"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronRight, ChevronDown, Percent, Users, Calendar, Wallet, Plus, Activity, Copy, Check, Power } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBgAffiliateTreeDetail, addNodeToBgAffiliateTree, updateBgAffiliateNodeStatus } from '@/services/api/BgAffiliateService';
import { getListWallets } from '@/services/api/ListWalletsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from "@/lang/useLang";
import Select from "react-select";
import { selectStyles } from "@/utils/common";

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
  const { t } = useLang();
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  const queryClient = useQueryClient();

  // State for add node dialog
  const [showAddNode, setShowAddNode] = useState(false);
  const [walletSearchQuery, setWalletSearchQuery] = useState("");
  const [addNodeForm, setAddNodeForm] = useState({
    selectedWallet: null,
    selectedParent: null,
    commissionPercent: ""
  });

  // Tất cả hook phải ở đầu
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['bg-affiliate-tree-detail', id],
    queryFn: () => getBgAffiliateTreeDetail(Number(id)),
    enabled: !!id,
  });

  // Fetch available wallets for adding new node
  const { data: availableWallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["list-wallets-add-node", walletSearchQuery, 'all', 1],
    queryFn: () => getListWallets(walletSearchQuery, 1, 30, ''),
    enabled: showAddNode,
    placeholderData: (previousData) => previousData,
  });

  // Add node mutation
  const addNodeMutation = useMutation({
    mutationFn: ({ treeId, walletId, parentWalletId, commissionPercent }: { treeId: number, walletId: number, parentWalletId: number, commissionPercent: number }) =>
      addNodeToBgAffiliateTree(treeId, walletId, parentWalletId, commissionPercent),
    onSuccess: (data) => {
      console.log('Node added successfully:', data);
      setShowAddNode(false);
      setAddNodeForm({ selectedWallet: null, selectedParent: null, commissionPercent: "" });
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-tree-detail', id] });
      toast.success(t('bg-affiliate.detail.dialogs.addNode.success'));
    },
    onError: (error: any) => {
      console.error('Error adding node:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('bg-affiliate.detail.dialogs.addNode.error'));
      }
    }
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

  // Convert to react-select format for wallets
  const walletOptions = availableWallets?.data?.map((wallet: any) => ({
    value: wallet,
    label: truncateAddress(wallet.wallet_solana_address)
  }));

  // Convert to react-select format for parent nodes
  const parentOptions = [
    { value: tree.rootWallet, label: `${tree.rootWallet.nickName} (Root)` }
  ].concat(nodesWithLevel.filter((node: any) => node.level > 1).map((node: any) => ({
    value: node,
    label: `${node.walletInfo.nickName} (Level ${node.level})`
  })));

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
          <h1 className="text-2xl font-bold text-slate-100">{t('bg-affiliate.detail.title', { treeId: tree.treeId })}</h1>
          <p className="text-slate-400 text-sm">
            {t('bg-affiliate.detail.rootInfo', { 
              nickname: tree.rootWallet.nickName
            })} &bull; &nbsp;
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
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.rootCommission')}</p>
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
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.totalMembers')}</p>
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
                <p className="text-slate-400 text-sm">{t('bg-affiliate.detail.stats.created')}</p>
                <p className="text-2xl font-bold text-cyan-400">{new Date(tree.createdAt).toLocaleDateString()}</p>
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

      {/* Add Node Dialog */}
      <Dialog open={showAddNode} onOpenChange={setShowAddNode}>
        <DialogContent className="bg-slate-900 border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-slate-100">{t('bg-affiliate.detail.dialogs.addNode.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">{t('bg-affiliate.detail.dialogs.addNode.selectWallet')}</label>
              <Select
                options={walletOptions as any}
                value={addNodeForm.selectedWallet ? {
                  value: addNodeForm.selectedWallet,
                  label: truncateAddress((addNodeForm.selectedWallet as any).wallet_solana_address)
                } : null}
                onChange={(option: any) => setAddNodeForm(prev => ({ 
                  ...prev, 
                  selectedWallet: option ? option.value : null 
                }))}
                onInputChange={(newValue) => setWalletSearchQuery(newValue)}
                placeholder={t('bg-affiliate.detail.dialogs.addNode.selectWalletPlaceholder')}
                isClearable
                isSearchable
                styles={selectStyles}
                className="text-slate-100"
                noOptionsMessage={() => "No wallets available"}
                loadingMessage={() => "Loading wallets..."}
                isLoading={walletsLoading}
                isDisabled={addNodeMutation.isPending}
                filterOption={() => true}
                isOptionDisabled={() => false}
              />
              <p className="text-xs text-slate-400">
                {availableWallets?.pagination?.total || 0} {t('bg-affiliate.detail.dialogs.addNode.availableWallets')}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">{t('bg-affiliate.detail.dialogs.addNode.selectParent')}</label>
              <Select
                options={parentOptions as any}
                value={addNodeForm.selectedParent ? {
                  value: addNodeForm.selectedParent,
                  label: (addNodeForm.selectedParent as any).walletInfo ? 
                    `${(addNodeForm.selectedParent as any).walletInfo.nickName} (Level ${(addNodeForm.selectedParent as any).level})` :
                    `${(addNodeForm.selectedParent as any).nickName} (Root)`
                } : null}
                onChange={(option: any) => setAddNodeForm(prev => ({ 
                  ...prev, 
                  selectedParent: option ? option.value : null 
                }))}
                placeholder={t('bg-affiliate.detail.dialogs.addNode.selectParentPlaceholder')}
                isClearable
                isSearchable
                styles={selectStyles}
                className="text-slate-100"
                isDisabled={addNodeMutation.isPending}
              />
              <p className="text-xs text-slate-400">
                {t('bg-affiliate.detail.dialogs.addNode.selectParentHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('bg-affiliate.detail.dialogs.addNode.commission')}</label>
              <Input 
                type="number" 
                placeholder={t('bg-affiliate.detail.dialogs.addNode.commissionPlaceholder')} 
                value={addNodeForm.commissionPercent} 
                onChange={e => setAddNodeForm(f => ({ ...f, commissionPercent: e.target.value }))} 
                className="bg-slate-800/50 border-slate-600/50" 
                disabled={addNodeMutation.isPending}
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-slate-400 mt-1">
                {t('bg-affiliate.detail.dialogs.addNode.commissionHelp')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowAddNode(false)}
              disabled={addNodeMutation.isPending}
            >
              {t('bg-affiliate.detail.dialogs.addNode.cancel')}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700" 
              disabled={!addNodeForm.selectedWallet || !addNodeForm.selectedParent || !addNodeForm.commissionPercent || addNodeMutation.isPending || parseFloat(addNodeForm.commissionPercent) < 0 || parseFloat(addNodeForm.commissionPercent) > 100}
              onClick={() => {
                if (addNodeForm.selectedWallet && addNodeForm.selectedParent && addNodeForm.commissionPercent) {
                  const parentWalletId = (addNodeForm.selectedParent as any).walletInfo ? 
                    (addNodeForm.selectedParent as any).walletId : 
                    (addNodeForm.selectedParent as any).walletId;
                  
                  addNodeMutation.mutate({
                    treeId: tree.treeId,
                    walletId: (addNodeForm.selectedWallet as any).wallet_id,
                    parentWalletId: parentWalletId,
                    commissionPercent: parseFloat(addNodeForm.commissionPercent)
                  });
                }
              }}
            >
              {addNodeMutation.isPending ? t('bg-affiliate.detail.dialogs.addNode.adding') : t('bg-affiliate.detail.dialogs.addNode.addButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
