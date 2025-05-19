import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import database, { orders, services } from '@/database';
import { verifyAuth } from '@/utils/auth';

// GET /api/orders - Get all orders for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current user from the auth cookie
    const userId = await verifyAuth(cookies());
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all orders for the user with service details
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
    .where(eq(orders.userId, userId))
    .leftJoin(services, eq(orders.serviceId, services.id));

    return NextResponse.json({ 
      orders: userOrders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}