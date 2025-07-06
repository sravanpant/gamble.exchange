// src/app/api/user/sync/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this exists

export async function POST(req: Request) {
  try {
    const { walletAddress: rawWalletAddress } = await req.json();

    if (!rawWalletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const walletAddress = rawWalletAddress.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { id: walletAddress },
    });

    if (!user) {
      // First time user, create a new record
      user = await prisma.user.create({
        data: {
          id: walletAddress,
          walletAddress: walletAddress,
          points: 1000, // Initial points
          cryptoBalance: 0, // Initial crypto
          isFirstLogin: true,
          // isAdmin will default to false,
          // you'd manually set this to true for specific admin addresses in your DB
        },
      });
    } else {
      // Update last login time and set isFirstLogin to false after first login
      user = await prisma.user.update({
        where: { id: walletAddress },
        data: {
          isFirstLogin: false,
          lastLoginAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      walletAddress: user.walletAddress,
      points: user.points,
      cryptoBalance: user.cryptoBalance.toString(), // Convert Decimal to string for JSON
      isAdmin: user.isAdmin, // Include isAdmin status
    }, { status: 200 });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}