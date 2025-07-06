// src/app/api/events/[eventId]/trade/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validatePrivyAuth } from '@/lib/privyAuth';
import Decimal from 'decimal.js'; // Ensure decimal.js is installed: npm install decimal.js
import { TransactionType } from '@/generated/prisma';

// AMM functions (copied from previous response)
interface AMMResult {
  price: Decimal;
  totalCost: Decimal;
  newYesShares: Decimal;
  newNoShares: Decimal;
}

// x * y = k constant product market maker
// Simplified version for "Yes" / "No" outcomes
const calculateAmmPrices = (
  totalYesShares: Decimal,
  totalNoShares: Decimal,
  tradeQuantity: Decimal,
  tradeType: 'BUY_YES' | 'BUY_NO' | 'SELL_YES' | 'SELL_NO'
): AMMResult => {
  const initialYes = totalYesShares;
  const initialNo = totalNoShares;

  // Initialize k as a non-zero value to prevent division by zero for new markets
  // If no shares are traded yet, set a base K (e.g., K = 100 * 100)
  const K = initialYes.eq(0) || initialNo.eq(0) ? new Decimal(10000) : initialYes.mul(initialNo); // Base K if no shares yet

  let newYes: Decimal;
  let newNo: Decimal;
  let price: Decimal;
  let totalCost: Decimal;

  if (tradeType === 'BUY_YES') {
    newYes = initialYes.plus(tradeQuantity);
    newNo = K.div(newYes);
    totalCost = initialNo.minus(newNo); // Cost is the reduction in No shares
    price = totalCost.div(tradeQuantity); // Average price per share
  } else if (tradeType === 'BUY_NO') {
    newNo = initialNo.plus(tradeQuantity);
    newYes = K.div(newNo);
    totalCost = initialYes.minus(newYes); // Cost is the reduction in Yes shares
    price = totalCost.div(tradeQuantity); // Average price per share
  } else if (tradeType === 'SELL_YES') {
    // Selling Yes shares means increasing No shares in the pool
    newYes = initialYes.minus(tradeQuantity);
    // If selling more than available, adjust tradeQuantity
    if (newYes.lt(0)) {
        tradeQuantity = initialYes; // Can't sell more than you have
        newYes = new Decimal(0);
    }
    newNo = K.div(newYes.isZero() ? new Decimal(0.0000000001) : newYes); // Avoid division by zero
    totalCost = newNo.minus(initialNo); // Revenue is the increase in No shares
    price = totalCost.div(tradeQuantity); // Average price per share
  } else if (tradeType === 'SELL_NO') {
    // Selling No shares means increasing Yes shares in the pool
    newNo = initialNo.minus(tradeQuantity);
    if (newNo.lt(0)) {
        tradeQuantity = initialNo;
        newNo = new Decimal(0);
    }
    newYes = K.div(newNo.isZero() ? new Decimal(0.0000000001) : newNo); // Avoid division by zero
    totalCost = newYes.minus(initialYes); // Revenue is the increase in Yes shares
    price = totalCost.div(tradeQuantity); // Average price per share
  } else {
    throw new Error('Invalid trade type');
  }

  // Prices should be between 0 and 1
  const yesPrice = new Decimal(1).minus(price); // Price of Yes is 1 - price of No (which is what was calculated)
  const noPrice = price; // Price of No is what was calculated

  // Clamp prices between 0.01 and 0.99 to avoid extreme values
  const clampedYesPrice = Decimal.max(new Decimal('0.01'), Decimal.min(new Decimal('0.99'), yesPrice));
  const clampedNoPrice = Decimal.max(new Decimal('0.01'), Decimal.min(new Decimal('0.99'), noPrice));

  return {
    price: price, // This 'price' is the amount of the *other* asset exchanged per share
    totalCost: totalCost, // This is the total crypto exchanged
    newYesShares: clampedYesPrice.mul(K.sqrt()), // Recalculate based on clamped price
    newNoShares: clampedNoPrice.mul(K.sqrt()) // Recalculate based on clamped price
  };
};


