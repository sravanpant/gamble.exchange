import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validatePrivyAuth } from '@/lib/privyAuth';
import Decimal from 'decimal.js';
import { Prisma } from '@/generated/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const authResult = await validatePrivyAuth();
    if (!authResult.authenticated || !authResult.walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: authResult.walletAddress },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { eventId } = await params;
    const updateData = await req.json();

    // Validate the event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Prepare update data with proper type conversion
    const updateFields: Prisma.EventUpdateInput = {};

    if (updateData.currentYesPrice !== undefined) {
      updateFields.currentYesPrice = new Decimal(updateData.currentYesPrice).toNumber();
    }

    if (updateData.currentNoPrice !== undefined) {
      updateFields.currentNoPrice = new Decimal(updateData.currentNoPrice).toNumber();
    }

    if (updateData.totalYesShares !== undefined) {
      updateFields.totalYesShares = new Decimal(updateData.totalYesShares).toNumber();
    }

    if (updateData.totalNoShares !== undefined) {
      updateFields.totalNoShares = new Decimal(updateData.totalNoShares).toNumber();
    }

    if (updateData.title !== undefined) {
      updateFields.title = updateData.title;
    }

    if (updateData.description !== undefined) {
      updateFields.description = updateData.description;
    }

    if (updateData.status !== undefined) {
      updateFields.status = updateData.status;
    }

    if (updateData.eventDateTime !== undefined) {
      updateFields.eventDateTime = new Date(updateData.eventDateTime);
    }

    if (updateData.settlementDateTime !== undefined) {
      updateFields.settlementDateTime = updateData.settlementDateTime ? new Date(updateData.settlementDateTime) : null;
    }

    if (updateData.winningOutcomeName !== undefined) {
      updateFields.winningOutcomeName = updateData.winningOutcomeName;
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateFields,
      include: {
        outcomes: true,
      }
    });

    return NextResponse.json({
      message: 'Event updated successfully',
      event: {
        ...updatedEvent,
        currentYesPrice: updatedEvent.currentYesPrice.toString(),
        currentNoPrice: updatedEvent.currentNoPrice.toString(),
        totalYesShares: updatedEvent.totalYesShares.toString(),
        totalNoShares: updatedEvent.totalNoShares.toString(),
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error updating event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 