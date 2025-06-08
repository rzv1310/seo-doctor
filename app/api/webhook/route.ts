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
                logger.info('Payment succeeded', { 
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount, 
                    currency: paymentIntent.currency, 
                    userId: paymentIntent.metadata?.userId,
                    subscriptionId: paymentIntent.metadata?.subscriptionId,
                    serviceId: paymentIntent.metadata?.serviceId,
                    confirmationMethod: paymentIntent.confirmation_method,
                    charges: paymentIntent.charges?.data?.map(charge => ({
                        id: charge.id,
                        status: charge.status,
                        threeDSecure: charge.payment_method_details?.card?.three_d_secure,
                        outcome: charge.outcome
                    }))
                });

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

                // Check if this payment is for a subscription (through invoice)
                if (paymentIntent.invoice) {
                    logger.info('Payment intent has associated invoice', {
                        paymentIntentId: paymentIntent.id,
                        invoiceId: paymentIntent.invoice
                    });
                    
                    // Retrieve the invoice to get the subscription ID
                    const invoice = await stripe.invoices.retrieve(paymentIntent.invoice as string);
                    
                    logger.info('Invoice details retrieved', {
                        invoiceId: invoice.id,
                        subscriptionId: invoice.subscription,
                        status: invoice.status,
                        paid: invoice.paid,
                        amountPaid: invoice.amount_paid,
                        total: invoice.total
                    });
                    
                    if (invoice.subscription) {
                        // Update subscription status from pending_payment to active
                        const updateResult = await db.update(subscriptions)
                            .set({
                                status: 'active',
                                updatedAt: new Date().toISOString()
                            })
                            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
                            .returning();

                        logger.info('Subscription activated after successful payment', {
                            subscriptionId: invoice.subscription,
                            paymentIntentId: paymentIntent.id,
                            updatedRecords: updateResult.length,
                            localSubscriptionId: updateResult[0]?.id
                        });
                    }
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

                // Update subscription in database
                const subscriptionData: any = {
                    status: subscription.status === 'active' ? 'active' : 
                           subscription.status === 'trialing' ? 'trial' : 
                           subscription.status === 'incomplete' || subscription.status === 'past_due' ? 'pending_payment' :
                           subscription.status === 'canceled' ? 'cancelled' : 'inactive',
                    startDate: new Date(subscription.current_period_start * 1000).toISOString(),
                    endDate: new Date(subscription.current_period_end * 1000).toISOString(),
                    renewalDate: new Date(subscription.current_period_end * 1000).toISOString(),
                    price: subscription.items.data[0]?.price.unit_amount || 0,
                    updatedAt: new Date().toISOString(),
                };

                // If trial, set trial end date
                if (subscription.status === 'trialing' && subscription.trial_end) {
                    subscriptionData.trialEndDate = new Date(subscription.trial_end * 1000).toISOString();
                }

                // Update subscription
                await db.update(subscriptions)
                    .set(subscriptionData)
                    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

                logger.info('Subscription updated in database', {
                    subscriptionId: subscription.id,
                    status: subscriptionData.status
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
                
                // Update subscription status to pending_payment if it exists
                if (invoice.subscription) {
                    await db.update(subscriptions)
                        .set({
                            status: 'pending_payment',
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
                    
                    logger.info('Subscription marked as pending_payment after invoice failure', {
                        subscriptionId: invoice.subscription
                    });
                }
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
