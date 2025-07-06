// src/app/api/events/[eventId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers"; // Import headers for GET requests


export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    const headersList = await headers();
    const userId = headersList.get("x-wallet-address"); // Get walletAddress from headers

    // Optional: Add a check for authenticated user if holdings are sensitive
    // const authResult = await validatePrivyAuth(req); // You would need req.json() to get body, or pass headers directly
    // If you need full auth validation here, you might rethink. For just holdings, header is fine.

    if (!userId) {
      // If userId is missing, you might return event without user specific holdings,
      // or return an error if holdings are mandatory for this endpoint.
      // For now, let's allow fetching event without holdings if no userId provided.
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          outcomes: true,
        },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json(event, { status: 200 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        outcomes: true,
        // Now, safely use userId from headers
        holdings: {
          where: { userId: userId.toLowerCase() }, // Ensure case consistency
          select: {
            outcomeId: true,
            sharesHeld: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // You might need to convert Decimal to string for holdings sharesHeld as well
    const eventForFrontend = {
      ...event,
      holdings: event.holdings.map((h) => ({
        ...h,
        sharesHeld: h.sharesHeld.toString(),
      })),
      currentYesPrice: event.currentYesPrice.toString(), // Convert prices too if not already numbers
      currentNoPrice: event.currentNoPrice.toString(),
      totalYesShares: event.totalYesShares.toString(),
      totalNoShares: event.totalNoShares.toString(),
    };

    return NextResponse.json(eventForFrontend, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(errorMessage);

    // Be careful not to expose too much error detail in production
    return NextResponse.json(
      { error: errorMessage || "Failed to fetch event" },
      { status: 500 }
    );
  }
}
