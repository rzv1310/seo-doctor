import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import database, { subscriptions, services } from '@/database';
import { verifyAuth } from '@/utils/auth';

// GET /api/subscriptions - Get all subscriptions for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current user from the auth cookie
    const userId = await verifyAuth(cookies());
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all subscriptions for the user with service details
    const userSubscriptions = await database.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .leftJoin(services, eq(subscriptions.serviceId, services.id));

    return NextResponse.json({ 
      subscriptions: userSubscriptions 
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}