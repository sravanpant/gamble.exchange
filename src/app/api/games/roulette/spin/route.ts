import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma";

const SPIN_COST = 100;

export async function POST(request: Request) {
  try {
    const { walletAddress, prizeValue } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.points < SPIN_COST) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    // Process the spin transaction
    const [updatedUser] = await prisma.$transaction([
      // Deduct spin cost
      prisma.user.update({
        where: { id: user.id },
        data: {
          points: {
            decrement: SPIN_COST,
          },
        },
      }),
      // Log spin cost transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.POINTS_WITHDRAWAL,
          amount: -SPIN_COST,
          currency: "POINTS",
          description: `Roulette spin cost: ${SPIN_COST} points`,
        },
      }),
    ]);

    // If there's a prize, add it and log the transaction
    if (prizeValue > 0) {
      const [finalUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            points: {
              increment: prizeValue,
            },
          },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: TransactionType.REWARD,
            amount: prizeValue,
            currency: "POINTS",
            description: `Roulette win: ${prizeValue} points`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        spinCost: SPIN_COST,
        prizeValue,
        netChange: prizeValue - SPIN_COST,
        userPoints: finalUser.points,
      });
    }

    return NextResponse.json({
      success: true,
      spinCost: SPIN_COST,
      prizeValue: 0,
      netChange: -SPIN_COST,
      userPoints: updatedUser.points,
    });

  } catch (error) {
    console.error("Error processing roulette spin:", error);
    return NextResponse.json({ error: "Failed to process spin" }, { status: 500 });
  }
} 