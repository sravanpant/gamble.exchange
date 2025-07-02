'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, TrendingUp, TrendingDown } from 'lucide-react';

interface LiveBet {
  id: string;
  user: string;
  game: string;
  bet: number;
  multiplier: number;
  win: number;
  type: 'win' | 'loss';
}

export function LiveBetsTicker() {
  const [bets, setBets] = useState<LiveBet[]>([]);

  const generateMockBet = (): LiveBet => {
    const games = ['Crash', 'Dice', 'Slots', 'Roulette', 'Blackjack'];
    const bet = Math.floor(Math.random() * 1000) + 10;
    const isWin = Math.random() > 0.5;
    const multiplier = isWin ? (Math.random() * 10 + 1) : 0;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      user: `Player${Math.floor(Math.random() * 9999)}`,
      game: games[Math.floor(Math.random() * games.length)],
      bet,
      multiplier: parseFloat(multiplier.toFixed(2)),
      win: parseFloat((bet * multiplier).toFixed(2)),
      type: isWin ? 'win' : 'loss',
    };
  };

  const generateMockBets = useCallback((count: number): LiveBet[] => {
    return Array.from({ length: count }, generateMockBet);
  }, []);

  useEffect(() => {
    // Generate initial bets
    const initialBets = generateMockBets(10);
    setBets(initialBets);

    // Add new bet every 2-5 seconds
    const interval = setInterval(() => {
      const newBet = generateMockBet();
      setBets(prev => [newBet, ...prev].slice(0, 20));
    }, Math.random() * 3000 + 2000);

    return () => clearInterval(interval);
  }, [generateMockBets]);

  return (
    <div className="w-full overflow-hidden py-3 sm:py-4" style={{ backgroundColor: '#0F0F1E' }}>
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: '#A0A0B8' }}>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
          Live Bets
        </h3>
        
        <div className="relative overflow-hidden">
          <div className="flex gap-3 sm:gap-4 animate-scroll">
            {[...bets, ...bets].map((bet, index) => (
              <motion.div
                key={`${bet.id}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0"
              >
                <div 
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border flex items-center gap-2 sm:gap-3"
                  style={{
                    backgroundColor: '#252547',
                    borderColor: bet.type === 'win' ? '#00FF88' : '#FF4444',
                  }}
                >
                  <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#00D4FF' }} />
                  <div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="font-medium text-xs sm:text-sm">{bet.user}</span>
                      <span className="text-[10px] sm:text-xs" style={{ color: '#666' }}>{bet.game}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <span>${bet.bet}</span>
                      {bet.type === 'win' ? (
                        <>
                          <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: '#00FF88' }} />
                          <span style={{ color: '#00FF88' }}>{bet.multiplier}x</span>
                          <span className="font-bold" style={{ color: '#00FF88' }}>
                            +${bet.win}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: '#FF4444' }} />
                          <span style={{ color: '#FF4444' }}>Lost</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}