// src/app/api/games/mines/start/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma";

function generateMinePositions(count: number, gridSize: number): number[] {
  const positions = new Set<number>();

  while (positions.size < count) {
    positions.add(Math.floor(Math.random() * gridSize));
  }

  return Array.from(positions);
}

export async function POST(request: Request) {
  try {
    const {
      minesCount = 5,
      betAmount,
      autoCashOut,
      userId,
    } = await request.json();

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { walletAddress: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.points < betAmount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    if (!betAmount || betAmount < 10 || betAmount > 10000) {
      return NextResponse.json(
        { error: "Invalid bet amount" },
        { status: 400 }
      );
    }

    // Generate mine positions
    const totalCells = 25;
    const minePositions = generateMinePositions(minesCount, totalCells);

    // Start transaction
    const [game, updatedUser] = await prisma.$transaction([
      // Create game
      prisma.minesGame.create({
        data: {
          userId: user.id, // Use user.id from database
          betAmount: betAmount,
          autoCashOut,
          minesCount,
          minePositions,
          revealedCells: [],
          gameStatus: "active",
          currentMultiplier: 1.0,
        },
      }),
      // Deduct bet amount from user
      prisma.user.update({
        where: { id: user.id },
        data: {
          points: {
            decrement: betAmount,
          },
        },
      }),
      // Log transaction for bet
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.MINES_BET,
          amount: -betAmount, // Negative amount for bet
          currency: "POINTS",
          description: `Mines game bet: ${betAmount} points`,
        },
      }),
    ]);

    return NextResponse.json({
      gameId: game.id,
      gridSize: game.gridSize,
      minesCount: game.minesCount,
      betAmount: game.betAmount,
      userPoints: updatedUser.points,
    });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
