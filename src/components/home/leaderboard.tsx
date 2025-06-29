'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Award, Medal, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  username: string;
  wagered: number;
  profit: number;
  avatar?: string;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    // Mock data - replace with API call
    setLeaderboard([
      { rank: 1, username: 'WhaleKing', wagered: 125000, profit: 45000 },
      { rank: 2, username: 'LuckyAce', wagered: 98000, profit: 32000 },
      { rank: 3, username: 'DiamondHands', wagered: 87000, profit: 28000 },
      { rank: 4, username: 'CryptoShark', wagered: 76000, profit: 19000 },
      { rank: 5, username: 'MoonBet', wagered: 65000, profit: 15000 },
      { rank: 6, username: 'RollerHigh', wagered: 54000, profit: 12000 },
      { rank: 7, username: 'GoldRush', wagered: 43000, profit: 9000 },
      { rank: 8, username: 'BetMaster', wagered: 32000, profit: 7000 },
    ]);
  }, [timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5" style={{ color: '#FFD700' }} />;
      case 2:
        return <Medal className="w-5 h-5" style={{ color: '#C0C0C0' }} />;
      case 3:
        return <Award className="w-5 h-5" style={{ color: '#CD7F32' }} />;
      default:
        return <span className="text-sm font-bold" style={{ color: '#A0A0B8' }}>#{rank}</span>;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}k`;
    }
    return `$${num}`;
  };

  return (
    <div className="casino-card p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6" style={{ color: '#00D4FF' }} />
          Leaderboard
        </h3>
        <TrendingUp className="w-5 h-5" style={{ color: '#00FF88' }} />
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-4">
        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${timeframe === period
                ? 'bg-gradient-to-r from-[#00D4FF] to-[#9D00FF] text-white'
                : 'bg-[#1A1A2E] text-gray-400 hover:text-white hover:bg-[#1A1A2E]/80'
              }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 space-y-3 mb-4">
        {leaderboard.slice(0, 8).map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative overflow-hidden rounded-lg transition-all ${entry.rank <= 3
                ? 'bg-gradient-to-r from-[#252547] to-[#1A1A2E] border border-[#00D4FF]/30 hover:border-[#00D4FF]/50'
                : 'bg-[#1A1A2E] hover:bg-[#252547]'
              }`}
          >
            {/* Background glow for top 3 */}
            {entry.rank <= 3 && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `linear-gradient(135deg, ${entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'
                    }, transparent)`,
                }}
              />
            )}

            <div className="relative p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-white">{entry.username}</p>
                  <p className="text-xs" style={{ color: '#A0A0B8' }}>
                    {formatNumber(entry.wagered)} wagered
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold ${entry.profit > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {entry.profit > 0 ? '+' : ''}{formatNumber(entry.profit)}
                </p>
                <p className="text-xs" style={{ color: '#666' }}>
                  profit
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-lg border border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all flex items-center justify-center gap-2 group"
      >
        <span>View Full Leaderboard</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </div>
  );
}