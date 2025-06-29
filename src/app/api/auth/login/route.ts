// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user with 1000 points bonus
      user = await prisma.user.create({
        data: {
          id: walletAddress.toLowerCase(),
          walletAddress: walletAddress.toLowerCase(),
          points: 1000,
          isFirstLogin: false,
          lastLoginAt: new Date(),
        },
      });
      isNewUser = true;
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { walletAddress: walletAddress.toLowerCase() },
        data: {
          lastLoginAt: new Date(),
          isFirstLogin: false,
        },
      });
    }

    return NextResponse.json({
      user,
      isNewUser,
      message: isNewUser
        ? "Welcome! You received 1000 bonus points!"
        : "Welcome back!",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
