// src/components/games/mines/game-result-dialog.tsx
import { X, Trophy, Bomb, Coins, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GameState } from '@/types/mines';

interface GameResultDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  gameState: GameState;
  safeCellsFound: number;
  totalSafeCells: number;
}

export function GameResultDialog({
  showDialog,
  setShowDialog,
  gameState,
  safeCellsFound,
  totalSafeCells,
}: GameResultDialogProps) {
  const isWon = gameState.gameStatus === 'won';
  const isCashedOut = gameState.gameStatus === 'cashed_out';
  const isLost = gameState.gameStatus === 'lost';

  // Calculate winnings
  const winAmount = Math.floor(gameState.betAmount * gameState.currentMultiplier);
  const profit = winAmount - gameState.betAmount;
  const profitPercentage = gameState.betAmount > 0 ? ((profit / gameState.betAmount) * 100).toFixed(1) : '0';

  const getStatusIcon = () => {
    if (isWon) return <Trophy className="w-10 h-10 text-white" />;
    if (isCashedOut) return <Coins className="w-10 h-10 text-white" />;
    return <Bomb className="w-10 h-10 text-white" />;
  };

  const getStatusColor = () => {
    if (isWon) return 'from-green-500 to-emerald-600';
    if (isCashedOut) return 'from-purple-500 to-pink-600';
    return 'from-red-500 to-rose-600';
  };

  const getStatusText = () => {
    if (isWon) return 'Victory!';
    if (isCashedOut) return 'Cashed Out!';
    return 'Game Over!';
  };

  const getStatusMessage = () => {
    if (isWon) return 'Congratulations! You found all safe cells!';
    if (isCashedOut) return 'Smart move! You secured your winnings!';
    return 'Better luck next time! Adjust your strategy and try again.';
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 text-white max-w-md">
        <button
          onClick={() => setShowDialog(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${getStatusColor()} rounded-full flex items-center justify-center shadow-lg`}>
                {getStatusIcon()}
              </div>
              <span className={`bg-gradient-to-r ${isWon ? 'from-green-400 to-emerald-400' :
                  isCashedOut ? 'from-purple-400 to-pink-400' :
                    'from-red-400 to-rose-400'
                } bg-clip-text text-transparent`}>
                {getStatusText()}
              </span>
            </motion.div>
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4 mt-4">
              <div className="text-center text-gray-300">
                {getStatusMessage()}
              </div>

              {/* Betting Results */}
              {gameState.betAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-lg p-4 ${isLost ? 'bg-red-900/20 border border-red-800/50' :
                      'bg-green-900/20 border border-green-800/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Betting Summary</span>
                    {!isLost && (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${profit > 0 ? 'text-green-400' : 'text-gray-400'
                        }`}>
                        {profit > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {profit > 0 ? '+' : ''}{profitPercentage}%
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Bet Amount</span>
                      <span className="font-medium">{gameState.betAmount.toLocaleString()} pts</span>
                    </div>

                    {!isLost && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Final Multiplier</span>
                          <span className="font-medium text-purple-400">
                            {gameState.currentMultiplier.toFixed(2)}×
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Total Win</span>
                          <span className="font-medium text-green-400">
                            {winAmount.toLocaleString()} pts
                          </span>
                        </div>

                        <div className="pt-2 border-t border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Profit</span>
                            <span className={`font-bold text-lg ${profit > 0 ? 'text-green-400' : 'text-gray-400'
                              }`}>
                              {profit > 0 ? '+' : ''}{profit.toLocaleString()} pts
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {isLost && (
                      <div className="pt-2 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Lost</span>
                          <span className="font-bold text-lg text-red-400">
                            -{gameState.betAmount.toLocaleString()} pts
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Game Stats */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Safe Cells Found</span>
                  <span className="font-bold text-lg">{safeCellsFound} / {totalSafeCells}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completion</span>
                  <span className="font-bold text-lg">
                    {Math.round((safeCellsFound / totalSafeCells) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Difficulty</span>
                  <span className="font-bold text-lg flex items-center gap-1">
                    <Bomb className="w-4 h-4" />
                    {gameState.minesCount} mines
                  </span>
                </div>
              </div>

              {/* Special Achievement Badge */}
              <AnimatePresence>
                {isWon && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-4 py-2 rounded-full">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Perfect Clear!</span>
                    </div>
                  </motion.div>
                )}

                {isCashedOut && gameState.currentMultiplier >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 font-semibold">High Roller!</span>
                    </div>
                  </motion.div>
                )}

                {isLost && safeCellsFound === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-rose-500/20 px-4 py-2 rounded-full">
                      <Bomb className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-semibold">First Try Boom!</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}