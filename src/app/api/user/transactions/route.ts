import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const currency = searchParams.get('currency');

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: {
      userId: string;
      type?: TransactionType;
      currency?: string;
    } = {
      userId: walletAddress.toLowerCase(),
    };

    if (type) {
      whereClause.type = type as TransactionType;
    }

    if (currency) {
      whereClause.currency = currency;
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
        include: {
          relatedTrade: {
            include: {
              event: {
                select: {
                  title: true,
                },
              },
              outcome: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.transaction.count({
        where: whereClause,
      }),
    ]);

    // Convert Decimal amounts to strings for JSON serialization
    const transactionsForFrontend = transactions.map(transaction => ({
      ...transaction,
      amount: transaction.amount.toString(),
      timestamp: transaction.timestamp.toISOString(),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      transactions: transactionsForFrontend,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
} 