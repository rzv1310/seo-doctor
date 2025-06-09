import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import database, { users } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import stripe from '@/lib/stripe-server';
import { convertRONtoEUR } from '@/lib/currency-utils';



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

        logger.info('Fetching invoices from Stripe', { userId: session.user.id, page, limit });

        // Get user's Stripe customer ID
        const [user] = await database
            .select({ stripeCustomerId: users.stripeCustomerId })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user?.stripeCustomerId) {
            logger.info('No Stripe customer ID found for user', { userId: session.user.id });
            return NextResponse.json({
                invoices: [],
                pagination: {
                    page,
                    limit,
                    totalItems: 0,
                    totalPages: 0
                }
            });
        }

        // Fetch invoices from Stripe
        const stripeInvoices = await stripe.invoices.list({
            customer: user.stripeCustomerId,
            limit: limit
        });

        // Transform Stripe invoices to match our interface
        const invoices = stripeInvoices.data.map(invoice => {
            // Get the first line item's description as service name
            const serviceName = invoice.lines.data[0]?.description || 'Unknown Service';
            
            return {
                id: invoice.id,
                userId: session.user.id,
                orderId: null, // Stripe invoices don't have orderId
                createdAt: new Date(invoice.created * 1000).toISOString(),
                dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
                amount: invoice.total, // Keep in original currency smallest unit (RON bani)
                status: invoice.status === 'paid' ? 'paid' : 
                        invoice.status === 'open' ? 'pending' : 
                        invoice.status === 'uncollectible' ? 'cancelled' : 
                        invoice.status === 'void' ? 'void' : 'pending',
                stripeInvoiceId: invoice.id,
                orderServiceId: null,
                serviceName: serviceName,
                // Additional Stripe data
                number: invoice.number,
                currency: invoice.currency,
                hostedInvoiceUrl: invoice.hosted_invoice_url,
                invoicePdf: invoice.invoice_pdf,
                subscriptionId: typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
            };
        });

        logger.info('Invoices fetched successfully from Stripe', {
            userId: session.user.id,
            count: invoices.length,
            hasMore: stripeInvoices.has_more
        });

        return NextResponse.json({
            invoices: invoices,
            pagination: {
                page,
                limit,
                totalItems: invoices.length, // Stripe doesn't provide total count
                totalPages: stripeInvoices.has_more ? page + 1 : page
            },
            hasMore: stripeInvoices.has_more
        });
    } catch (error) {
        logger.error('Error fetching invoices from Stripe', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
});
