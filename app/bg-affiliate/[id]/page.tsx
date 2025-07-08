"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Percent, Users, Calendar, Wallet, Plus, Activity } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// --- Type definitions (copied from main page) ---
type WalletInfo = {
  walletId: number;
  nickName: string;
  solanaAddress: string;
  ethAddress: string;
};

type Node = {
  nodeId: number;
  walletId: number;
  parentWalletId: number | null;
  commissionPercent: number;
  effectiveFrom: string;
  walletInfo: {
    nickName: string;
    solanaAddress: string;
    ethAddress: string;
  };
};

type Tree = {
  treeId: number;
  rootWallet: WalletInfo;
  totalCommissionPercent: number;
  createdAt: string;
  nodeCount: number;
  nodes: Node[];
};

// --- Fake data (copied from main page) ---
const fakeTrees: Tree[] = [
  {
    treeId: 1,
    rootWallet: {
      walletId: 100001,
      nickName: "CryptoKing",
      solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
      ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A"
    },
    totalCommissionPercent: 75.0,
    createdAt: "2024-01-01T00:00:00.000Z",
    nodeCount: 18,
    nodes: [
      // Root
      {
        nodeId: 1,
        walletId: 100001,
        parentWalletId: null,
        commissionPercent: 75.0,
        effectiveFrom: "2024-01-01T00:00:00.000Z",
        walletInfo: {
          nickName: "CryptoKing",
          solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
          ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A"
        }
      },
      // Level 1 - Direct referrals
      {
        nodeId: 2,
        walletId: 100002,
        parentWalletId: 100001,
        commissionPercent: 30.0,
        effectiveFrom: "2024-01-15T10:30:00.000Z",
        walletInfo: {
          nickName: "TraderPro",
          solanaAddress: "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xAAA111BBB222CCC333DDD444EEE555FFF666GGG777"
        }
      },
      {
        nodeId: 3,
        walletId: 100003,
        parentWalletId: 100001,
        commissionPercent: 25.0,
        effectiveFrom: "2024-01-20T14:15:00.000Z",
        walletInfo: {
          nickName: "DeFiMaster",
          solanaAddress: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
          ethAddress: "0xBBB222CCC333DDD444EEE555FFF666GGG777HHH888"
        }
      },
      {
        nodeId: 4,
        walletId: 100004,
        parentWalletId: 100001,
        commissionPercent: 20.0,
        effectiveFrom: "2024-01-25T09:45:00.000Z",
        walletInfo: {
          nickName: "NFTCollector",
          solanaAddress: "GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456",
          ethAddress: "0xCCC333DDD444EEE555FFF666GGG777HHH888III999"
        }
      },
      // Level 2 - TraderPro's downline
      {
        nodeId: 5,
        walletId: 100005,
        parentWalletId: 100002,
        commissionPercent: 15.0,
        effectiveFrom: "2024-02-01T11:20:00.000Z",
        walletInfo: {
          nickName: "DayTrader",
          solanaAddress: "JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789",
          ethAddress: "0xDDD444EEE555FFF666GGG777HHH888III999JJJ000"
        }
      },
      {
        nodeId: 6,
        walletId: 100006,
        parentWalletId: 100002,
        commissionPercent: 12.0,
        effectiveFrom: "2024-02-05T16:30:00.000Z",
        walletInfo: {
          nickName: "SwingTrader",
          solanaAddress: "MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012",
          ethAddress: "0xEEE555FFF666GGG777HHH888III999JJJ000KKK111"
        }
      },
      // Level 3 - DayTrader's downline
      {
        nodeId: 7,
        walletId: 100007,
        parentWalletId: 100005,
        commissionPercent: 8.0,
        effectiveFrom: "2024-02-10T12:15:00.000Z",
        walletInfo: {
          nickName: "Scalper",
          solanaAddress: "PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345",
          ethAddress: "0xFFF666GGG777HHH888III999JJJ000KKK111LLL222"
        }
      },
      {
        nodeId: 8,
        walletId: 100008,
        parentWalletId: 100005,
        commissionPercent: 6.0,
        effectiveFrom: "2024-02-15T08:45:00.000Z",
        walletInfo: {
          nickName: "Arbitrage",
          solanaAddress: "STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678",
          ethAddress: "0xGGG777HHH888III999JJJ000KKK111LLL222MMM333"
        }
      },
      // Level 2 - DeFiMaster's downline
      {
        nodeId: 9,
        walletId: 100009,
        parentWalletId: 100003,
        commissionPercent: 18.0,
        effectiveFrom: "2024-02-20T14:20:00.000Z",
        walletInfo: {
          nickName: "YieldFarmer",
          solanaAddress: "VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901",
          ethAddress: "0xHHH888III999JJJ000KKK111LLL222MMM333NNN444"
        }
      },
      {
        nodeId: 10,
        walletId: 100010,
        parentWalletId: 100003,
        commissionPercent: 14.0,
        effectiveFrom: "2024-02-25T10:30:00.000Z",
        walletInfo: {
          nickName: "Liquidity",
          solanaAddress: "YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xIII999JJJ000KKK111LLL222MMM333NNN444OOO555"
        }
      },
      // Level 3 - YieldFarmer's downline
      {
        nodeId: 11,
        walletId: 100011,
        parentWalletId: 100009,
        commissionPercent: 9.0,
        effectiveFrom: "2024-03-01T09:15:00.000Z",
        walletInfo: {
          nickName: "StakingPro",
          solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
          ethAddress: "0xJJJ000KKK111LLL222MMM333NNN444OOO555PPP666"
        }
      },
      // Level 2 - NFTCollector's downline
      {
        nodeId: 12,
        walletId: 100012,
        parentWalletId: 100004,
        commissionPercent: 16.0,
        effectiveFrom: "2024-03-05T11:45:00.000Z",
        walletInfo: {
          nickName: "ArtCollector",
          solanaAddress: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
          ethAddress: "0xKKK111LLL222MMM333NNN444OOO555PPP666QQQ777"
        }
      },
      {
        nodeId: 13,
        walletId: 100013,
        parentWalletId: 100004,
        commissionPercent: 13.0,
        effectiveFrom: "2024-03-10T13:20:00.000Z",
        walletInfo: {
          nickName: "GamingNFT",
          solanaAddress: "GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456",
          ethAddress: "0xLLL222MMM333NNN444OOO555PPP666QQQ777RRR888"
        }
      },
      // Level 3 - ArtCollector's downline
      {
        nodeId: 14,
        walletId: 100014,
        parentWalletId: 100012,
        commissionPercent: 7.0,
        effectiveFrom: "2024-03-15T15:30:00.000Z",
        walletInfo: {
          nickName: "RareArt",
          solanaAddress: "JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789",
          ethAddress: "0xMMM333NNN444OOO555PPP666QQQ777RRR888SSS999"
        }
      },
      // Level 4 - Scalper's downline
      {
        nodeId: 15,
        walletId: 100015,
        parentWalletId: 100007,
        commissionPercent: 4.0,
        effectiveFrom: "2024-03-20T12:10:00.000Z",
        walletInfo: {
          nickName: "MicroTrader",
          solanaAddress: "MNO345PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012",
          ethAddress: "0xNNN444OOO555PPP666QQQ777RRR888SSS999TTT000"
        }
      },
      // Level 4 - StakingPro's downline
      {
        nodeId: 16,
        walletId: 100016,
        parentWalletId: 100011,
        commissionPercent: 5.0,
        effectiveFrom: "2024-03-25T14:45:00.000Z",
        walletInfo: {
          nickName: "Validator",
          solanaAddress: "PQR678STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345",
          ethAddress: "0xOOO555PPP666QQQ777RRR888SSS999TTT000UUU111"
        }
      },
      // Level 5 - MicroTrader's downline
      {
        nodeId: 17,
        walletId: 100017,
        parentWalletId: 100015,
        commissionPercent: 2.0,
        effectiveFrom: "2024-03-30T10:20:00.000Z",
        walletInfo: {
          nickName: "BotTrader",
          solanaAddress: "STU901VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678",
          ethAddress: "0xPPP666QQQ777RRR888SSS999TTT000UUU111VVV222"
        }
      },
      // Level 5 - Validator's downline
      {
        nodeId: 18,
        walletId: 100018,
        parentWalletId: 100016,
        commissionPercent: 3.0,
        effectiveFrom: "2024-04-01T16:30:00.000Z",
        walletInfo: {
          nickName: "Delegator",
          solanaAddress: "VWX234YZA567ABC123DEF456GHI789JKL012MNO345PQR678STU901",
          ethAddress: "0xQQQ777RRR888SSS999TTT000UUU111VVV222WWW333"
        }
      }
    ]
  },
  {
    treeId: 2,
    rootWallet: {
      walletId: 200001,
      nickName: "MemeLord",
      solanaAddress: "MEME001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
      ethAddress: "0xMEME001ABC123DEF456789ABC123DEF456789ABCD"
    },
    totalCommissionPercent: 65.0,
    createdAt: "2024-02-01T00:00:00.000Z",
    nodeCount: 12,
    nodes: [
      // Root
      {
        nodeId: 19,
        walletId: 200001,
        parentWalletId: null,
        commissionPercent: 65.0,
        effectiveFrom: "2024-02-01T00:00:00.000Z",
        walletInfo: {
          nickName: "MemeLord",
          solanaAddress: "MEME001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME001ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 1
      {
        nodeId: 20,
        walletId: 200002,
        parentWalletId: 200001,
        commissionPercent: 35.0,
        effectiveFrom: "2024-02-05T16:30:00.000Z",
        walletInfo: {
          nickName: "DogeMaster",
          solanaAddress: "MEME002ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME002ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      {
        nodeId: 21,
        walletId: 200003,
        parentWalletId: 200001,
        commissionPercent: 28.0,
        effectiveFrom: "2024-02-10T12:15:00.000Z",
        walletInfo: {
          nickName: "PepeTrader",
          solanaAddress: "MEME003ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME003ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      {
        nodeId: 22,
        walletId: 200004,
        parentWalletId: 200001,
        commissionPercent: 22.0,
        effectiveFrom: "2024-02-15T14:20:00.000Z",
        walletInfo: {
          nickName: "ShibaKing",
          solanaAddress: "MEME004ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME004ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - DogeMaster's downline
      {
        nodeId: 23,
        walletId: 200005,
        parentWalletId: 200002,
        commissionPercent: 18.0,
        effectiveFrom: "2024-02-20T09:30:00.000Z",
        walletInfo: {
          nickName: "DogeElite",
          solanaAddress: "MEME005ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME005ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      {
        nodeId: 24,
        walletId: 200006,
        parentWalletId: 200002,
        commissionPercent: 15.0,
        effectiveFrom: "2024-02-25T11:45:00.000Z",
        walletInfo: {
          nickName: "DogePro",
          solanaAddress: "MEME006ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME006ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 3 - DogeElite's downline
      {
        nodeId: 25,
        walletId: 200007,
        parentWalletId: 200005,
        commissionPercent: 10.0,
        effectiveFrom: "2024-03-01T13:15:00.000Z",
        walletInfo: {
          nickName: "DogeWhale",
          solanaAddress: "MEME007ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME007ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - PepeTrader's downline
      {
        nodeId: 26,
        walletId: 200008,
        parentWalletId: 200003,
        commissionPercent: 20.0,
        effectiveFrom: "2024-03-05T15:30:00.000Z",
        walletInfo: {
          nickName: "PepeElite",
          solanaAddress: "MEME008ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME008ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 3 - PepeElite's downline
      {
        nodeId: 27,
        walletId: 200009,
        parentWalletId: 200008,
        commissionPercent: 12.0,
        effectiveFrom: "2024-03-10T17:45:00.000Z",
        walletInfo: {
          nickName: "PepeWhale",
          solanaAddress: "MEME009ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME009ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - ShibaKing's downline
      {
        nodeId: 28,
        walletId: 200010,
        parentWalletId: 200004,
        commissionPercent: 16.0,
        effectiveFrom: "2024-03-15T10:20:00.000Z",
        walletInfo: {
          nickName: "ShibaElite",
          solanaAddress: "MEME010ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME010ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 4 - DogeWhale's downline
      {
        nodeId: 29,
        walletId: 200011,
        parentWalletId: 200007,
        commissionPercent: 6.0,
        effectiveFrom: "2024-03-20T12:30:00.000Z",
        walletInfo: {
          nickName: "DogeBaby",
          solanaAddress: "MEME011ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME011ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 4 - PepeWhale's downline
      {
        nodeId: 30,
        walletId: 200012,
        parentWalletId: 200009,
        commissionPercent: 7.0,
        effectiveFrom: "2024-03-25T14:15:00.000Z",
        walletInfo: {
          nickName: "PepeBaby",
          solanaAddress: "MEME012ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xMEME012ABC123DEF456789ABC123DEF456789ABCD"
        }
      }
    ]
  },
  {
    treeId: 3,
    rootWallet: {
      walletId: 300001,
      nickName: "DeFiGuru",
      solanaAddress: "DEFI001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
      ethAddress: "0xDEFI001ABC123DEF456789ABC123DEF456789ABCD"
    },
    totalCommissionPercent: 70.0,
    createdAt: "2024-03-01T00:00:00.000Z",
    nodeCount: 8,
    nodes: [
      // Root
      {
        nodeId: 31,
        walletId: 300001,
        parentWalletId: null,
        commissionPercent: 70.0,
        effectiveFrom: "2024-03-01T00:00:00.000Z",
        walletInfo: {
          nickName: "DeFiGuru",
          solanaAddress: "DEFI001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI001ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 1
      {
        nodeId: 32,
        walletId: 300002,
        parentWalletId: 300001,
        commissionPercent: 40.0,
        effectiveFrom: "2024-03-05T10:00:00.000Z",
        walletInfo: {
          nickName: "YieldHunter",
          solanaAddress: "DEFI002ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI002ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      {
        nodeId: 33,
        walletId: 300003,
        parentWalletId: 300001,
        commissionPercent: 30.0,
        effectiveFrom: "2024-03-10T14:30:00.000Z",
        walletInfo: {
          nickName: "LiquidityKing",
          solanaAddress: "DEFI003ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI003ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - YieldHunter's downline
      {
        nodeId: 34,
        walletId: 300004,
        parentWalletId: 300002,
        commissionPercent: 25.0,
        effectiveFrom: "2024-03-15T16:45:00.000Z",
        walletInfo: {
          nickName: "StakingMaster",
          solanaAddress: "DEFI004ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI004ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      {
        nodeId: 35,
        walletId: 300005,
        parentWalletId: 300002,
        commissionPercent: 20.0,
        effectiveFrom: "2024-03-20T12:15:00.000Z",
        walletInfo: {
          nickName: "FarmingPro",
          solanaAddress: "DEFI005ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI005ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - LiquidityKing's downline
      {
        nodeId: 36,
        walletId: 300006,
        parentWalletId: 300003,
        commissionPercent: 22.0,
        effectiveFrom: "2024-03-25T09:30:00.000Z",
        walletInfo: {
          nickName: "AMMExpert",
          solanaAddress: "DEFI006ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI006ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 3 - StakingMaster's downline
      {
        nodeId: 37,
        walletId: 300007,
        parentWalletId: 300004,
        commissionPercent: 15.0,
        effectiveFrom: "2024-03-30T15:10:00.000Z",
        walletInfo: {
          nickName: "ValidatorPro",
          solanaAddress: "DEFI007ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI007ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 3 - AMMExpert's downline
      {
        nodeId: 38,
        walletId: 300008,
        parentWalletId: 300006,
        commissionPercent: 12.0,
        effectiveFrom: "2024-04-01T11:45:00.000Z",
        walletInfo: {
          nickName: "PoolManager",
          solanaAddress: "DEFI008ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xDEFI008ABC123DEF456789ABC123DEF456789ABCD"
        }
      }
    ]
  }
];

// --- Helper: truncateAddress ---
function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// --- Compact Tree Node Component ---
interface TreeNodeProps {
  node: Node;
  level: number;
  isRoot?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  level, 
  isRoot = false, 
  hasChildren = false, 
  isExpanded = false, 
  onToggle 
}) => {
  const indent = level * 20;
  return (
    <div className="relative">
      {level > 0 && (
        <div 
          className="absolute left-0 top-0 w-px bg-gradient-to-b from-cyan-400/30 to-purple-400/30" 
          style={{ left: `${indent - 10}px`, height: '16px', top: '-16px' }}
        />
      )}
      <div 
        className="flex items-center gap-2 p-2 rounded-lg border border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/50 transition-all group"
        style={{ marginLeft: `${indent}px` }}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-slate-400 hover:text-cyan-300"
            onClick={onToggle}
            tabIndex={-1}
            type="button"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs shadow-sm ${
          isRoot 
            ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
            : 'bg-gradient-to-r from-emerald-500 to-blue-500'
        }`}>
          {node.walletInfo.nickName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-100 text-sm truncate">
              {node.walletInfo.nickName}
            </span>
            {isRoot && (
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs px-1 py-0">
                ROOT
              </Badge>
            )}
            <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30 text-xs px-1 py-0">
              {node.commissionPercent}%
            </Badge>
          </div>
          <div className="text-xs text-slate-400 truncate">
            {truncateAddress(node.walletInfo.solanaAddress)}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Compact Tree View Component ---
interface TreeViewProps {
  tree: Tree;
}

const TreeView: React.FC<TreeViewProps> = ({ tree }) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<number>>(new Set([tree.nodes[0]?.walletId]));

  const buildTreeStructure = (nodes: Node[]) => {
    const nodeMap = new Map<number, Node>();
    const childrenMap = new Map<number, Node[]>();
    nodes.forEach(node => {
      nodeMap.set(node.walletId, node);
      childrenMap.set(node.walletId, []);
    });
    nodes.forEach(node => {
      if (node.parentWalletId && nodeMap.has(node.parentWalletId)) {
        const parent = nodeMap.get(node.parentWalletId)!;
        const children = childrenMap.get(parent.walletId) || [];
        children.push(node);
        childrenMap.set(parent.walletId, children);
      }
    });
    return { nodeMap, childrenMap };
  };

  const { childrenMap } = buildTreeStructure(tree.nodes);

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: Node, level: number): React.ReactNode => {
    const children = childrenMap.get(node.walletId) || [];
    const isExpanded = expandedNodes.has(node.walletId);
    const isRoot = node.parentWalletId === null;
    return (
      <div key={node.nodeId} className="space-y-1">
        <TreeNode
          node={node}
          level={level}
          isRoot={isRoot}
          hasChildren={children.length > 0}
          isExpanded={isExpanded}
          onToggle={() => toggleNode(node.walletId)}
        />
        {isExpanded && children.length > 0 && (
          <div className="space-y-1">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNode = tree.nodes.find(node => node.parentWalletId === null);
  if (!rootNode) {
    return (
      <div className="text-center text-slate-400 py-4">
        No root node found in this tree
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">Tree Structure</h3>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{tree.nodeCount} members</span>
          <span>•</span>
          <span>{tree.totalCommissionPercent}% root</span>
        </div>
      </div>
      <div className="border border-slate-700/40 rounded-lg p-3 bg-slate-900/20 max-h-96 overflow-y-auto">
        {renderNode(rootNode, 0)}
      </div>
    </div>
  );
};

// --- Main Detail Page ---
export default function BgAffiliateTreeDetailPage() {
  // Get treeId from route params
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  const tree = fakeTrees.find(t => t.treeId === id);
  if (!tree) return notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">BG Affiliate Tree #{tree.treeId}</h1>
          <p className="text-slate-400 text-sm">
            Root: <span className="font-semibold text-cyan-400">{tree.rootWallet.nickName}</span> &bull; {truncateAddress(tree.rootWallet.solanaAddress)}
          </p>
        </div>
        <Badge variant="outline" className="border-green-500/30 text-green-400">
          Active
        </Badge>
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
                <p className="text-2xl font-bold text-purple-400">{tree.nodeCount}</p>
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
      <div className="flex gap-2">
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
      </div>

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
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                Root Node
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                Member Node
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TreeView tree={tree} />
        </CardContent>
      </Card>
    </div>
  );
}
