import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { orders, invoices, subscriptions } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { logger, withLogging } from '@/lib/logger';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const POST = withLogging(async (req: NextRequest) => {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') || '';

    try {
        if (!endpointSecret) {
            logger.error('Stripe webhook secret not configured', {});
            return NextResponse.json(
                { error: 'Webhook not configured' },
                { status: 500 }
            );
        }

        const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

        logger.info('Webhook received', { eventType: event.type });

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as any;
                logger.info('Payment succeeded', { amount: paymentIntent.amount, currency: paymentIntent.currency, userId: paymentIntent.metadata?.userId });

                if (paymentIntent.metadata?.orderId) {
                    await db.update(orders)
                        .set({
                            status: 'completed',
                            stripePaymentId: paymentIntent.id
                        })
                        .where(eq(orders.id, paymentIntent.metadata.orderId));

                    logger.info('Order marked as completed', {
                        orderId: paymentIntent.metadata.orderId,
                        paymentIntentId: paymentIntent.id
                    });
                }

                if (paymentIntent.metadata?.invoiceId) {
                    await db.update(invoices)
                        .set({
                            status: 'paid'
                        })
                        .where(eq(invoices.id, paymentIntent.metadata.invoiceId));

                    logger.info('Invoice marked as paid', {
                        invoiceId: paymentIntent.metadata.invoiceId,
                        paymentIntentId: paymentIntent.id
                    });
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const failedPaymentIntent = event.data.object as any;
                logger.info('Payment failed', { amount: failedPaymentIntent.amount, currency: failedPaymentIntent.currency, userId: failedPaymentIntent.metadata?.userId });

                if (failedPaymentIntent.metadata?.orderId) {
                    await db.update(orders)
                        .set({ status: 'payment_failed' })
                        .where(eq(orders.id, failedPaymentIntent.metadata.orderId));

                    logger.warn('Order payment failed', {
                        orderId: failedPaymentIntent.metadata.orderId,
                        paymentIntentId: failedPaymentIntent.id
                    });
                }
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                logger.info(`Subscription ${event.type.split('.').pop()}`, {
                    subscriptionId: subscription.id,
                    customerId: subscription.customer,
                    status: subscription.status
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;

                await db.update(subscriptions)
                    .set({
                        status: 'cancelled',
                        cancelledAt: new Date().toISOString()
                    })
                    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

                logger.info('Subscription cancelled', {
                    subscriptionId: subscription.id,
                    customerId: subscription.customer
                });
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                logger.info('Invoice paid', { amount: invoice.amount_paid, currency: invoice.currency, userId: invoice.metadata?.userId });

                if (invoice.subscription) {
                    logger.info('Subscription invoice paid', {
                        invoiceId: invoice.id,
                        subscriptionId: invoice.subscription,
                        amountPaid: invoice.amount_paid
                    });
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                logger.error('Invoice payment failed', {
                    invoiceId: invoice.id,
                    subscriptionId: invoice.subscription,
                    attemptCount: invoice.attempt_count,
                    nextAttempt: invoice.next_payment_attempt
                });
                break;
            }

            case 'charge.succeeded': {
                const charge = event.data.object as any;
                logger.info('Charge succeeded', { amount: charge.amount, currency: charge.currency, userId: charge.metadata?.userId });
                break;
            }

            case 'charge.failed': {
                const charge = event.data.object as any;
                logger.info('Charge failed', { amount: charge.amount, currency: charge.currency, userId: charge.metadata?.userId });
                break;
            }

            default:
                logger.info('Unhandled webhook event', { eventType: event.type });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        logger.error('Webhook error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Webhook error' },
            { status: 400 }
        );
    }
});
