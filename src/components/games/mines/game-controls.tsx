// src/components/games/mines/game-controls.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw, Loader2 } from 'lucide-react';
import { GameState, BettingConfig } from '@/types/mines';

interface GameControlsProps {
  selectedMines: number;
  setSelectedMines: (mines: number) => void;
  gameState: GameState;
  onStartGame: () => void;
  isStartingGame: boolean;
  safeCellsFound: number;
  totalSafeCells: number;
  config: BettingConfig;
}

export function GameControls({
  selectedMines,
  setSelectedMines,
  gameState,
  onStartGame,
  isStartingGame,
  safeCellsFound,
  totalSafeCells,
  config,
}: GameControlsProps) {
  const getRiskLevel = (mines: number) => {
    if (mines <= 5) return { text: 'Low', color: 'text-green-400' };
    if (mines <= 10) return { text: 'Medium', color: 'text-yellow-400' };
    if (mines <= 15) return { text: 'High', color: 'text-orange-400' };
    return { text: 'Extreme', color: 'text-red-400' };
  };

  const riskLevel = getRiskLevel(selectedMines);

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-gray-700 shadow-2xl">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Game Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="minesCount" className="text-gray-300 text-sm font-medium">
              Number of Mines: <span className="text-purple-400 font-bold">{selectedMines}</span>
            </Label>
            <span className={`text-sm font-medium ${riskLevel.color}`}>
              {riskLevel.text} Risk
            </span>
          </div>
          <Slider
            id="minesCount"
            value={[selectedMines]}
            onValueChange={(value: number[]) => setSelectedMines(value[0])}
            disabled={gameState.gameStatus === 'active'}
            min={config.minMines}
            max={config.maxMines}
            step={1}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Safer</span>
            <span>Riskier</span>
          </div>
        </div>

        <div className="space-y-3 bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Cells:</span>
            <span className="font-bold text-white">25</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Safe Cells:</span>
            <span className="font-bold text-green-400">{25 - selectedMines}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mines:</span>
            <span className="font-bold text-red-400">{selectedMines}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Win Probability:</span>
            <span className="font-bold text-purple-400">
              {((totalSafeCells / 25) * 100).toFixed(1)}%
            </span>
          </div>
          {gameState.gameStatus === 'active' && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress:</span>
                <span className="font-bold text-purple-400">{safeCellsFound}/{totalSafeCells}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(safeCellsFound / totalSafeCells) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={onStartGame}
          className="w-full bg-gradient-to-r cursor-pointer from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={gameState.gameStatus === 'active' || isStartingGame}
        >
          {isStartingGame ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting Game...
            </>
          ) : gameState.gameStatus === 'active' ? (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Game in Progress
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}