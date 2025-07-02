import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RevealResponse, GameStatus } from "@/types/mines";

function calculateMultiplier(
  revealedSafeCells: number,
  totalMines: number,
  gridSize: number = 25
): number {
  const totalSafeCells = gridSize - totalMines;
  if (revealedSafeCells === 0) return 1.0;
  if (revealedSafeCells >= totalSafeCells) {
    // A simplified, but effective win calculation
    return (gridSize / (gridSize - totalMines)) * (totalMines / 1.5)
  }

  // A more balanced multiplier calculation
  const houseEdge = 0.98;
  const riskFactor = 1 + (totalMines / gridSize) * 2;
  let multiplier = 1.0;
  for (let i = 0; i < revealedSafeCells; i++) {
    const probability = (totalSafeCells - i) / (gridSize - i);
    multiplier += (1 / probability - 1) * riskFactor;
  }
  return parseFloat((multiplier * houseEdge).toFixed(4));
}


export async function POST(request: Request) {
  try {
    const { gameId, cellIndex } = await request.json();
    
    const game = await prisma.minesGame.findUnique({
      where: { id: gameId },
      include: { user: true }
    });
    
    if (!game || !game.user) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    if (game.betAmount === null) {
      return NextResponse.json(
        { error: 'Game bet amount is missing' },
        { status: 500 }
      );
    }

    if (game.gameStatus !== 'active') {
        return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    }
    
    const minePositions = game.minePositions as number[];
    const revealedCells = game.revealedCells as number[];
    
    if (revealedCells.includes(cellIndex)) {
      return NextResponse.json({ error: 'Cell already revealed' }, { status: 400 });
    }
    
    const isMine = minePositions.includes(cellIndex);
    const newRevealedCells = [...revealedCells, cellIndex];
    
    let gameStatus: GameStatus = 'active';
    let currentMultiplier = game.currentMultiplier;
    let winAmount = 0;
    
    if (isMine) {
      gameStatus = 'lost';
      currentMultiplier = 0;
      await prisma.minesGame.update({
        where: { id: gameId },
        data: {
          revealedCells: newRevealedCells,
          gameStatus,
        },
      });
      return NextResponse.json({
          isMine: true,
          cellIndex,
          gameStatus: 'lost',
          revealedCount: newRevealedCells.length,
          currentMultiplier: 0,
          minePositions,
      }, { status: 400 });

    } else {
      const safeCellsRevealed = newRevealedCells.filter(
        cell => !minePositions.includes(cell)
      ).length;
      
      currentMultiplier = calculateMultiplier(
        safeCellsRevealed,
        game.minesCount
      );
      
      const totalSafeCells = 25 - game.minesCount;
      if (safeCellsRevealed === totalSafeCells) {
        gameStatus = 'won';
        winAmount = Math.floor(game.betAmount * currentMultiplier);
      }
    }
    
    await prisma.minesGame.update({
      where: { id: gameId },
      data: {
        revealedCells: newRevealedCells,
        gameStatus,
        currentMultiplier,
        winAmount: gameStatus === 'won' ? winAmount : game.winAmount,
      },
    });

    const response: RevealResponse = {
      isMine,
      cellIndex,
      gameStatus,
      revealedCount: newRevealedCells.length,
      currentMultiplier,
    };
    
    if (gameStatus !== 'active') {
      response.minePositions = minePositions;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error revealing cell:', error);
    return NextResponse.json({ error: 'Failed to reveal cell' }, { status: 500 });
  }
}