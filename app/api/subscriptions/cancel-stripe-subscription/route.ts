import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { subscriptions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';


export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionId, reason, immediate = false } = body;

        if (!subscriptionId) {
            return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
        }

        // Get the subscription from database
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.id, subscriptionId),
                eq(subscriptions.userId, user.id)
            ))
            .limit(1);

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        if (!subscription.stripeSubscriptionId) {
            return NextResponse.json({ 
                error: 'No Stripe subscription associated with this subscription' 
            }, { status: 400 });
        }

        // Cancel the subscription in Stripe
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

        // If immediate cancellation, delete the subscription
        if (immediate) {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        }

        // Update local subscription record
        await db
            .update(subscriptions)
            .set({
                status: immediate ? 'cancelled' : subscription.status,
                cancelledAt: new Date().toISOString(),
                metadata: JSON.stringify({
                    ...JSON.parse(subscription.metadata || '{}'),
                    cancelReason: reason,
                    cancelAtPeriodEnd: !immediate,
                }),
                updatedAt: new Date().toISOString(),
            })
            .where(eq(subscriptions.id, subscriptionId));

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
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}