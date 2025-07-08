"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Users, Wallet, Percent, Calendar, ChevronRight, ChevronDown, Search, MoreHorizontal, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import Select from "react-select";



// Fake wallets data for selection
const fakeWallets = [
  {
    walletId: 100001,
    nickName: "CryptoKing",
    solanaAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    ethAddress: "0xDEF456789ABC123DEF456789ABC123DEF456789A"
  },
  {
    walletId: 100002,
    nickName: "TraderPro",
    solanaAddress: "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xAAA111BBB222CCC333DDD444EEE555FFF666GGG777"
  },
  {
    walletId: 100003,
    nickName: "DeFiMaster",
    solanaAddress: "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
    ethAddress: "0xBBB222CCC333DDD444EEE555FFF666GGG777HHH888"
  },
  {
    walletId: 100004,
    nickName: "NFTCollector",
    solanaAddress: "GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456",
    ethAddress: "0xCCC333DDD444EEE555FFF666GGG777HHH888III999"
  },
  {
    walletId: 100018,
    nickName: "ValidatorPro",
    solanaAddress: "VAL001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xVAL001ABC123DEF456789ABC123DEF456789ABCD"
  },
  {
    walletId: 100019,
    nickName: "PoolManager",
    solanaAddress: "POOL001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xPOOL001ABC123DEF456789ABC123DEF456789ABCD"
  },
  {
    walletId: 100020,
    nickName: "BridgeMaster",
    solanaAddress: "BRIDGE001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xBRIDGE001ABC123DEF456789ABC123DEF456789ABCD"
  },
  {
    walletId: 100021,
    nickName: "OracleKeeper",
    solanaAddress: "ORACLE001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xORACLE001ABC123DEF456789ABC123DEF456789ABCD"
  },
  {
    walletId: 100022,
    nickName: "GovernancePro",
    solanaAddress: "GOV001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xGOV001ABC123DEF456789ABC123DEF456789ABCD"
  },
  {
    walletId: 100023,
    nickName: "CrossChain",
    solanaAddress: "CROSS001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xCROSS001ABC123DEF456789ABC123DEF456789ABCD"
  },
  {
    walletId: 100024,
    nickName: "Layer2King",
    solanaAddress: "L2KING001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xL2KING001ABC123DEF456789ABC123DEF456789ABCD"
  },
  {
    walletId: 100025,
    nickName: "SmartContract",
    solanaAddress: "CONTRACT001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    ethAddress: "0xCONTRACT001ABC123DEF456789ABC123DEF456789ABCD"
  }
];

