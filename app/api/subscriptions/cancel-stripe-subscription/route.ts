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
        const { subscriptionId, reason, immediate = false, reactivate = false } = body;

        logger.info('Subscription action request', { 
            subscriptionId, 
            userId: user.id, 
            immediate,
            reactivate
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

        let updatedSubscription;

        if (reactivate) {
            // Reactivate subscription by removing cancel_at_period_end
            updatedSubscription = await stripe.subscriptions.update(
                subscription.stripeSubscriptionId,
                {
                    cancel_at_period_end: false,
                    metadata: {
                        reactivatedBy: user.id.toString(),
                        reactivatedAt: new Date().toISOString(),
                    },
                }
            );
        } else {
            // Cancel subscription
            updatedSubscription = await stripe.subscriptions.update(
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
        }

        const metadata = JSON.parse(subscription.metadata || '{}');
        let updateData;

        if (reactivate) {
            updateData = {
                status: 'active',
                cancelledAt: null,
                endDate: updatedSubscription.current_period_end 
                    ? new Date(updatedSubscription.current_period_end * 1000).toISOString()
                    : subscription.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // fallback to 30 days
                metadata: JSON.stringify({
                    ...metadata,
                    cancelAtPeriodEnd: false,
                    stripeCancelAt: null,
                    reactivatedAt: new Date().toISOString(),
                }),
                updatedAt: new Date().toISOString(),
            };
        } else {
            updateData = {
                status: immediate ? 'cancelled' : subscription.status,
                cancelledAt: new Date().toISOString(),
                endDate: updatedSubscription.cancel_at 
                    ? new Date(updatedSubscription.cancel_at * 1000).toISOString()
                    : subscription.endDate,
                metadata: JSON.stringify({
                    ...metadata,
                    cancelReason: reason,
                    cancelAtPeriodEnd: !immediate,
                    stripeCancelAt: updatedSubscription.cancel_at,
                }),
                updatedAt: new Date().toISOString(),
            };
        }

        await db
            .update(subscriptions)
            .set(updateData)
            .where(eq(subscriptions.id, subscriptionId));

        if (reactivate) {
            logger.info('Subscription reactivated successfully', {
                subscriptionId,
                userId: user.id
            });

            return NextResponse.json({
                success: true,
                message: 'Subscription reactivated successfully',
                endDate: updatedSubscription.current_period_end 
                    ? new Date(updatedSubscription.current_period_end * 1000)
                    : null,
            });
        } else {
            logger.info('Subscription cancelled successfully', {
                subscriptionId,
                userId: user.id,
                immediate,
                cancelAt: updatedSubscription.cancel_at
            });

            return NextResponse.json({
                success: true,
                message: immediate 
                    ? 'Subscription cancelled immediately' 
                    : 'Subscription will be cancelled at the end of the billing period',
                cancelAt: updatedSubscription.cancel_at 
                    ? new Date(updatedSubscription.cancel_at * 1000) 
                    : null,
            });
        }
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