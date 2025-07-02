// src/components/games/mines/multiplier-display.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Zap, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface MultiplierDisplayProps {
  currentMultiplier: number;
  betAmount: number;
  onCashOut: () => void;
  isCashingOut: boolean;
  autoCashOut: number | null;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function MultiplierDisplay({
  currentMultiplier,
  betAmount,
  onCashOut,
  isCashingOut,
  autoCashOut,
}: MultiplierDisplayProps) {
  const prevMultiplier = usePrevious(currentMultiplier);
  const [showIncrease, setShowIncrease] = useState(false);
  const potentialWin = Math.floor(betAmount * currentMultiplier);
  const profit = potentialWin - betAmount;

  // Detect multiplier changes
  useEffect(() => {
    if (prevMultiplier !== undefined && currentMultiplier > prevMultiplier) {
      setShowIncrease(true);
      const timer = setTimeout(() => setShowIncrease(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentMultiplier, prevMultiplier]);

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-gray-700 shadow-2xl p-6 relative overflow-hidden">
      {/* Animated increase indicator */}
      <AnimatePresence>
        {showIncrease && (
          <motion.div
            // Starts slightly lower and fades in
            initial={{ opacity: 0, y: 10 }}
            // Animates to its final position and full opacity
            animate={{ opacity: 1, y: 0 }}
            // Exits by moving up and fading out
            exit={{ opacity: 0, y: -10 }}
            transition={{ ease: "easeOut", duration: 0.5 }}
            className="absolute top-4 right-4 flex items-center gap-1 text-green-400 font-bold z-10"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-lg">
              +{prevMultiplier !== undefined ? (currentMultiplier - prevMultiplier).toFixed(2) : '0.00'}×
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Current Multiplier</span>
          </div>

          <div className="relative">
            <motion.div
              key={currentMultiplier}
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
            >
              {currentMultiplier.toFixed(2)}×
            </motion.div>

            {/* Previous multiplier indicator */}
            {prevMultiplier !== undefined && prevMultiplier !== currentMultiplier && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -10 }}
                className="absolute top-0 left-0 text-2xl text-gray-500 line-through"
              >
                {prevMultiplier.toFixed(2)}×
              </motion.div>
            )}
          </div>

          <div className="mt-2 space-y-1">
            <div className="text-sm text-gray-400">
              Potential Win:
              <motion.span
                key={`win-${potentialWin}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-white font-semibold ml-1"
              >
                {potentialWin.toLocaleString()} pts
              </motion.span>
            </div>
            <div className="text-sm text-gray-400">
              Profit:
              <motion.span
                key={`profit-${profit}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`font-semibold ml-1 ${profit > 0 ? 'text-green-400' : 'text-gray-400'}`}
              >
                +{profit.toLocaleString()} pts
              </motion.span>
            </div>
          </div>
        </div>

        <Button
          onClick={onCashOut}
          disabled={isCashingOut}
          className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-6 text-lg shadow-lg disabled:opacity-50 relative"
        >
          {/* Button animation when multiplier increases */}
          <AnimatePresence>
            {showIncrease && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-700/20 rounded-lg"
              />
            )}
          </AnimatePresence>

          <span className="relative z-10">
            {isCashingOut ? (
              <div className="flex items-center justify-center cursor-pointer">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Cashing Out...
              </div>
            ) : (
              <div className="flex items-center justify-center cursor-pointer">
                <Zap className="w-5 h-5 mr-2" />
                Cash Out
              </div>
            )}
          </span>
        </Button>
      </div>

      {autoCashOut && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Auto Cash-Out at:</span>
            <motion.span
              key={`auto-${autoCashOut}`}
              animate={{
                scale: currentMultiplier >= autoCashOut ? [1, 1.1, 1] : 1,
                color: currentMultiplier >= autoCashOut ? '#10B981' : '#FFFFFF'
              }}
              transition={{
                duration: 0.5,
                repeat: currentMultiplier >= autoCashOut ? Infinity : 0
              }}
              className="font-semibold"
            >
              {autoCashOut.toFixed(2)}×
            </motion.span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${Math.min((currentMultiplier / autoCashOut) * 100, 100)}%`
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}