export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const authResult = await validatePrivyAuth();
    if (!authResult.authenticated || !authResult.walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const { outcomeId, tradeType, quantity } = await req.json(); // quantity in full units, e.g., 1.5 shares

    if (!outcomeId || !tradeType || quantity === undefined || quantity <= 0) {
      return NextResponse.json({ error: 'Missing or invalid trade parameters' }, { status: 400 });
    }

    const userId = authResult.walletAddress;
    const shareQuantity = new Decimal(quantity); // Convert to Decimal

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          outcomes: true,
        },
      });

      if (!event || event.status !== 'OPEN') {
        throw new Error('Event not found or trading is closed.');
      }

      const selectedOutcome = event.outcomes.find(o => o.id === outcomeId);
      if (!selectedOutcome) {
        throw new Error('Outcome not found for this event.');
      }

      let totalCryptoCost = new Decimal(0);
      const currentYesShares = new Decimal(event.totalYesShares);
      const currentNoShares = new Decimal(event.totalNoShares);
      let pricePerShare = new Decimal(0); // Price at which this specific trade happens

      if (tradeType === 'BUY') {
        // Determine if buying 'Yes' or 'No'
        const isBuyingYes = selectedOutcome.name === 'Yes';
        const ammResult = calculateAmmPrices(
          currentYesShares,
          currentNoShares,
          shareQuantity,
          isBuyingYes ? 'BUY_YES' : 'BUY_NO'
        );

        totalCryptoCost = ammResult.totalCost;
        pricePerShare = totalCryptoCost.div(shareQuantity);

        if (user.cryptoBalance.lt(totalCryptoCost)) {
          throw new Error(`Insufficient crypto balance. Required: ${totalCryptoCost.toFixed(6)} USDC, Available: ${user.cryptoBalance.toFixed(6)} USDC`);
        }

        // Update total shares in the event's pool
        if (isBuyingYes) {
          event.totalYesShares = currentYesShares.plus(shareQuantity);
          event.totalNoShares = ammResult.newNoShares; // No shares decrease
          event.currentYesPrice = ammResult.price.toNumber(); // AMM price is what you get for the OTHER share, so for Yes it's the `price`
          event.currentNoPrice = new Decimal(1).minus(ammResult.price).toNumber();
        } else {
          event.totalNoShares = currentNoShares.plus(shareQuantity);
          event.totalYesShares = ammResult.newYesShares; // Yes shares decrease
          event.currentNoPrice = ammResult.price.toNumber(); // AMM price is what you get for the OTHER share, so for No it's the `price`
          event.currentYesPrice = new Decimal(1).minus(ammResult.price).toNumber();
        }

        // Deduct crypto from user
        await tx.user.update({
          where: { id: userId },
          data: {
            cryptoBalance: user.cryptoBalance.minus(totalCryptoCost),
          },
        });

      } else if (tradeType === 'SELL') {
        const userHolding = await tx.holding.findUnique({
          where: {
            userId_eventId_outcomeId: {
              userId: userId,
              eventId: eventId,
              outcomeId: outcomeId,
            },
          },
        });

        if (!userHolding || userHolding.sharesHeld.lt(shareQuantity)) {
          throw new Error('Insufficient shares to sell.');
        }

        // Determine if selling 'Yes' or 'No'
        const isSellingYes = selectedOutcome.name === 'Yes';
        const ammResult = calculateAmmPrices(
          currentYesShares,
          currentNoShares,
          shareQuantity,
          isSellingYes ? 'SELL_YES' : 'SELL_NO'
        );

        totalCryptoCost = ammResult.totalCost; // This is actually the crypto *received*
        pricePerShare = totalCryptoCost.div(shareQuantity);

        // Update total shares in the event's pool
        if (isSellingYes) {
          event.totalYesShares = currentYesShares.minus(shareQuantity);
          event.totalNoShares = ammResult.newNoShares; // No shares increase
          event.currentYesPrice = ammResult.price.toNumber();
          event.currentNoPrice = new Decimal(1).minus(ammResult.price).toNumber();
        } else {
          event.totalNoShares = currentNoShares.minus(shareQuantity);
          event.totalYesShares = ammResult.newYesShares; // Yes shares increase
          event.currentNoPrice = ammResult.price.toNumber();
          event.currentYesPrice = new Decimal(1).minus(ammResult.price).toNumber();
        }

        // Add crypto to user
        await tx.user.update({
          where: { id: userId },
          data: {
            cryptoBalance: user.cryptoBalance.plus(totalCryptoCost),
          },
        });

      } else {
        throw new Error('Invalid tradeType. Must be BUY or SELL.');
      }

      // Update event's pool shares and prices
      await tx.event.update({
        where: { id: event.id },
        data: {
          totalYesShares: event.totalYesShares,
          totalNoShares: event.totalNoShares,
          currentYesPrice: event.currentYesPrice,
          currentNoPrice: event.currentNoPrice,
        },
      });

      // Update user's holding for the specific outcome
      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_eventId_outcomeId: {
            userId: userId,
            eventId: eventId,
            outcomeId: outcomeId,
          },
        },
      });

      if (existingHolding) {
        let newSharesHeld = existingHolding.sharesHeld;
        if (tradeType === 'BUY') {
          newSharesHeld = existingHolding.sharesHeld.plus(shareQuantity);
        } else { // SELL
          newSharesHeld = existingHolding.sharesHeld.minus(shareQuantity);
        }

        await tx.holding.update({
          where: {
            userId_eventId_outcomeId: {
              userId: userId,
              eventId: eventId,
              outcomeId: outcomeId,
            },
          },
          data: {
            sharesHeld: newSharesHeld,
            // You might need to re-calculate averageCost on buys,
            // or if selling, ensure shares don't go negative.
          },
        });
      } else if (tradeType === 'BUY') {
        await tx.holding.create({
          data: {
            userId: userId,
            eventId: eventId,
            outcomeId: outcomeId,
            sharesHeld: shareQuantity,
            averageCost: pricePerShare.toNumber(), // Initial average cost
          },
        });
      } else {
        throw new Error('Cannot sell shares you do not hold.');
      }

      // Create a Trade record
      const trade = await tx.trade.create({
        data: {
          userId: userId,
          eventId: event.id,
          outcomeId: outcomeId,
          tradeType: tradeType,
          shareQuantity: shareQuantity,
          pricePerShare: pricePerShare.toNumber(),
          totalCryptoAmount: totalCryptoCost,
          status: 'COMPLETED',
        },
      });

      // Create a Transaction record
      await tx.transaction.create({
        data: {
          userId: userId,
          type: tradeType === 'BUY' ? TransactionType.TRADE_BUY : TransactionType.TRADE_SELL,
          amount: tradeType === 'BUY' ? totalCryptoCost.neg() : totalCryptoCost, // Negative for buy (deduction), positive for sell (addition)
          currency: 'USDC',
          description: `${tradeType} ${shareQuantity.toFixed(2)} ${selectedOutcome.name} shares for Event: ${event.title}`,
          relatedTradeId: trade.id,
        },
      });

      // After a successful trade, you'd typically want to emit a Socket.IO event
      // to inform all connected clients about the price change, and the user
      // about their updated holdings and balance.
      // E.g., io.emit('eventUpdated', { eventId: event.id, newPrices: { yes: event.currentYesPrice, no: event.currentNoPrice } });
      // E.g., io.to(userId).emit('userBalanceUpdate', { points: user.points, crypto: newBalance });

      return NextResponse.json({
        message: 'Trade successful!',
        trade,
        updatedUserBalance: user.cryptoBalance.minus(tradeType === 'BUY' ? totalCryptoCost : totalCryptoCost.neg()),
        updatedEvent: {
            id: event.id,
            currentYesPrice: event.currentYesPrice,
            currentNoPrice: event.currentNoPrice,
            totalYesShares: event.totalYesShares,
            totalNoShares: event.totalNoShares,
        }
      }, { status: 200 });
    });
  } catch (error: unknown) {
    console.error('Error executing trade:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to execute trade';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}