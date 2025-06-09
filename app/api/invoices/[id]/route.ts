import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

import database, { users, invoices } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import stripe from '@/lib/stripe-server';
import { syncInvoiceFromStripe } from '@/lib/invoice-sync';



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
        logger.info('Fetching invoice', { invoiceId, userId: session.user.id });

        try {
            // First try to get the invoice from local database
            const [localInvoice] = await database
                .select()
                .from(invoices)
                .where(and(
                    eq(invoices.id, invoiceId),
                    eq(invoices.userId, session.user.id)
                ))
                .limit(1);

            if (localInvoice) {
                logger.info('Invoice found in local database', { invoiceId, userId: session.user.id });
                
                // Get user billing details
                const [user] = await database
                    .select({
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

                // Try to get fresh data from Stripe if available
                if (localInvoice.stripeInvoiceId) {
                    try {
                        const stripeInvoice = await stripe.invoices.retrieve(localInvoice.stripeInvoiceId);
                        await syncInvoiceFromStripe(stripeInvoice);
                        
                        // Re-fetch the updated invoice
                        const [updatedInvoice] = await database
                            .select()
                            .from(invoices)
                            .where(eq(invoices.id, invoiceId))
                            .limit(1);
                        
                        if (updatedInvoice) {
                            Object.assign(localInvoice, updatedInvoice);
                        }
                    } catch (syncError) {
                        logger.warn('Failed to sync invoice from Stripe, using local data', {
                            invoiceId,
                            error: syncError instanceof Error ? syncError.message : String(syncError)
                        });
                    }
                }

                // Format the response to match the expected structure
                const formattedInvoice = {
                    id: localInvoice.id,
                    userId: localInvoice.userId,
                    subscriptionId: localInvoice.subscriptionId,
                    stripeInvoiceId: localInvoice.stripeInvoiceId,
                    stripeCustomerId: localInvoice.stripeCustomerId,
                    createdAt: localInvoice.createdAt,
                    dueDate: localInvoice.dueDate,
                    paidAt: localInvoice.paidAt,
                    amount: localInvoice.amountTotal, // For backward compatibility
                    amountTotal: localInvoice.amountTotal,
                    amountPaid: localInvoice.amountPaid,
                    amountRemaining: localInvoice.amountRemaining,
                    status: localInvoice.status,
                    number: localInvoice.number,
                    currency: localInvoice.currency,
                    serviceName: localInvoice.serviceName,
                    serviceId: localInvoice.serviceId,
                    hostedInvoiceUrl: localInvoice.hostedInvoiceUrl,
                    invoicePdf: localInvoice.invoicePdf,
                    paymentIntentId: localInvoice.paymentIntentId,
                    billingAddress: {
                        name: localInvoice.billingName || user?.billingName || user?.name || 'Customer',
                        email: user?.email || '',
                        address: localInvoice.billingAddress || user?.billingAddress || '',
                        city: '',
                        country: 'RO',
                        postalCode: '',
                        company: localInvoice.billingCompany || user?.billingCompany || ''
                    },
                    // These fields would need to be stored separately or fetched from Stripe
                    items: [],
                    discounts: [],
                    subtotal: localInvoice.amountTotal,
                    tax: 0,
                    total: localInvoice.amountTotal,
                    discountTotal: 0
                };

                // If we have a Stripe invoice ID, try to get detailed items
                if (localInvoice.stripeInvoiceId) {
                    try {
                        const stripeInvoice = await stripe.invoices.retrieve(localInvoice.stripeInvoiceId);
                        
                        // Add items
                        formattedInvoice.items = stripeInvoice.lines.data.map(item => ({
                            name: item.description || 'Service',
                            description: item.metadata?.description || '',
                            quantity: item.quantity || 1,
                            unitPrice: item.amount / (item.quantity || 1),
                            total: item.amount
                        }));

                        // Add discounts
                        formattedInvoice.discounts = stripeInvoice.discounts?.filter(discount => typeof discount !== 'string').map(discount => ({
                            couponId: discount.coupon?.id,
                            couponName: discount.coupon?.name,
                            percentOff: discount.coupon?.percent_off,
                            amountOff: discount.coupon?.amount_off || null,
                            currency: discount.coupon?.currency
                        })) || [];

                        // Update totals
                        formattedInvoice.subtotal = stripeInvoice.subtotal;
                        formattedInvoice.tax = stripeInvoice.tax || 0;
                        formattedInvoice.total = stripeInvoice.total;
                        formattedInvoice.discountTotal = Math.max(0, (stripeInvoice.subtotal - stripeInvoice.total + (stripeInvoice.tax || 0)));
                    } catch (detailError) {
                        logger.warn('Failed to fetch invoice details from Stripe', {
                            invoiceId,
                            error: detailError instanceof Error ? detailError.message : String(detailError)
                        });
                    }
                }

                return NextResponse.json({ invoice: formattedInvoice });
            }

            // If not found in local database, this might be an old invoice ID
            // Try to fetch from Stripe directly
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

            // Try to retrieve from Stripe
            const stripeInvoice = await stripe.invoices.retrieve(invoiceId);

            // Verify the invoice belongs to this customer
            if (stripeInvoice.customer !== user.stripeCustomerId) {
                logger.warn('Invoice does not belong to user', {
                    invoiceId,
                    userId: session.user.id,
                    invoiceCustomer: stripeInvoice.customer,
                    userCustomer: user.stripeCustomerId
                });
                return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            }

            // Sync this invoice to our database for future use
            await syncInvoiceFromStripe(stripeInvoice);

            // Now fetch from local database
            const [syncedInvoice] = await database
                .select()
                .from(invoices)
                .where(eq(invoices.stripeInvoiceId, stripeInvoice.id))
                .limit(1);

            if (syncedInvoice) {
                // Recursively call this endpoint with the local invoice ID
                const url = new URL(request.url);
                url.pathname = url.pathname.replace(invoiceId, syncedInvoice.id);
                return GET(new NextRequest(url, request), { params: Promise.resolve({ id: syncedInvoice.id }) });
            }

            // Fallback: format Stripe invoice directly
            const items = stripeInvoice.lines.data.map(item => ({
                name: item.description || 'Service',
                description: item.metadata?.description || '',
                quantity: item.quantity || 1,
                unitPrice: item.amount / (item.quantity || 1),
                total: item.amount
            }));

            const discounts = stripeInvoice.discounts?.filter(discount => typeof discount !== 'string').map(discount => ({
                couponId: discount.coupon?.id,
                couponName: discount.coupon?.name,
                percentOff: discount.coupon?.percent_off,
                amountOff: discount.coupon?.amount_off || null,
                currency: discount.coupon?.currency
            })) || [];

            const actualDiscountAmount = Math.max(0, (stripeInvoice.subtotal - stripeInvoice.total + (stripeInvoice.tax || 0)));
            const billingDetails = stripeInvoice.customer_address as any || {};

            const formattedInvoice = {
                id: stripeInvoice.id,
                userId: session.user.id,
                stripeInvoiceId: stripeInvoice.id,
                createdAt: new Date(stripeInvoice.created * 1000).toISOString(),
                dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000).toISOString() : null,
                amount: stripeInvoice.total,
                status: stripeInvoice.status === 'paid' ? 'paid' :
                        stripeInvoice.status === 'open' ? 'open' :
                        stripeInvoice.status === 'uncollectible' ? 'uncollectible' : 'open',
                serviceName: items[0]?.name || 'Subscription',
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
                number: stripeInvoice.number,
                currency: stripeInvoice.currency,
                hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
                invoicePdf: stripeInvoice.invoice_pdf,
                subtotal: stripeInvoice.subtotal,
                tax: stripeInvoice.tax || 0,
                total: stripeInvoice.total,
                discountTotal: actualDiscountAmount
            };

            logger.info('Invoice fetched from Stripe', { invoiceId, userId: session.user.id });
            return NextResponse.json({ invoice: formattedInvoice });
        } catch (error: any) {
            if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
                logger.warn('Invoice not found', { invoiceId, userId: session.user.id });
                return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            }

            logger.error('Error fetching invoice', {
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