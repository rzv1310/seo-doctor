import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import database, { subscriptions, services } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import { fetchSubscriptionDiscounts } from '@/lib/discount-utils';

export const GET = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthorized access attempt to subscriptions', { path: '/api/subscriptions' });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logger.info('Fetching subscriptions', { userId: session.user.id, userEmail: session.user.email });

        const userSubscriptions = await database.select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, session.user.id))
            .leftJoin(services, eq(subscriptions.serviceId, services.id));

        // Format the response to have a cleaner structure and fetch Stripe discount info
        const formattedSubscriptions = await Promise.all(userSubscriptions.map(async row => {
            let discountInfo = null;

            // Fetch discount information from Stripe if subscription has Stripe ID
            if (row.subscriptions.stripeSubscriptionId) {
                try {
                    discountInfo = await fetchSubscriptionDiscounts(row.subscriptions.stripeSubscriptionId);
                } catch (error) {
                    logger.warn('Failed to fetch Stripe discount info', {
                        subscriptionId: row.subscriptions.id,
                        stripeSubscriptionId: row.subscriptions.stripeSubscriptionId,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            return {
                ...row.subscriptions,
                service: row.services,
                discountInfo
            };
        }));

        logger.info('Subscriptions fetched successfully', { userId: session.user.id, count: formattedSubscriptions.length });
        return NextResponse.json({
            subscriptions: formattedSubscriptions
        });
    } catch (error) {
        logger.error('Error fetching subscriptions', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }
});
