import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import database, { orders, services } from '@/database';
import { verifyAuth } from '@/utils/auth';

// GET /api/orders/[id] - Get a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user from the auth cookie
    const userId = await verifyAuth(cookies());
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;

    // Get the order with service details, ensuring it belongs to the current user
    const order = await database.select({
      id: orders.id,
      userId: orders.userId,
      serviceId: orders.serviceId,
      createdAt: orders.createdAt,
      price: orders.price,
      status: orders.status,
      notes: orders.notes,
      serviceName: services.name,
      serviceDescription: services.description
    })
    .from(orders)
    .where(and(
      eq(orders.id, orderId),
      eq(orders.userId, userId)
    ))
    .leftJoin(services, eq(orders.serviceId, services.id))
    .then(res => res[0] || null);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}