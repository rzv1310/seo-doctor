import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import database, { invoices, orders, services } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (request: NextRequest) => {
  try {
    const session = await verifyApiAuth(request);
    
    if (!session.isAuthenticated) {
      logger.auth('Unauthorized access attempt to invoices', { path: '/api/invoices' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    logger.info('Fetching invoices', { userId: session.user.id, page, limit });

    const countResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.userId, session.user.id));
    
    const totalItems = countResult[0].count;
    const totalPages = Math.ceil(totalItems / limit);

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
    .where(eq(invoices.userId, session.user.id))
    .leftJoin(orders, eq(invoices.orderId, orders.id))
    .leftJoin(services, eq(orders.serviceId, services.id))
    .orderBy(desc(invoices.createdAt))
    .limit(limit)
    .offset(offset);

    logger.info('Invoices fetched successfully', { 
      userId: session.user.id, 
      count: userInvoices.length,
      totalItems 
    });
    
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
    logger.error('Error fetching invoices', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
});