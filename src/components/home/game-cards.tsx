'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Diamond, Gamepad2, PlayCircle, Users } from 'lucide-react';
import Link from 'next/link';

interface Game {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  minBet: number;
  maxBet: number;
  players?: number;
  isLive?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export function GameCards() {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<'all' | 'slots' | 'live' | 'table'>('all');

  useEffect(() => {
    // Mock data - replace with API call
    setGames([
      {
        id: '1',
        name: 'Mega Fortune',
        type: 'slots',
        thumbnail: '/games/mega-fortune.jpg',
        minBet: 0.1,
        maxBet: 500,
        players: 234,
        isFeatured: true,
      },
      {
        id: '2',
        name: 'Lightning Roulette',
        type: 'live',
        thumbnail: '/games/lightning-roulette.jpg',
        minBet: 1,
        maxBet: 1000,
        players: 89,
        isLive: true,
      },
      {
        id: '3',
        name: 'Blackjack VIP',
        type: 'table',
        thumbnail: '/games/blackjack-vip.jpg',
        minBet: 10,
        maxBet: 5000,
        players: 45,
        isNew: true,
      },
      {
        id: '4',
        name: 'Sweet Bonanza',
        type: 'slots',
        thumbnail: '/games/sweet-bonanza.jpg',
        minBet: 0.2,
                maxBet: 100,
        players: 567,
      },
      {
        id: '5',
        name: 'Crazy Time',
        type: 'live',
        thumbnail: '/games/crazy-time.jpg',
        minBet: 0.5,
        maxBet: 500,
        players: 1234,
        isLive: true,
        isFeatured: true,
      },
      {
        id: '6',
        name: 'Book of Dead',
        type: 'slots',
        thumbnail: '/games/book-of-dead.jpg',
        minBet: 0.1,
        maxBet: 200,
        players: 345,
      },
    ]);
  }, []);

  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    return game.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'slots':
        return <Diamond className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'live':
        return <Zap className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'table':
        return <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#00D4FF' }} />
          Popular Games
        </h2>
        
        {/* Filter Buttons - Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
          {(['all', 'slots', 'live', 'table'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                filter === type
                  ? 'casino-button'
                  : 'bg-[#252547] text-gray-400 hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Link href={`/games/${game.id}`}>
              <div className="casino-card overflow-hidden cursor-pointer transition-all duration-300 group-hover:border-[#00D4FF]/50">
                {/* Game Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-blue-900 overflow-hidden">
                  {/* Placeholder for actual image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 opacity-20" />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 flex justify-between">
                    <div className="flex gap-1 sm:gap-2">
                      {game.isLive && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-red-500 text-white flex items-center gap-1">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                      {game.isNew && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-green-500 text-white">
                          NEW
                        </span>
                      )}
                      {game.isFeatured && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold casino-gradient text-white">
                          HOT
                        </span>
                      )}
                    </div>
                    <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-black/50 backdrop-blur-sm flex items-center gap-1">
                      {getTypeIcon(game.type)}
                      <span className="text-[10px] sm:text-xs capitalize hidden sm:inline">{game.type}</span>
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-sm sm:text-lg mb-2 truncate">{game.name}</h3>
                  
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <p style={{ color: '#A0A0B8' }}>Min Bet</p>
                      <p className="font-semibold">${game.minBet}</p>
                    </div>
                    <div className="text-right">
                      <p style={{ color: '#A0A0B8' }}>Max Bet</p>
                      <p className="font-semibold">${game.maxBet}</p>
                    </div>
                  </div>
                  
                  {game.players && (
                    <div className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" style={{ color: '#00FF88' }}>
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{game.players} playing</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* View All Games Button */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link href="/games">
          <button className="casino-button-secondary text-sm sm:text-base px-6 py-2.5 sm:py-3">
            View All Games
          </button>
        </Link>
      </div>
    </div>
  );
}