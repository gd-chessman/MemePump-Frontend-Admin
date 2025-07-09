"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Users, Wallet, Percent, Calendar, ChevronRight, ChevronDown, Search, MoreHorizontal, TrendingUp, Activity, Edit, Copy, Check } from "lucide-react";
import Link from "next/link";
import Select from "react-select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListWallets } from '@/services/api/ListWalletsService';
import { createBgAffiliate, getBgAffiliateTrees, updateRootBgCommission } from '@/services/api/BgAffiliateService';
import { selectStyles } from "@/utils/common";
import { toast } from "sonner";


// Helper function to truncate address
function truncateAddress(address: string, start: number = 4, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}


export default function BgAffiliateAdminPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdateCommission, setShowUpdateCommission] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [walletSearchQuery, setWalletSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form states
  const [createForm, setCreateForm] = useState({ 
    selectedWallet: null, 
    totalCommissionPercent: "" 
  });

  const [updateCommissionForm, setUpdateCommissionForm] = useState({
    newPercent: ""
  });

  // Fetch BG Affiliate trees
  const { data: bgAffiliateTrees = [], isLoading: treesLoading, error: treesError } = useQuery({
    queryKey: ['bg-affiliate-trees'],
    queryFn: getBgAffiliateTrees,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch available wallets when dialog is open
  const { data: availableWallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["list-wallets", walletSearchQuery, 'all', 1],
    queryFn: () => getListWallets(walletSearchQuery, 1, 50, ''),
    enabled: showCreate, // Only fetch when dialog is open
    placeholderData: (previousData) => previousData,
  });

  // Create BG Affiliate mutation
  const createBgAffiliateMutation = useMutation({
    mutationFn: ({ walletId, totalCommissionPercent }: { walletId: number, totalCommissionPercent: number }) =>
      createBgAffiliate(walletId, totalCommissionPercent),
    onSuccess: (data) => {
      console.log('BG Affiliate created successfully:', data);
      // Close dialog and reset form
      setShowCreate(false);
      setCreateForm({ selectedWallet: null, totalCommissionPercent: "" });
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
      // Show success toast
      toast.success('BG Affiliate created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating BG Affiliate:', error);
      if (error.response?.data?.message === "Wallet đã có cây affiliate") {
        // Show error toast
        toast.error("The wallet already has an affiliate tree");
      } else {
        // Show error toast
        toast.error('Failed to create BG Affiliate. Please try again.');
      }
    }
  });

  // Update Root BG Commission mutation
  const updateCommissionMutation = useMutation({
    mutationFn: ({ treeId, newPercent, rootWalletId }: { treeId: number, newPercent: number, rootWalletId: number }) =>
      updateRootBgCommission(treeId, newPercent, rootWalletId),
    onSuccess: (data) => {
      console.log('Commission updated successfully:', data);
      // Close dialog and reset form
      setShowUpdateCommission(false);
      setSelectedTree(null);
      setUpdateCommissionForm({ newPercent: "" });
      // Invalidate and refetch trees list
      queryClient.invalidateQueries({ queryKey: ['bg-affiliate-trees'] });
      // Show success toast
      toast.success('Commission updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating commission:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update commission. Please try again.');
      }
    }
  });

  // Filter trees based on search term
  const filteredTrees = bgAffiliateTrees.filter((tree: any) =>
    tree.rootWallet?.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.rootWallet?.solanaAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.treeId?.toString().includes(searchTerm)
  );

  // Convert to react-select format
  const walletOptions = availableWallets?.data?.map((wallet: any) => ({
    value: wallet,
    label: truncateAddress(wallet.wallet_solana_address)
  }));

  const totalMembers = bgAffiliateTrees.reduce((sum: number, tree: any) => sum + (tree.nodeCount || 0), 0);


  const handleUpdateCommission = (tree: any) => {
    setSelectedTree(tree);
    setUpdateCommissionForm({ newPercent: tree.totalCommissionPercent.toString() });
    setShowUpdateCommission(true);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">BG Affiliate</h1>
          <p className="text-slate-400 text-sm">Manage affiliate trees and commission structures</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New BG
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Trees</p>
                <p className="text-2xl font-bold text-cyan-400">{bgAffiliateTrees.length}</p>
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
                <p className="text-slate-400 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-emerald-400">{totalMembers}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Trees</p>
                <p className="text-2xl font-bold text-pink-400">{bgAffiliateTrees.length}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Affiliate Trees</CardTitle>
              <CardDescription className="text-slate-400">
                Manage and monitor all BG affiliate trees
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="search" 
                placeholder="Search trees..." 
                className="pl-8 w-64 bg-slate-700/50 border-slate-600/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {treesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-400">Loading trees...</div>
            </div>
          ) : treesError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-400">Error loading trees. Please try again.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50">
                    <TableHead className="text-slate-300">Tree ID</TableHead>
                    <TableHead className="text-slate-300">Root Wallet</TableHead>
                    <TableHead className="text-slate-300">Commission</TableHead>
                    <TableHead className="text-slate-300">Members</TableHead>
                    <TableHead className="text-slate-300">Created</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                        No trees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrees.map((tree: any) => (
                      <TableRow key={tree.treeId} className="border-slate-700/30 hover:bg-slate-700/20">
                        <TableCell className="font-medium text-cyan-400">#{tree.treeId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-100">{tree.rootWallet?.nickName || 'Unknown'}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-400">{truncateAddress(tree.rootWallet?.solanaAddress || '')}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                                onClick={() => copyToClipboard(tree.rootWallet?.solanaAddress || '')}
                                title="Copy address"
                              >
                                {copiedAddress === tree.rootWallet?.solanaAddress ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30">
                            {tree.totalCommissionPercent || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-400">{tree.nodeCount || 0}</span>
                            <span className="text-xs text-slate-400">members</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {tree.createdAt ? new Date(tree.createdAt).toLocaleDateString() : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/bg-affiliate/${tree.treeId}`} passHref legacyBehavior>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                              onClick={() => handleUpdateCommission(tree)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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

      {/* Create Tree Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Create New BG</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Select Wallet</label>
              <Select
                options={walletOptions as any}
                value={createForm.selectedWallet ? {
                  value: createForm.selectedWallet,
                  label: truncateAddress((createForm.selectedWallet as any).wallet_solana_address)
                } : null}
                onChange={(option: any) => setCreateForm(prev => ({ 
                  ...prev, 
                  selectedWallet: option ? option.value : null 
                }))}
                onInputChange={(newValue) => setWalletSearchQuery(newValue)}
                placeholder="Search and select a wallet..."
                isClearable
                isSearchable
                styles={selectStyles}
                className="text-slate-100"
                noOptionsMessage={() => "No wallets available"}
                loadingMessage={() => "Loading wallets..."}
                isLoading={walletsLoading}
                isDisabled={createBgAffiliateMutation.isPending}
              />
              <p className="text-xs text-slate-400">
                {availableWallets?.data?.length || 0} available wallets (not in any tree)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Commission (%)</label>
              <Input 
                type="number" 
                placeholder="e.g., 70" 
                value={createForm.totalCommissionPercent} 
                onChange={e => setCreateForm(f => ({ ...f, totalCommissionPercent: e.target.value }))} 
                className="bg-slate-800/50 border-slate-600/50" 
                disabled={createBgAffiliateMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700" 
              disabled={!createForm.selectedWallet || !createForm.totalCommissionPercent || createBgAffiliateMutation.isPending}
              onClick={() => {
                if (createForm.selectedWallet && createForm.totalCommissionPercent) {
                  createBgAffiliateMutation.mutate({
                    walletId: (createForm.selectedWallet as any).wallet_id,
                    totalCommissionPercent: parseFloat(createForm.totalCommissionPercent)
                  });
                }
              }}
            >
              {createBgAffiliateMutation.isPending ? 'Creating...' : 'Create BG'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Commission Dialog */}
      <Dialog open={showUpdateCommission} onOpenChange={setShowUpdateCommission}>
        <DialogContent className="bg-slate-900/95 border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Update Root BG Commission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTree && (
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-600/30">
                <p className="text-sm text-slate-300 mb-1">Tree #{selectedTree.treeId}</p>
                <p className="text-sm text-slate-400">
                  Root: {selectedTree.rootWallet?.nickName || 'Unknown'} ({truncateAddress(selectedTree.rootWallet?.solanaAddress || '')})
                </p>
                <p className="text-sm text-slate-400">
                  Current Commission: <span className="text-emerald-400 font-medium">{selectedTree.totalCommissionPercent}%</span>
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Commission (%)</label>
              <Input 
                type="number" 
                placeholder="e.g., 60" 
                value={updateCommissionForm.newPercent} 
                onChange={e => setUpdateCommissionForm(f => ({ ...f, newPercent: e.target.value }))} 
                className="bg-slate-800/50 border-slate-600/50" 
                disabled={updateCommissionMutation.isPending}
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter a value between 0 and 100
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowUpdateCommission(false)}
              disabled={updateCommissionMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700" 
              disabled={!updateCommissionForm.newPercent || updateCommissionMutation.isPending}
              onClick={() => {
                if (selectedTree && updateCommissionForm.newPercent) {
                  updateCommissionMutation.mutate({
                    treeId: selectedTree.treeId,
                    newPercent: parseFloat(updateCommissionForm.newPercent),
                    rootWalletId: selectedTree.rootWallet.walletId
                  });
                }
              }}
            >
              {updateCommissionMutation.isPending ? 'Updating...' : 'Update Commission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 