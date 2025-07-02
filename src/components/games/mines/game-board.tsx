// src/components/games/mines/game-board.tsx

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bomb, Zap, Sparkles } from 'lucide-react';
import { GameState } from '@/types/mines';

interface GameBoardProps {
  gameState: GameState;
  onRevealCell: (index: number) => void;
}

export function GameBoard({ gameState, onRevealCell }: GameBoardProps) {
  const renderCell = (index: number) => {
    const isRevealed = gameState.revealedCells.has(index);
    const isMine = gameState.minePositions.has(index);
    const showMine = gameState.gameStatus !== 'active' && isMine;

    return (
      <motion.button
        key={index}
        whileHover={{ scale: gameState.gameStatus === 'active' && !isRevealed ? 1.05 : 1 }}
        whileTap={{ scale: gameState.gameStatus === 'active' && !isRevealed ? 0.95 : 1 }}
        onClick={() => onRevealCell(index)}
        disabled={gameState.gameStatus !== 'active' || isRevealed}
        className={`
          aspect-square rounded-xl transition-all duration-300 transform shadow-lg
          ${isRevealed && !isMine ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30' : ''}
          ${isRevealed && isMine ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30' : ''}
          ${showMine && !isRevealed ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30' : ''}
          ${!isRevealed && !showMine ? 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-900/50' : ''}
          ${gameState.gameStatus !== 'active' ? 'cursor-not-allowed' : 'cursor-pointer'}
          flex items-center justify-center relative overflow-hidden
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10"></div>
        {isRevealed && !isMine && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-white font-bold flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        )}
        {(isRevealed && isMine) || (showMine && isMine) ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Bomb className="w-6 h-6 text-white" />
          </motion.div>
        ) : null}
      </motion.button>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-gray-700 shadow-2xl">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Minefield
          <Zap className="w-5 h-5 text-yellow-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-6 shadow-inner">
          <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto">
            {Array.from({ length: 25 }, (_, i) => renderCell(i))}
          </div>
        </div>

        <div className="mt-6 flex justify-center flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <div className="w-4 h-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded shadow-lg"></div>
            <span className="text-gray-400">Hidden</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded shadow-lg"></div>
            <span className="text-gray-400">Safe</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded shadow-lg"></div>
            <span className="text-gray-400">Mine</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}