// src/types/mines.ts

export type GameStatus = "idle" | "active" | "won" | "lost" | "cashed_out";

export interface GameState {
  gameId: string | null;
  gameStatus: GameStatus;
  revealedCells: Set<number>;
  minePositions: Set<number>;
  minesCount: number;
  gridSize: number;
  betAmount: number;
  currentMultiplier: number;
  autoCashOut: number | null;
}

export interface BettingConfig {
  minBet: number;
  maxBet: number;
  minMines: number;
  maxMines: number;
}

export interface RevealResponse {
  isMine: boolean;
  cellIndex: number;
  gameStatus: GameStatus; // Use the new type
  revealedCount: number;
  currentMultiplier: number;
  minePositions?: number[];
  userPoints?: number;
}

export interface CashOutResponse {
  success: boolean;
  winAmount: number;
  multiplier: number;
  profit: number;
  userPoints: number;
}

export interface GameHistoryItem {
  id: string;
  betAmount: number;
  minesCount: number;
  gameStatus: string;
  cashOutMultiplier: number | null;
  winAmount: number | null;
  profit: number;
  revealedCount: number;
  createdAt: Date;
}
