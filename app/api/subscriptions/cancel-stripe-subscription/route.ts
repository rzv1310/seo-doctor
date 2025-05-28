import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import { logger } from '@/lib/logger';
import db from '@/database';
import { subscriptions } from '@/database/schema';



export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionId, reason, immediate = false } = body;

        logger.info('Cancel subscription request', { 
            subscriptionId, 
            userId: user.id, 
            immediate 
        });

        if (!subscriptionId) {
            return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
        }

        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.id, subscriptionId),
                eq(subscriptions.userId, user.id)
            ))
            .limit(1);

        if (!subscription) {
            logger.error('Subscription not found in database', { 
                subscriptionId, 
                userId: user.id 
            });
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        if (!subscription.stripeSubscriptionId) {
            return NextResponse.json({ 
                error: 'No Stripe subscription associated with this subscription' 
            }, { status: 400 });
        }

        const canceledSubscription = await stripe.subscriptions.update(
            subscription.stripeSubscriptionId,
            {
                cancel_at_period_end: !immediate,
                cancellation_details: {
                    comment: reason || 'User requested cancellation',
                },
                metadata: {
                    cancelReason: reason || 'User requested',
                    cancelledBy: user.id.toString(),
                    cancelledAt: new Date().toISOString(),
                },
            }
        );

        if (immediate) {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        }

        const metadata = JSON.parse(subscription.metadata || '{}');
        const updateData = {
            status: immediate ? 'cancelled' : subscription.status,
            cancelledAt: new Date().toISOString(),
            endDate: canceledSubscription.cancel_at 
                ? new Date(canceledSubscription.cancel_at * 1000).toISOString()
                : subscription.endDate,
            metadata: JSON.stringify({
                ...metadata,
                cancelReason: reason,
                cancelAtPeriodEnd: !immediate,
                stripeCancelAt: canceledSubscription.cancel_at,
            }),
            updatedAt: new Date().toISOString(),
        };

        await db
            .update(subscriptions)
            .set(updateData)
            .where(eq(subscriptions.id, subscriptionId));

        logger.info('Subscription cancelled successfully', {
            subscriptionId,
            userId: user.id,
            immediate,
            cancelAt: canceledSubscription.cancel_at
        });

        return NextResponse.json({
            success: true,
            message: immediate 
                ? 'Subscription cancelled immediately' 
                : 'Subscription will be cancelled at the end of the billing period',
            cancelAt: canceledSubscription.cancel_at 
                ? new Date(canceledSubscription.cancel_at * 1000) 
                : null,
        });
    } catch (error: any) {
        logger.error('Cancel subscription error', { 
            error: error.message || 'Failed to cancel subscription',
            stack: error.stack 
        });
        return NextResponse.json(
            { error: error.message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}