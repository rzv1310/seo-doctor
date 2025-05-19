import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import database, { orders, services } from '@/database';
import { verifyAuth } from '@/utils/auth';

// GET /api/orders/[id] - Get a specific order
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the current user from the request
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In Next.js App Router, we must access context.params directly
    // without destructuring due to the asynchronous nature
    const orderId = context.params.id;

    try {
      // Get the order with basic information first
      const result = await database
        .select({
          id: orders.id,
          userId: orders.userId,
          serviceId: orders.serviceId,
          createdAt: orders.createdAt,
          price: orders.price,
          status: orders.status,
          notes: orders.notes
        })
        .from(orders)
        .where(and(
          eq(orders.id, orderId),
          eq(orders.userId, userId)
        ));

      if (!result || result.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      const order = result[0];
      
      // Get service information separately
      let serviceName = "Unknown Service";
      let serviceDescription = "No description available";
      
      if (order.serviceId) {
        const serviceResult = await database
          .select({
            name: services.name,
            description: services.description
          })
          .from(services)
          .where(eq(services.id, order.serviceId));
          
        if (serviceResult && serviceResult.length > 0) {
          serviceName = serviceResult[0].name || serviceName;
          serviceDescription = serviceResult[0].description || serviceDescription;
        }
      }
      
      // Build the complete order object
      const completeOrder = {
        ...order,
        serviceName,
        serviceDescription
      };

      return NextResponse.json({ order: completeOrder });
    } catch (error) {
      console.error('Error processing order data:', error);
      return NextResponse.json({ error: 'Failed to process order data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}