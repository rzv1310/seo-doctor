import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import database, { invoices, orders, services, users } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (
  request: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) => {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated) {
      logger.auth('Unauthorized access attempt to invoice', { path: request.url });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoiceId = (await params).id;
    logger.info('Fetching invoice', { invoiceId, userId: session.user.id });

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
          eq(invoices.userId, session.user.id)
        ));

      if (!result || result.length === 0) {
        logger.warn('Invoice not found', { invoiceId, userId: session.user.id });
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
        .where(eq(users.id, session.user.id));

      const user = userResult && userResult.length > 0 ? userResult[0] : null;

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

      logger.info('Invoice fetched successfully', { invoiceId, userId: session.user.id });
      return NextResponse.json({ invoice: formattedInvoice });
    } catch (error) {
      logger.error('Error processing invoice data', { invoiceId, error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Failed to process invoice data' }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error fetching invoice', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
});