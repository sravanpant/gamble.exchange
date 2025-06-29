// app/api/user/points/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ points: user.points });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { walletAddress, points, operation } = await request.json();

    if (!walletAddress || points === undefined) {
      return NextResponse.json(
        { error: "Wallet address and points are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let newPoints = user.points;

    switch (operation) {
      case "add":
        newPoints += points;
        break;
      case "subtract":
        newPoints = Math.max(0, user.points - points);
        break;
      case "set":
        newPoints = points;
        break;
      default:
        newPoints = points;
    }

    const updatedUser = await prisma.user.update({
      where: { walletAddress: walletAddress.toLowerCase() },
      data: { points: newPoints },
    });

    return NextResponse.json({
      points: updatedUser.points,
      message: "Points updated successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update points" },
      { status: 500 }
    );
  }
}
