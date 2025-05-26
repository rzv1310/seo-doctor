import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import database, { subscriptions, services } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

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

        logger.info('Subscriptions fetched successfully', { userId: session.user.id, count: userSubscriptions.length });
        return NextResponse.json({
            subscriptions: userSubscriptions
        });
    } catch (error) {
        logger.error('Error fetching subscriptions', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }
});
