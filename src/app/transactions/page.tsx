"use client";

import { useEffect, useState, useCallback } from "react";
import { useUserStore, useCasinoStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  timestamp: string;
  description: string;
  relatedTrade?: {
    event?: {
      title: string;
    };
    outcome?: {
      name: string;
    };
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function TransactionHistoryPage() {
  const { walletAddress, setPoints } = useUserStore();
  const { setIsLoading } = useCasinoStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCurrency, setFilterCurrency] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const syncUserPoints = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/user/points?walletAddress=${walletAddress}`);
      const data = await response.json();

      if (response.ok) {
        setPoints(data.points);
      }
    } catch (error) {
      console.error("Error syncing user points:", error);
    }
  }, [walletAddress, setPoints]);

  const fetchTransactions = useCallback(
    async (page: number = 1) => {
      if (!walletAddress) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          walletAddress: walletAddress,
        });

        if (filterType && filterType !== "all")
          params.append("type", filterType);
        if (filterCurrency && filterCurrency !== "all")
          params.append("currency", filterCurrency);

        const response = await fetch(`/api/user/transactions?${params}`);
        const data = await response.json();

        if (response.ok) {
          setTransactions(data.transactions);
          setPagination(data.pagination);
        } else {
          toast.error(data.error || "Failed to fetch transactions");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to fetch transactions");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    },
    [walletAddress, filterType, filterCurrency, setIsLoading]
  );

  useEffect(() => {
    syncUserPoints();
  }, [syncUserPoints]);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "MINES_BET":
        return "💣";
      case "MINES_WIN":
        return "💰";
      case "TRADE_BUY":
        return "📈";
      case "TRADE_SELL":
        return "📉";
      case "REWARD":
        return "🎁";
      case "POINTS_DEPOSIT":
        return "➕";
      case "POINTS_WITHDRAWAL":
        return "➖";
      case "ROULETTE_SPIN":
        return "🎰";
      default:
        return "💳";
    }
  };

  const getTransactionColor = (type: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) return "text-green-400";
    if (numAmount < 0) return "text-red-400";
    return "text-gray-400";
  };

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    const sign = numAmount >= 0 ? "+" : "";
    return `${sign}${numAmount.toLocaleString()} ${currency}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">
                Please connect your wallet to view transaction history.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-400">
            Track all your casino activities and trading history
          </p>
        </div>

        {/* Filters */}
        <Card
          className="mb-6"
          style={{
            backgroundColor: "rgba(26, 26, 46, 0.8)",
            borderColor: "rgba(0, 212, 255, 0.2)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Transaction Type
                </label>
                <Select
                  value={filterType}
                  onValueChange={(value) => {
                    setFilterType(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger
                    style={{
                      backgroundColor: "rgba(15, 15, 30, 0.8)",
                      borderColor: "rgba(0, 212, 255, 0.2)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ backgroundColor: "rgba(26, 26, 46, 0.95)" }}
                  >
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="MINES_BET">Mines Bet</SelectItem>
                    <SelectItem value="MINES_WIN">Mines Win</SelectItem>
                    <SelectItem value="TRADE_BUY">Trade Buy</SelectItem>
                    <SelectItem value="TRADE_SELL">Trade Sell</SelectItem>
                    <SelectItem value="REWARD">Reward</SelectItem>
                    <SelectItem value="POINTS_DEPOSIT">
                      Points Deposit
                    </SelectItem>
                    <SelectItem value="POINTS_WITHDRAWAL">
                      Points Withdrawal
                    </SelectItem>
                    <SelectItem value="ROULETTE_SPIN">Roulette Spin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Currency
                </label>
                <Select
                  value={filterCurrency}
                  onValueChange={(value) => {
                    setFilterCurrency(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger
                    style={{
                      backgroundColor: "rgba(15, 15, 30, 0.8)",
                      borderColor: "rgba(0, 212, 255, 0.2)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{ backgroundColor: "rgba(26, 26, 46, 0.95)" }}
                  >
                    <SelectItem value="all">All currencies</SelectItem>
                    <SelectItem value="POINTS">Points</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => fetchTransactions(1)}
                  disabled={loading}
                  className="w-full casino-button"
                  style={{
                    background:
                      "linear-gradient(135deg, #00D4FF 0%, #FF1493 100%)",
                    boxShadow: "0 4px 15px rgba(0, 212, 255, 0.3)",
                  }}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card
          style={{
            backgroundColor: "rgba(26, 26, 46, 0.8)",
            borderColor: "rgba(0, 212, 255, 0.2)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white">
              Transactions ({pagination?.totalCount || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-400">
                  Loading transactions...
                </span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No transactions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-white/5"
                    style={{
                      backgroundColor: "rgba(15, 15, 30, 0.6)",
                      border: "1px solid rgba(0, 212, 255, 0.1)",
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">
                            {transaction.description}
                          </span>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: "rgba(0, 212, 255, 0.3)",
                              color: "#00D4FF",
                            }}
                          >
                            {transaction.type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        {transaction.relatedTrade?.event && (
                          <p className="text-sm text-gray-400 mt-1">
                            Event: {transaction.relatedTrade.event.title}
                            {transaction.relatedTrade.outcome &&
                              ` - ${transaction.relatedTrade.outcome.name}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${getTransactionColor(
                          transaction.type,
                          transaction.amount
                        )}`}
                      >
                        {formatAmount(transaction.amount, transaction.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.totalCount} total)
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    style={{ borderColor: "rgba(0, 212, 255, 0.3)" }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    style={{ borderColor: "rgba(0, 212, 255, 0.3)" }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
