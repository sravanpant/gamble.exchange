// src/app/api/games/mines/history/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const games = await prisma.minesGame.findMany({
      where: {
        userId,
        gameStatus: {
          not: 'active',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        betAmount: true,
        minesCount: true,
        gameStatus: true,
        cashOutMultiplier: true,
        winAmount: true,
        createdAt: true,
        revealedCells: true,
      },
    });
    
    const totalGames = await prisma.minesGame.count({
      where: {
        userId,
        gameStatus: {
          not: 'active',
        },
      },
    });
    
    // Calculate statistics
    const stats = await prisma.minesGame.aggregate({
      where: {
        userId,
        gameStatus: {
          not: 'active',
        },
      },
      _sum: {
        betAmount: true,
        winAmount: true,
      },
      _count: {
        _all: true,
      },
    });
    
    const wins = await prisma.minesGame.count({
      where: {
        userId,
        gameStatus: {
          in: ['won', 'cashed_out'],
        },
      },
    });
    
    return NextResponse.json({
      games: games.map(game => ({
        ...game,
        profit: (game.winAmount || 0) - (game.betAmount || 0),
        revealedCount: (game.revealedCells as number[]).length,
      })),
      pagination: {
        total: totalGames,
        limit,
        offset,
      },
      stats: {
        totalGames: stats._count._all,
        totalBet: stats._sum.betAmount || 0,
        totalWon: stats._sum.winAmount || 0,
        netProfit: (stats._sum.winAmount || 0) - (stats._sum.betAmount || 0),
        winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game history' },
      { status: 500 }
    );
  }
}