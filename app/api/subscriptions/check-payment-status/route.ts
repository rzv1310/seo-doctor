import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { subscriptions } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';



export async function POST(request: NextRequest) {
    let user: any = null;
    try {
        user = await getUserFromToken(request);
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
            expand: ['latest_invoice.payments.data.payment.payment_intent']
        });

        const latestInvoice = typeof stripeSubscription.latest_invoice === 'object' ? stripeSubscription.latest_invoice : null;
        const invoiceIsPaid = latestInvoice?.status === 'paid';

        logger.info('Stripe subscription status retrieved', {
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            invoiceStatus: latestInvoice?.status ?? 'string_id',
            invoicePaid: invoiceIsPaid,
            hasPayments: !!(latestInvoice?.payments?.data?.length)
        });

        let paymentStatus = 'unknown';
        let paymentIntentStatus = null;

        // Check payment intent status if available
        const invoicePayment = latestInvoice?.payments?.data?.[0]?.payment as any;
        const invoicePaymentIntent = invoicePayment?.payment_intent;
        if (invoicePaymentIntent) {
            let paymentIntent;

            if (typeof invoicePaymentIntent === 'string') {
                paymentIntent = await stripe.paymentIntents.retrieve(invoicePaymentIntent);
            } else {
                paymentIntent = invoicePaymentIntent;
            }

            paymentIntentStatus = paymentIntent.status;
            
            logger.info('Payment intent status checked', {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                charges: paymentIntent.charges?.data?.map((charge: any) => ({
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
            const itemPeriodStart = stripeSubscription.items.data[0]?.current_period_start;
            const itemPeriodEnd = stripeSubscription.items.data[0]?.current_period_end;
            const currentPeriodStart = itemPeriodStart
                ? new Date(itemPeriodStart * 1000).toISOString()
                : localSubscription.startDate;

            const currentPeriodEnd = itemPeriodEnd
                ? new Date(itemPeriodEnd * 1000).toISOString()
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
            invoicePaid: invoiceIsPaid
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