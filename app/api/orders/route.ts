import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import database, { orders, services } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (request: NextRequest) => {
  try {
    const session = await verifyApiAuth(request);
    
    if (!session.isAuthenticated) {
      logger.auth('Unauthorized access attempt to orders', { path: '/api/orders' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Fetching orders', { userId: session.user.id, userEmail: session.user.email });
    
    const userOrders = await database.select({
      id: orders.id,
      userId: orders.userId,
      serviceId: orders.serviceId,
      createdAt: orders.createdAt,
      price: orders.price,
      status: orders.status,
      notes: orders.notes,
      serviceName: services.name,
    })
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .leftJoin(services, eq(orders.serviceId, services.id));

    logger.info('Orders fetched successfully', { userId: session.user.id, count: userOrders.length });
    return NextResponse.json({ 
      orders: userOrders 
    });
  } catch (error) {
    logger.error('Error fetching orders', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
});