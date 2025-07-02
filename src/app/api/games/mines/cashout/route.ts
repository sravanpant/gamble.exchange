import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function POST(request: Request) {
  try {
    const { gameId, userId } = await request.json();
    
    if (!gameId || !userId) {
      return NextResponse.json(
        { error: 'Game ID and User ID are required' },
        { status: 400 }
      );
    }
    
    const game = await prisma.minesGame.findUnique({
      where: { id: gameId },
      include: { user: true }
    });
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    if (game.user.walletAddress !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    if (game.gameStatus !== 'active') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      );
    }
    
    if (!game.betAmount) {
      return NextResponse.json(
        { error: 'Invalid game data: bet amount missing' },
        { status: 400 }
      );
    }
    
    const winAmount = Math.floor(game.betAmount * game.currentMultiplier);
    
    const [, updatedUser] = await prisma.$transaction([
      prisma.minesGame.update({
        where: { id: gameId },
        data: {
          gameStatus: 'cashed_out',
          cashOutMultiplier: game.currentMultiplier,
          winAmount,
        },
      }),
      prisma.user.update({
        where: { id: game.user.id },
        data: {
          points: {
            increment: winAmount,
          },
        },
      }),
    ]);
    
    return NextResponse.json({
      success: true,
      winAmount,
      multiplier: game.currentMultiplier,
      profit: winAmount - game.betAmount,
      userPoints: updatedUser.points,
      minePositions: game.minePositions, // Send mine positions on cashout
    });
  } catch (error) {
    console.error('Error cashing out:', error);
    return NextResponse.json(
      { error: 'Failed to cash out' },
      { status: 500 }
    );
  }
}