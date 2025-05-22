import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import database, { subscriptions, services } from '@/database';
import { verifyApiAuth } from '@/lib/auth';

// GET /api/subscriptions - Get all subscriptions for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current user from the request
    const session = await verifyApiAuth(request);
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all subscriptions for the user with service details
    const userSubscriptions = await database.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .leftJoin(services, eq(subscriptions.serviceId, services.id));

    return NextResponse.json({ 
      subscriptions: userSubscriptions 
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}