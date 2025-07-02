'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCasinoStore } from '@/store/useStore';
import { GameState, BettingConfig } from '@/types/mines';
import { GameControls } from '@/components/games/mines/game-controls';
import { GameBoard } from '@/components/games/mines/game-board';
// import { GameStats } from '@/components/games/mines/game-stats';
import { BettingPanel } from '@/components/games/mines/betting-panel';
import { MultiplierDisplay } from '@/components/games/mines/multiplier-display';
import { GameResultDialog } from '@/components/games/mines/game-result-dialog';

const BETTING_CONFIG: BettingConfig = {
  minBet: 10,
  maxBet: 10000,
  minMines: 1,
  maxMines: 24,
};

export default function MinesGame() {
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    gameStatus: 'idle',
    revealedCells: new Set(),
    minePositions: new Set(),
    minesCount: 5,
    gridSize: 25,
    betAmount: 100,
    currentMultiplier: 1.0,
    autoCashOut: null,
  });
  const [selectedMines, setSelectedMines] = useState(5);
  const [betAmount, setBetAmount] = useState(100);
  const [autoCashOut, setAutoCashOut] = useState<number | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isCashingOut, setIsCashingOut] = useState(false);

  const { setIsLoading, user, setPoints, points } = useCasinoStore();

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  useEffect(() => {
    console.log("Multiplier updated:", gameState.currentMultiplier);
  }, [gameState.currentMultiplier]);

  useEffect(() => {
    if (gameState.gameStatus === 'lost' || gameState.gameStatus === 'cashed_out' || gameState.gameStatus === 'won') {
      setShowResultDialog(true);
    }
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus === 'won') {
      const updatePointsForWin = async () => {
        try {
          const response = await fetch('/api/user/points', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: user?.walletAddress,
              operation: 'add',
              amount: Math.floor(gameState.betAmount * gameState.currentMultiplier)
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setPoints(data.points);
          }
        } catch (error) {
          console.error('Failed to update points for win:', error);
        }
      };
      updatePointsForWin();
    }
  }, [gameState.gameStatus, gameState.betAmount, gameState.currentMultiplier, user, setPoints]);

  const handleCashOut = useCallback(async () => {
    if (gameState.gameStatus !== 'active' || !gameState.gameId) return;

    setIsCashingOut(true);
    try {
      const response = await fetch('/api/games/mines/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameState.gameId,
          userId: user?.walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPoints(data.userPoints);

        setGameState(prev => ({
          ...prev,
          gameStatus: 'cashed_out',
          minePositions: new Set(data.minePositions),
        }));
      }
    } catch (error) {
      console.error('Failed to cash out:', error);
    } finally {
      setIsCashingOut(false);
    }
  }, [gameState.gameStatus, gameState.gameId, user, setPoints]);

  useEffect(() => {
    if (gameState.gameStatus === 'active' && autoCashOut && gameState.currentMultiplier >= autoCashOut) {
      handleCashOut();
    }
  }, [gameState.currentMultiplier, autoCashOut, gameState.gameStatus, handleCashOut]);

  const startNewGame = async () => {
    if (!user || betAmount > user.points) {
      alert('Insufficient points!');
      return;
    }

    setIsStartingGame(true);
    try {
      const response = await fetch('/api/games/mines/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minesCount: selectedMines,
          betAmount,
          autoCashOut,
          userId: user.walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPoints(data.userPoints);

        setGameState({
          gameId: data.gameId,
          gameStatus: 'active',
          revealedCells: new Set(),
          minePositions: new Set(),
          minesCount: data.minesCount,
          gridSize: data.gridSize,
          betAmount: data.betAmount,
          currentMultiplier: 1.0,
          autoCashOut,
        });
        setShowResultDialog(false);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsStartingGame(false);
    }
  };

  const revealCell = async (cellIndex: number) => {
    if (gameState.gameStatus !== 'active' || gameState.revealedCells.has(cellIndex)) {
      return;
    }

    try {
      const response = await fetch('/api/games/mines/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameState.gameId,
          cellIndex,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newRevealedCells = new Set([...gameState.revealedCells, cellIndex]);
        
        setGameState(prev => ({
          ...prev,
          revealedCells: newRevealedCells,
          gameStatus: data.gameStatus,
          currentMultiplier: data.currentMultiplier,
          minePositions: data.minePositions ? new Set(data.minePositions) : prev.minePositions,
        }));
      } else {
        // If the API returns an error (e.g., 400 for 'lost'), handle it here
        if (response.status === 400 && data.gameStatus === 'lost') {
            setGameState(prev => ({
                ...prev,
                gameStatus: 'lost',
                revealedCells: new Set([...prev.revealedCells, cellIndex]),
                minePositions: new Set(data.minePositions),
            }));
        }
      }
    } catch (error) {
      console.error('Failed to reveal cell:', error);
    }
  };

  const safeCellsFound = Array.from(gameState.revealedCells).filter(
    cell => !gameState.minePositions.has(cell)
  ).length;
  const totalSafeCells = gameState.gridSize - gameState.minesCount;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
            Mines Game
          </h1>
          <p className="text-gray-400">Find the safe spots and avoid the mines!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <GameControls
              selectedMines={selectedMines}
              setSelectedMines={setSelectedMines}
              gameState={gameState}
              onStartGame={startNewGame}
              isStartingGame={isStartingGame}
              safeCellsFound={safeCellsFound}
              totalSafeCells={totalSafeCells}
              config={BETTING_CONFIG}
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            {gameState.gameStatus === 'active' && (
              <MultiplierDisplay
                currentMultiplier={gameState.currentMultiplier}
                betAmount={gameState.betAmount}
                onCashOut={handleCashOut}
                isCashingOut={isCashingOut}
                autoCashOut={autoCashOut}
              />
            )}

            <GameBoard
              gameState={gameState}
              onRevealCell={revealCell}
            />
          </div>

          <div className="lg:col-span-3">
            <BettingPanel
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              autoCashOut={autoCashOut}
              setAutoCashOut={setAutoCashOut}
              gameStatus={gameState.gameStatus}
              userPoints={points}
              config={BETTING_CONFIG}
            />
          </div>
        </div>
      </div>
      <GameResultDialog
        showDialog={showResultDialog}
        setShowDialog={setShowResultDialog}
        gameState={gameState}
        safeCellsFound={safeCellsFound}
        totalSafeCells={totalSafeCells}
      />
    </div>
  );
}