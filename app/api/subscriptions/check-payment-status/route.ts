import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { subscriptions } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';



export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionId } = body;

        if (!subscriptionId) {
            return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
        }

        logger.info('Checking payment status for subscription', {
            subscriptionId,
            userId: user.id
        });

        // Get the subscription from our database
        const [localSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
            .limit(1);

        if (!localSubscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Retrieve the latest subscription status from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice.payment_intent']
        });

        logger.info('Stripe subscription status retrieved', {
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            invoiceStatus: stripeSubscription.latest_invoice?.status,
            invoicePaid: stripeSubscription.latest_invoice?.paid,
            hasPaymentIntent: !!(stripeSubscription.latest_invoice as any)?.payment_intent
        });

        let paymentStatus = 'unknown';
        let paymentIntentStatus = null;

        // Check payment intent status if available
        if ((stripeSubscription.latest_invoice as any)?.payment_intent) {
            const invoice = stripeSubscription.latest_invoice as any;
            let paymentIntent;

            if (typeof invoice.payment_intent === 'string') {
                paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
            } else {
                paymentIntent = invoice.payment_intent;
            }

            paymentIntentStatus = paymentIntent.status;
            
            logger.info('Payment intent status checked', {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                charges: paymentIntent.charges?.data?.map(charge => ({
                    id: charge.id,
                    status: charge.status,
                    paid: charge.paid,
                    threeDSecure: charge.payment_method_details?.card?.three_d_secure
                }))
            });

            if (paymentIntent.status === 'succeeded') {
                paymentStatus = 'succeeded';
            } else if (paymentIntent.status === 'requires_action') {
                paymentStatus = 'requires_action';
            } else {
                paymentStatus = paymentIntent.status;
            }
        }

        // Determine if we need to update the local subscription
        let shouldUpdate = false;
        let newStatus = localSubscription.status;

        if (stripeSubscription.status === 'active' && localSubscription.status !== 'active') {
            shouldUpdate = true;
            newStatus = 'active';
        } else if (stripeSubscription.status === 'incomplete' && paymentIntentStatus === 'succeeded') {
            // Special case: subscription might still be incomplete but payment succeeded
            shouldUpdate = true;
            newStatus = 'active';
        }

        if (shouldUpdate) {
            const currentPeriodStart = stripeSubscription.current_period_start 
                ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
                : localSubscription.startDate;
            
            const currentPeriodEnd = stripeSubscription.current_period_end
                ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
                : localSubscription.endDate;

            await db.update(subscriptions)
                .set({
                    status: newStatus,
                    startDate: currentPeriodStart,
                    endDate: currentPeriodEnd,
                    renewalDate: currentPeriodEnd,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(subscriptions.id, localSubscription.id));

            logger.info('Local subscription updated', {
                subscriptionId: localSubscription.id,
                stripeSubscriptionId: subscriptionId,
                oldStatus: localSubscription.status,
                newStatus: newStatus,
                paymentStatus
            });
        }

        return NextResponse.json({
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            localStatus: shouldUpdate ? newStatus : localSubscription.status,
            paymentStatus,
            paymentIntentStatus,
            updated: shouldUpdate,
            invoicePaid: stripeSubscription.latest_invoice?.paid || false
        });

    } catch (error: any) {
        logger.error('Error checking payment status', {
            error: error.message,
            userId: user?.id
        });
        
        return NextResponse.json(
            { error: error.message || 'Failed to check payment status' },
            { status: 500 }
        );
    }
}