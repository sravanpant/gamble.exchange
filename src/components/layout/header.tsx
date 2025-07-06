// src/components/layout/header.tsx (Updated version with shadcn/ui)
"use client";

import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  LogOut,
  Menu,
  X,
  Settings,
  User,
  ChevronDown,
  Copy,
  ExternalLink,
  History
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";
import { toast } from "sonner";
import { JazziconAvatar } from "@/components/ui/jazzicon-avatar";

export function Header() {
  const { authenticated, login, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    walletAddress,
    points,
    setUser,
    setPoints,
    clearUser
  } = useUserStore();

  const currentWalletAddress = wallets[0]?.address;

  const handleUserLogin = useCallback(
    async (address: string) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address })
        });

        const data = await response.json();

        if (response.ok) {
          setUser({
            id: data.user.id,
            walletAddress: data.user.walletAddress,
            points: data.user.points,
            cryptoBalance: data.user.cryptoBalance,
            isAdmin: data.user.isAdmin
          });
          setPoints(data.user.points);

          if (data.isNewUser) {
            toast.success("Welcome! 🎉 You received 1000 bonus points!", {
              duration: 5000,
              style: {
                background: "#1A1A2E",
                color: "#00D4FF",
                border: "1px solid rgba(0, 212, 255, 0.3)"
              }
            });
          } else {
            toast.success("Welcome back!", {
              duration: 3000,
              style: {
                background: "#1A1A2E",
                color: "#00D4FF",
                border: "1px solid rgba(0, 212, 255, 0.3)"
              }
            });
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Failed to connect wallet");
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setPoints]
  );

  useEffect(() => {
    if (authenticated && currentWalletAddress && !walletAddress) {
      handleUserLogin(currentWalletAddress);
    }
  }, [authenticated, currentWalletAddress, handleUserLogin, walletAddress]);

  const handleLogout = async () => {
    await logout();
    clearUser();
    setMobileMenuOpen(false);
    toast.info("Disconnected successfully");
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Address copied to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  function formatPoints(points: number | null | undefined) {
    return points?.toLocaleString();
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: "rgba(15, 15, 30, 0.8)",
          borderColor: "rgba(0, 212, 255, 0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold casino-gradient-text">
                  Gamble.exchange
                </span>
              </Link>

              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/games"
                  className="transition-colors hover:text-[#00D4FF]"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Games
                </Link>
                <Link
                  href="/sports"
                  className="transition-colors hover:text-[#00D4FF]"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Sports
                </Link>
                <Link
                  href="/promotions"
                  className="transition-colors hover:text-[#00D4FF]"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Promotions
                </Link>
                <Link
                  href="/opinion-trading"
                  className="transition-colors hover:text-[#00D4FF]"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Opinion Trading
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {authenticated && walletAddress ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 h-auto pl-4 pr-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                      style={{
                        background: "rgba(26, 26, 46, 0.6)",
                        border: "1px solid rgba(0, 212, 255, 0.2)",
                      }}
                    >
                      {/* Balance */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Balance</span>
                        <span className="text-sm font-bold" style={{ color: "#00D4FF" }}>
                          {formatPoints(points)} pts
                        </span>
                      </div>

                      {/* Divider */}
                      {/* <div className="w-px h-7 bg-gray-700/50" /> */}

                      {/* Avatar */}
                      {/* <JazziconAvatar address={walletAddress} size={28} /> */}

                      {/* Dropdown Arrow */}
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-64 mt-2"
                    style={{
                      background: "rgba(26, 26, 46, 0.95)",
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 255, 0.1)"
                    }}
                  >
                    {/* User Info */}
                    <div className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <JazziconAvatar address={walletAddress} size={40} />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {formatAddress(walletAddress)}
                          </p>
                          <p className="text-xs" style={{ color: "#00D4FF" }}>
                            {formatPoints(points)} points
                          </p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator className="bg-cyan-500/10" />

                    {/* Menu Items */}
                    <DropdownMenuItem
                      onClick={copyAddress}
                      className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                    >
                      <Copy className="w-4 h-4 mr-3" />
                      <span>Copy Address</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                      >
                        <User className="w-4 h-4 mr-3" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/transactions"
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                      >
                        <History className="w-4 h-4 mr-3" />
                        <span>Transaction History</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <a
                        href={`https://etherscan.io/address/${walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                      >
                        <ExternalLink className="w-4 h-4 mr-3" />
                        <span>View on Etherscan</span>
                      </a>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-cyan-500/10" />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10"
                      style={{ color: "#FF1493" }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Disconnect Wallet</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => login()}
                  disabled={!ready || isLoading}
                  className="casino-button px-6 py-2.5 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isLoading
                      ? "rgba(26, 26, 46, 0.8)"
                      : "linear-gradient(135deg, #00D4FF 0%, #FF1493 100%)",
                    boxShadow: "0 4px 15px rgba(0, 212, 255, 0.3)"
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
                      <span className="text-sm">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      <span className="text-sm">Connect Wallet</span>
                    </>
                  )}
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{ backgroundColor: "#1A1A2E" }}
          >
            <nav
              className="flex flex-col p-4 space-y-2 border-b"
              style={{ borderColor: "rgba(0, 212, 255, 0.2)" }}
            >
              <Link
                href="/games"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Games
              </Link>
              <Link
                href="/sports"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Sports
              </Link>
              <Link
                href="/promotions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Promotions
              </Link>
              <Link
                href="/vip"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                VIP Club
              </Link>

              {authenticated && walletAddress ? (
                <>
                  {/* Mobile User Info */}
                  <div className="px-4 py-3 border-t border-gray-700 mt-2">
                    <div className="flex items-center space-x-3 mb-3">
                      {walletAddress && <JazziconAvatar address={walletAddress} size={40} />}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {formatAddress(walletAddress)}
                        </p>
                        <p className="text-xs" style={{ color: "#00D4FF" }}>
                          {formatPoints(points)} points
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Menu Actions */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      copyAddress();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start px-4 py-3 h-auto font-normal"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Copy Address
                  </Button>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>

                  <Link
                    href="/transactions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <History className="w-4 h-4 mr-3" />
                    Transaction History
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>

                  <a
                    href={`https://etherscan.io/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-[#252547]"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <ExternalLink className="w-4 h-4 mr-3" />
                    View on Etherscan
                  </a>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start px-4 py-3 h-auto font-normal"
                    style={{ color: "#FF1493" }}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Disconnect Wallet
                  </Button>
                </>
              ) : (
                <div className="px-4 py-3 border-t border-gray-700 mt-2">
                  <Button
                    onClick={() => {
                      login();
                      setMobileMenuOpen(false);
                    }}
                    disabled={!ready || isLoading}
                    className="w-full casino-button py-3 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #00D4FF 0%, #FF1493 100%)",
                      boxShadow: "0 4px 15px rgba(0, 212, 255, 0.3)"
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        <span className="text-sm">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        <span className="text-sm">Connect Wallet</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .casino-gradient-text {
          background: linear-gradient(135deg, #00D4FF 0%, #FF1493 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </>
  );
}