//  src/components/games/mines/game-stats.tsx
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, Bomb, Activity, Trophy } from 'lucide-react';
import { GameState } from '@/types/mines';

interface GameStatsProps {
  gameState: GameState;
  safeCellsFound: number;
  totalSafeCells: number;
}

export function GameStats({ gameState, safeCellsFound, totalSafeCells }: GameStatsProps) {
  const completionRate = gameState.gameStatus === 'won' ? 100 : Math.round((safeCellsFound / totalSafeCells) * 100);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-xl border-purple-700/50 hover:scale-105 transition-transform duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Safe Cells Found</div>
              <motion.div
                className="text-3xl font-bold text-purple-400"
                key={safeCellsFound}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {safeCellsFound}
              </motion.div>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-xl border-green-700/50 hover:scale-105 transition-transform duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Completion Rate</div>
              <div className="text-3xl font-bold text-green-400 flex items-center gap-2">
                {completionRate}%
                {gameState.gameStatus === 'won' && (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Trophy className="w-6 h-6" />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-xl border-red-700/50 hover:scale-105 transition-transform duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Mines</div>
              <div className="text-3xl font-bold text-red-400">
                {gameState.minesCount}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Bomb className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Betting Stats */}
      {gameState.gameStatus === 'active' && gameState.betAmount > 0 && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-gray-700 mt-6">
          <CardHeader className="border-b border-gray-700 pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Live Betting Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Bet Amount</span>
                <span className="font-medium text-white">
                  {gameState.betAmount.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current Win</span>
                <span className="font-medium text-green-400">
                  {Math.floor(gameState.betAmount * gameState.currentMultiplier).toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Profit</span>
                <span className="font-medium text-purple-400">
                  +{Math.floor(gameState.betAmount * (gameState.currentMultiplier - 1)).toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Next Reveal</span>
                <span className={`font-medium ${gameState.minesCount <= 5 ? 'text-green-400' :
                    gameState.minesCount <= 10 ? 'text-yellow-400' :
                      'text-red-400'
                  }`}>
                  ×{getNextMultiplier(safeCellsFound, gameState.minesCount).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getNextMultiplier(safeCellsRevealed: number, minesCount: number): number {
  // Simplified multiplier calculation
  const totalCells = 25;
  const safeCells = totalCells - minesCount;
  const remainingSafeCells = safeCells - safeCellsRevealed;
  const remainingCells = totalCells - safeCellsRevealed - minesCount;

  if (remainingCells <= 0 || remainingSafeCells <= 0) return 1;

  const probability = remainingSafeCells / remainingCells;
  const riskFactor = 1 + (minesCount / totalCells) * 2;

  return 1 + (1 / probability - 1) * riskFactor * 0.98; // 0.98 is house edge
}