// src/app/api/events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure you have this utility
import { validatePrivyAuth } from "@/lib/privyAuth"; // We'll create this helper
import Decimal from "decimal.js";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: {
          in: ["OPEN", "TRADING_CLOSED"], // Only show events that can be traded or are pending settlement
        },
      },
      orderBy: {
        eventDateTime: "asc", // Order by soonest event
      },
      include: {
        outcomes: true, // Include outcomes for display
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await validatePrivyAuth();
    if (!authResult.authenticated || !authResult.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      description,
      outcomeType,
      eventDateTime,
      settlementDateTime,
    } = await req.json();

    if (!title || !eventDateTime || !settlementDateTime) {
      return NextResponse.json(
        { error: "Missing required event fields" },
        { status: 400 }
      );
    }

    const creatorId = authResult.walletAddress;

    // Create event and its default "Yes" and "No" outcomes
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        outcomeType,
        eventDateTime: new Date(eventDateTime),
        settlementDateTime: new Date(settlementDateTime),
        creatorId,
        outcomes: {
          create: [
            { name: "Yes", description: "The event will happen." },
            { name: "No", description: "The event will not happen." },
          ],
        },
        // Initial prices for AMM will be 0.5 for both
        currentYesPrice: 0.5,
        currentNoPrice: 0.5,
        totalYesShares: new Decimal(0),
        totalNoShares: new Decimal(0),
      },
      include: {
        outcomes: true,
      },
    });

    // Optionally emit a WebSocket event for new event creation
    // For this, you'd need your Socket.IO server instance accessible.
    // E.g., `io.emit('newEvent', newEvent);` (See Socket.IO setup later)

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
