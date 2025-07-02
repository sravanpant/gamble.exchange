// src/components/games/mines/betting-panel.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp } from 'lucide-react';
import { BettingConfig } from '@/types/mines';

interface BettingPanelProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  autoCashOut: number | null;
  setAutoCashOut: (value: number | null) => void;
  gameStatus: string;
  userPoints: number;
  config: BettingConfig;
}

export function BettingPanel({
  betAmount,
  setBetAmount,
  autoCashOut,
  setAutoCashOut,
  gameStatus,
  userPoints,
  config,
}: BettingPanelProps) {
  const handleBetChange = (value: string) => {
    const amount = parseInt(value) || 0;
    setBetAmount(Math.max(config.minBet, Math.min(config.maxBet, amount)));
  };

  const handleAutoCashOutChange = (value: string) => {
    const multiplier = parseFloat(value);
    if (isNaN(multiplier) || multiplier <= 1) {
      setAutoCashOut(null);
    } else {
      setAutoCashOut(multiplier);
    }
  };

  const quickBetOptions = [100, 500, 1000, 5000];

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-gray-700 shadow-2xl">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          Betting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Balance Display */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Your Balance</span>
            <span className="text-xl font-bold text-green-400">{userPoints.toLocaleString()} pts</span>
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <Label htmlFor="betAmount" className="text-gray-300 text-sm font-medium mb-2 block">
            Bet Amount
          </Label>
          <Input
            id="betAmount"
            type="number"
            value={betAmount}
            onChange={(e) => handleBetChange(e.target.value)}
            disabled={gameStatus === 'active'}
            min={config.minBet}
            max={config.maxBet}
            className="bg-gray-800/50 border-gray-600 text-white"
          />
          <div className="flex gap-2 mt-2">
            {quickBetOptions.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount)}
                disabled={gameStatus === 'active' || amount > userPoints}
                className="flex-1 bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Auto Cash Out */}
        <div>
          <Label htmlFor="autoCashOut" className="text-gray-300 text-sm font-medium mb-2 block">
            Auto Cash-Out <span className="text-xs text-gray-500">(Optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="autoCashOut"
              type="number"
              step="0.1"
              placeholder="e.g., 2.5"
              value={autoCashOut || ''}
              onChange={(e) => handleAutoCashOutChange(e.target.value)}
              disabled={gameStatus === 'active'}
              className="bg-gray-800/50 border-gray-600 text-white pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">×</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Automatically cash out when reaching this multiplier
          </p>
        </div>

        {/* Risk Indicator */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Potential Win</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-400">
            {autoCashOut 
              ? `${(betAmount * autoCashOut).toLocaleString()} pts`
              : 'Variable'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}