// Fake data for BG Affiliate Trees
const fakeTrees = [
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
  },
  {
    treeId: 4,
    rootWallet: {
      walletId: 400001,
      nickName: "GamingPro",
      solanaAddress: "GAME001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
      ethAddress: "0xGAME001ABC123DEF456789ABC123DEF456789ABCD"
    },
    totalCommissionPercent: 60.0,
    createdAt: "2024-04-01T00:00:00.000Z",
    nodeCount: 6,
    nodes: [
      // Root
      {
        nodeId: 39,
        walletId: 400001,
        parentWalletId: null,
        commissionPercent: 60.0,
        effectiveFrom: "2024-04-01T00:00:00.000Z",
        walletInfo: {
          nickName: "GamingPro",
          solanaAddress: "GAME001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xGAME001ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 1
      {
        nodeId: 40,
        walletId: 400002,
        parentWalletId: 400001,
        commissionPercent: 35.0,
        effectiveFrom: "2024-04-05T12:00:00.000Z",
        walletInfo: {
          nickName: "EsportsKing",
          solanaAddress: "GAME002ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xGAME002ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      {
        nodeId: 41,
        walletId: 400003,
        parentWalletId: 400001,
        commissionPercent: 25.0,
        effectiveFrom: "2024-04-10T15:30:00.000Z",
        walletInfo: {
          nickName: "StreamerPro",
          solanaAddress: "GAME003ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xGAME003ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - EsportsKing's downline
      {
        nodeId: 42,
        walletId: 400004,
        parentWalletId: 400002,
        commissionPercent: 20.0,
        effectiveFrom: "2024-04-15T18:45:00.000Z",
        walletInfo: {
          nickName: "TournamentMaster",
          solanaAddress: "GAME004ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xGAME004ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - StreamerPro's downline
      {
        nodeId: 43,
        walletId: 400005,
        parentWalletId: 400003,
        commissionPercent: 18.0,
        effectiveFrom: "2024-04-20T14:20:00.000Z",
        walletInfo: {
          nickName: "ContentCreator",
          solanaAddress: "GAME005ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xGAME005ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 3 - TournamentMaster's downline
      {
        nodeId: 44,
        walletId: 400006,
        parentWalletId: 400004,
        commissionPercent: 12.0,
        effectiveFrom: "2024-04-25T16:10:00.000Z",
        walletInfo: {
          nickName: "LeagueManager",
          solanaAddress: "GAME006ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xGAME006ABC123DEF456789ABC123DEF456789ABCD"
        }
      }
    ]
  },
  {
    treeId: 5,
    rootWallet: {
      walletId: 500001,
      nickName: "StakingKing",
      solanaAddress: "STAKE001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
      ethAddress: "0xSTAKE001ABC123DEF456789ABC123DEF456789ABCD"
    },
    totalCommissionPercent: 65.0,
    createdAt: "2024-05-01T00:00:00.000Z",
    nodeCount: 4,
    nodes: [
      // Root
      {
        nodeId: 45,
        walletId: 500001,
        parentWalletId: null,
        commissionPercent: 65.0,
        effectiveFrom: "2024-05-01T00:00:00.000Z",
        walletInfo: {
          nickName: "StakingKing",
          solanaAddress: "STAKE001ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xSTAKE001ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 1
      {
        nodeId: 46,
        walletId: 500002,
        parentWalletId: 500001,
        commissionPercent: 40.0,
        effectiveFrom: "2024-05-05T10:00:00.000Z",
        walletInfo: {
          nickName: "ValidatorElite",
          solanaAddress: "STAKE002ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xSTAKE002ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      {
        nodeId: 47,
        walletId: 500003,
        parentWalletId: 500001,
        commissionPercent: 30.0,
        effectiveFrom: "2024-05-10T14:30:00.000Z",
        walletInfo: {
          nickName: "DelegatorPro",
          solanaAddress: "STAKE003ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xSTAKE003ABC123DEF456789ABC123DEF456789ABCD"
        }
      },
      // Level 2 - ValidatorElite's downline
      {
        nodeId: 48,
        walletId: 500004,
        parentWalletId: 500002,
        commissionPercent: 25.0,
        effectiveFrom: "2024-05-15T16:45:00.000Z",
        walletInfo: {
          nickName: "ConsensusMaster",
          solanaAddress: "STAKE004ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
          ethAddress: "0xSTAKE004ABC123DEF456789ABC123DEF456789ABCD"
        }
      }
    ]
  }
];

// Helper function to truncate address
function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Custom styles for react-select
const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: state.isFocused ? 'rgb(34, 197, 94)' : 'rgba(71, 85, 105, 0.5)',
    borderWidth: '1px',
    borderRadius: '6px',
    boxShadow: state.isFocused ? '0 0 0 1px rgb(34, 197, 94)' : 'none',
    '&:hover': {
      borderColor: 'rgba(71, 85, 105, 0.7)',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '6px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'rgba(71, 85, 105, 0.5)' : 'transparent',
    color: state.isFocused ? 'rgb(241, 245, 249)' : 'rgb(148, 163, 184)',
    '&:hover': {
      backgroundColor: 'rgba(71, 85, 105, 0.5)',
      color: 'rgb(241, 245, 249)',
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'rgb(241, 245, 249)',
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'rgb(241, 245, 249)',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'rgb(148, 163, 184)',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: 'rgb(148, 163, 184)',
    '&:hover': {
      color: 'rgb(34, 197, 94)',
    },
  }),
  clearIndicator: (provided: any) => ({
    ...provided,
    color: 'rgb(148, 163, 184)',
    '&:hover': {
      color: 'rgb(239, 68, 68)',
    },
  }),
};

export default function BgAffiliateAdminPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [createForm, setCreateForm] = useState({ 
    selectedWallet: null, 
    totalCommissionPercent: "" 
  });

  // Filter trees based on search term
  const filteredTrees = fakeTrees.filter(tree =>
    tree.rootWallet.nickName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.rootWallet.solanaAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.treeId.toString().includes(searchTerm)
  );

  // Filter wallets that are not already in any tree
  const availableWallets = fakeWallets.filter(wallet => 
    !fakeTrees.some(tree => 
      tree.nodes.some(node => node.walletId === wallet.walletId)
    )
  );

  // Convert to react-select format
  const walletOptions = availableWallets.map((wallet: any) => ({
    value: wallet,
    label: (
      <div className="flex flex-col">
        <span className="font-medium text-slate-100">{wallet.nickName}</span>
        <span className="text-xs text-slate-400">{truncateAddress(wallet.solanaAddress)}</span>
      </div>
    )
  }));

  const totalMembers = fakeTrees.reduce((sum, tree) => sum + tree.nodeCount, 0);
  const avgCommission = Math.round(fakeTrees.reduce((sum, tree) => sum + tree.totalCommissionPercent, 0) / fakeTrees.length);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Trees</p>
                <p className="text-2xl font-bold text-cyan-400">{fakeTrees.length}</p>
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
                <p className="text-slate-400 text-sm">Avg Commission</p>
                <p className="text-2xl font-bold text-purple-400">{avgCommission}%</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Trees</p>
                <p className="text-2xl font-bold text-pink-400">{fakeTrees.length}</p>
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
                {filteredTrees.map(tree => (
                  <TableRow key={tree.treeId} className="border-slate-700/30 hover:bg-slate-700/20">
                    <TableCell className="font-medium text-cyan-400">#{tree.treeId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-100">{tree.rootWallet.nickName}</p>
                        <p className="text-xs text-slate-400">{truncateAddress(tree.rootWallet.solanaAddress)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30">
                        {tree.totalCommissionPercent}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-purple-400">{tree.nodeCount}</span>
                        <span className="text-xs text-slate-400">members</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {new Date(tree.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/bg-affiliate/${tree.treeId}`} passHref legacyBehavior>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Tree Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900/95 border-slate-700/50">
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
                  label: (
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{(createForm.selectedWallet as any).nickName}</span>
                      <span className="text-xs text-slate-400">{truncateAddress((createForm.selectedWallet as any).solanaAddress)}</span>
                    </div>
                  )
                } : null}
                onChange={(option: any) => setCreateForm(prev => ({ 
                  ...prev, 
                  selectedWallet: option ? option.value : null 
                }))}
                placeholder="Search and select a wallet..."
                isClearable
                isSearchable
                styles={selectStyles}
                className="text-slate-100"
                noOptionsMessage={() => "No wallets available"}
                loadingMessage={() => "Loading wallets..."}
              />
              <p className="text-xs text-slate-400">
                {availableWallets.length} available wallets (not in any tree)
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700" 
              disabled={!createForm.selectedWallet || !createForm.totalCommissionPercent}
            >
              Create BG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 