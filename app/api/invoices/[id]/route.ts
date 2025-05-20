import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import database, { invoices, orders, services, users } from '@/database';
import { verifyAuth } from '@/utils/auth';

// GET /api/invoices/[id] - Get a specific invoice
export async function GET(
  request: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) {
  try {
    // Get the current user from the request
    const userId = await verifyAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the invoice ID from the route parameters
    const invoiceId = (await params).id;

    try {
      // Get the invoice with basic information first
      const result = await database
        .select({
          id: invoices.id,
          userId: invoices.userId,
          orderId: invoices.orderId,
          createdAt: invoices.createdAt,
          dueDate: invoices.dueDate,
          amount: invoices.amount,
          status: invoices.status,
          stripeInvoiceId: invoices.stripeInvoiceId
        })
        .from(invoices)
        .where(and(
          eq(invoices.id, invoiceId),
          eq(invoices.userId, userId)
        ));

      if (!result || result.length === 0) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const invoice = result[0];

      // Get related order and service information
      let serviceName = "Unknown Service";
      let serviceDescription = "No description available";

      if (invoice.orderId) {
        const orderResult = await database
          .select({
            serviceId: orders.serviceId
          })
          .from(orders)
          .where(eq(orders.id, invoice.orderId));

        if (orderResult && orderResult.length > 0) {
          const serviceId = orderResult[0].serviceId;

          if (serviceId) {
            const serviceResult = await database
              .select({
                name: services.name,
                description: services.description
              })
              .from(services)
              .where(eq(services.id, serviceId));

            if (serviceResult && serviceResult.length > 0) {
              serviceName = serviceResult[0].name || serviceName;
              serviceDescription = serviceResult[0].description || serviceDescription;
            }
          }
        }
      }

      // Get user info
      const userResult = await database
        .select({
          name: users.name,
          email: users.email,
          billingAddress: users.billingAddress,
          billingName: users.billingName,
          billingCompany: users.billingCompany
        })
        .from(users)
        .where(eq(users.id, userId));

      const user = userResult && userResult.length > 0 ? userResult[0] : null;

      // Format the invoice for the client
      const formattedInvoice = {
        ...invoice,
        serviceName,
        serviceDescription,
        billingAddress: {
          name: user?.billingName || user?.name || 'User',
          email: user?.email || '',
          address: user?.billingAddress || '',
          company: user?.billingCompany || ''
        },
        // Add invoice item (just one item for subscription services)
        items: [{
          name: serviceName,
          description: serviceDescription,
          quantity: 1,
          unitPrice: invoice.amount,
          total: invoice.amount
        }]
      };

      return NextResponse.json({ invoice: formattedInvoice });
    } catch (error) {
      console.error('Error processing invoice data:', error);
      return NextResponse.json({ error: 'Failed to process invoice data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}