import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import database, { invoices, orders, services, users } from '@/database';
import { verifyAuth } from '@/utils/auth';

// GET /api/invoices/[id] - Get a specific invoice
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

    const invoiceId = params.id;

    // Get the invoice with related data, ensuring it belongs to the current user
    const invoice = await database.select({
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
      serviceDescription: services.description,
      // User billing details
      userName: users.name,
      userEmail: users.email,
      userAddress: users.address,
      userCity: users.city,
      userCountry: users.country,
      userPostalCode: users.postalCode,
    })
    .from(invoices)
    .where(and(
      eq(invoices.id, invoiceId),
      eq(invoices.userId, userId)
    ))
    .leftJoin(orders, eq(invoices.orderId, orders.id))
    .leftJoin(services, eq(orders.serviceId, services.id))
    .leftJoin(users, eq(invoices.userId, users.id))
    .then(res => res[0] || null);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Format the invoice for the client
    const formattedInvoice = {
      ...invoice,
      billingAddress: {
        name: invoice.userName,
        email: invoice.userEmail,
        address: invoice.userAddress || '',
        city: invoice.userCity || '',
        country: invoice.userCountry || '',
        postalCode: invoice.userPostalCode || ''
      },
      // Add invoice item (just one item for subscription services)
      items: [{
        name: invoice.serviceName,
        description: invoice.serviceDescription,
        quantity: 1,
        unitPrice: invoice.amount,
        total: invoice.amount
      }]
    };

    return NextResponse.json({ invoice: formattedInvoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}