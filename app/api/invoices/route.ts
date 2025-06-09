import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';

import database, { users, invoices } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import stripe from '@/lib/stripe-server';
import { convertRONtoEUR } from '@/lib/currency-utils';
import { syncInvoiceFromStripe } from '@/lib/invoice-sync';



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

        logger.info('Fetching invoices from database', { userId: session.user.id, page, limit });

        // First, sync recent invoices from Stripe to ensure data is up to date
        const [user] = await database
            .select({ stripeCustomerId: users.stripeCustomerId })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (user?.stripeCustomerId) {
            try {
                // Sync recent invoices (last 10)
                const recentStripeInvoices = await stripe.invoices.list({
                    customer: user.stripeCustomerId,
                    limit: 10
                });

                for (const stripeInvoice of recentStripeInvoices.data) {
                    await syncInvoiceFromStripe(stripeInvoice);
                }

                logger.info('Synced recent invoices from Stripe', {
                    userId: session.user.id,
                    count: recentStripeInvoices.data.length
                });
            } catch (syncError) {
                logger.error('Failed to sync recent invoices', {
                    error: syncError instanceof Error ? syncError.message : String(syncError),
                    userId: session.user.id
                });
                // Continue with local data even if sync fails
            }
        }

        // Fetch invoices from local database
        const userInvoices = await database
            .select()
            .from(invoices)
            .where(eq(invoices.userId, session.user.id))
            .orderBy(invoices.createdAt)
            .limit(limit)
            .offset(offset);

        // Get total count for pagination
        const [{ count }] = await database
            .select({ count: sql<number>`count(*)` })
            .from(invoices)
            .where(eq(invoices.userId, session.user.id));

        const totalItems = count || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // Transform to match expected format
        const formattedInvoices = userInvoices.map(invoice => ({
            ...invoice,
            amount: invoice.amountTotal, // For backward compatibility
            status: invoice.status as any
        }));

        logger.info('Invoices fetched successfully from database', {
            userId: session.user.id,
            count: formattedInvoices.length,
            totalItems
        });

        return NextResponse.json({
            invoices: formattedInvoices,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages
            },
            hasMore: page < totalPages
        });
    } catch (error) {
        logger.error('Error fetching invoices', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
});
