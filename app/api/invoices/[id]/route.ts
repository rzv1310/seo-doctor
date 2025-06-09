import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import database, { users } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import stripe from '@/lib/stripe-server';



export const GET = withLogging(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthorized access attempt to invoice', { path: request.url });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const invoiceId = (await params).id;
        logger.info('Fetching invoice from Stripe', { invoiceId, userId: session.user.id });

        try {
            // Get user's Stripe customer ID
            const [user] = await database
                .select({
                    stripeCustomerId: users.stripeCustomerId,
                    name: users.name,
                    email: users.email,
                    billingAddress: users.billingAddress,
                    billingName: users.billingName,
                    billingCompany: users.billingCompany,
                    billingPhone: users.billingPhone
                })
                .from(users)
                .where(eq(users.id, session.user.id))
                .limit(1);

            if (!user?.stripeCustomerId) {
                logger.warn('No Stripe customer ID found for user', { userId: session.user.id });
                return NextResponse.json({ error: 'No customer account found' }, { status: 404 });
            }

            // Fetch invoice from Stripe
            const invoice = await stripe.invoices.retrieve(invoiceId);

            // Verify the invoice belongs to this customer
            if (invoice.customer !== user.stripeCustomerId) {
                logger.warn('Invoice does not belong to user', {
                    invoiceId,
                    userId: session.user.id,
                    invoiceCustomer: invoice.customer,
                    userCustomer: user.stripeCustomerId
                });
                return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            }

            // Transform invoice items
            const items = invoice.lines.data.map(item => ({
                name: item.description || 'Service',
                description: item.metadata?.description || '',
                quantity: item.quantity || 1,
                unitPrice: item.amount / (item.quantity || 1), // Keep in smallest unit
                total: item.amount // Keep in smallest unit
            }));

            // Get discount/coupon information
            const discounts = invoice.discounts?.filter(discount => typeof discount !== 'string').map(discount => ({
                couponId: discount.coupon?.id,
                couponName: discount.coupon?.name,
                percentOff: discount.coupon?.percent_off,
                amountOff: discount.coupon?.amount_off || null,
                currency: discount.coupon?.currency
            })) || [];

            // Calculate actual discount amount from subtotal vs total (includes tax consideration)
            const actualDiscountAmount = Math.max(0, (invoice.subtotal - invoice.total + (invoice.tax || 0)));

            // Get billing address from Stripe customer or use database values
            const billingDetails = invoice.customer_address as any || {};

            const formattedInvoice = {
                id: invoice.id,
                userId: session.user.id,
                orderId: null,
                createdAt: new Date(invoice.created * 1000).toISOString(),
                dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
                amount: invoice.total, // Keep in smallest unit
                status: invoice.status === 'paid' ? 'paid' :
                        invoice.status === 'open' ? 'pending' :
                        invoice.status === 'uncollectible' ? 'cancelled' : 'pending',
                stripeInvoiceId: invoice.id,
                serviceName: items[0]?.name || 'Subscription',
                serviceDescription: items[0]?.description || '',
                billingAddress: {
                    name: user.billingName || user.name || 'Customer',
                    email: user.email || '',
                    address: billingDetails?.line1 || user.billingAddress || '',
                    city: billingDetails?.city || '',
                    country: billingDetails?.country || 'RO',
                    postalCode: billingDetails?.postal_code || '',
                    company: user.billingCompany || ''
                },
                items: items,
                discounts: discounts,
                // Additional Stripe fields
                number: invoice.number,
                currency: invoice.currency,
                hostedInvoiceUrl: invoice.hosted_invoice_url,
                invoicePdf: invoice.invoice_pdf,
                subtotal: invoice.subtotal,
                tax: invoice.tax || 0,
                total: invoice.total,
                discountTotal: actualDiscountAmount
            };

            logger.info('Invoice fetched successfully from Stripe', { invoiceId, userId: session.user.id });
            return NextResponse.json({ invoice: formattedInvoice });
        } catch (error: any) {
            if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
                logger.warn('Invoice not found in Stripe', { invoiceId, userId: session.user.id });
                return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            }

            logger.error('Error fetching invoice from Stripe', {
                invoiceId,
                error: error instanceof Error ? error.message : String(error)
            });
            return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
        }
    } catch (error) {
        logger.error('Error in invoice handler', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
});
