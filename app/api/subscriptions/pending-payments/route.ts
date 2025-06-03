import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import db from '@/database';
import { subscriptions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all pending payment subscriptions for this user
        const pendingSubscriptions = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.userId, user.id),
                eq(subscriptions.status, 'pending_payment')
            ));

        logger.info('Found pending payment subscriptions', {
            userId: user.id,
            count: pendingSubscriptions.length
        });

        return NextResponse.json({
            pendingSubscriptions
        });

    } catch (error: any) {
        logger.error('Error fetching pending payments', {
            error: error.message || 'Unknown error',
            userId: user?.id
        });
        
        return NextResponse.json(
            { error: error.message || 'Failed to fetch pending payments' },
            { status: 500 }
        );
    }
}