import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import database, { invoices, orders, services } from '@/database';
import { verifyAuth } from '@/utils/auth';

// GET /api/invoices - Get invoices for the current user with pagination
export async function GET(request: NextRequest) {
  try {
    // Get the current user from the auth cookie
    const userId = await verifyAuth(cookies());
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse pagination params
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.userId, userId));
    
    const totalItems = countResult[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    // Get invoices with joins for service details
    const userInvoices = await database.select({
      id: invoices.id,
      userId: invoices.userId,
      orderId: invoices.orderId,
      createdAt: invoices.createdAt,
      dueDate: invoices.dueDate,
      amount: invoices.amount,
      status: invoices.status,
      stripeInvoiceId: invoices.stripeInvoiceId,
      orderServiceId: orders.serviceId,
      serviceName: services.name,
    })
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .leftJoin(orders, eq(invoices.orderId, orders.id))
    .leftJoin(services, eq(orders.serviceId, services.id))
    .orderBy(desc(invoices.createdAt))
    .limit(limit)
    .offset(offset);

    return NextResponse.json({ 
      invoices: userInvoices,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}