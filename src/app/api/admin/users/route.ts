// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validatePrivyAuth } from '@/lib/privyAuth'; // Reuse the auth helper

export async function PUT(req: Request) {
  try {
    const authResult = await validatePrivyAuth();
    if (!authResult.authenticated || !authResult.walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Crucial: Verify that the requesting user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { id: authResult.walletAddress },
      select: { isAdmin: true },
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Not an administrator' }, { status: 403 });
    }

    const { targetWalletAddress, isAdmin } = await req.json();

    if (!targetWalletAddress || typeof isAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Missing targetWalletAddress or isAdmin status' }, { status: 400 });
    }

    const normalizedTargetAddress = targetWalletAddress.toLowerCase();

    // Prevent an admin from revoking their own admin status via this API
    if (normalizedTargetAddress === authResult.walletAddress) {
      return NextResponse.json({ error: 'Cannot change your own admin status via this panel.' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: normalizedTargetAddress },
      data: {
        isAdmin: isAdmin,
      },
      select: {
        id: true,
        walletAddress: true,
        isAdmin: true,
      }
    });

    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User role updated successfully', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authResult = await validatePrivyAuth();
    if (!authResult.authenticated || !authResult.walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: authResult.walletAddress },
      select: { isAdmin: true },
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Not an administrator' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        points: true,
        cryptoBalance: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert Decimal to string for all users
    const usersForFrontend = users.map(user => ({
      ...user,
      cryptoBalance: user.cryptoBalance.toString(),
    }));

    return NextResponse.json(usersForFrontend, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}