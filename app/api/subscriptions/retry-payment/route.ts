import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { users, subscriptions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { updateStripeCustomerBilling } from '@/lib/billing-utils';
import { logger } from '@/lib/logger';
import { BillingDetails } from '@/types/billing';



export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            logger.warn('Unauthorized retry payment attempt', {});
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionId, paymentMethodId } = body;
        
        logger.info('Payment retry started', {
            userId: user.id,
            userEmail: user.email,
            subscriptionId,
            paymentMethodId
        });

        // Validate input
        if (!subscriptionId || !paymentMethodId) {
            return NextResponse.json({ 
                error: 'Subscription ID and payment method ID are required' 
            }, { status: 400 });
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
            return NextResponse.json({ 
                error: 'Subscription not found' 
            }, { status: 404 });
        }

        // Only allow retrying pending payment subscriptions
        if (subscription.status !== 'pending_payment') {
            return NextResponse.json({ 
                error: 'This action is only allowed for pending payment subscriptions' 
            }, { status: 400 });
        }

        if (!subscription.stripeSubscriptionId) {
            return NextResponse.json({ 
                error: 'No Stripe subscription ID found' 
            }, { status: 400 });
        }

        // Get user's Stripe customer ID
        const [userRecord] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord || !userRecord.stripeCustomerId) {
            logger.error('User has no Stripe customer ID', { userId: user.id });
            return NextResponse.json({ 
                error: 'No payment method found. Please add a payment method first.' 
            }, { status: 400 });
        }

        const stripeCustomerId = userRecord.stripeCustomerId;

        // Update Stripe customer with current billing details
        const billingDetails: BillingDetails = {
            billingName: userRecord.billingName,
            billingCompany: userRecord.billingCompany,
            billingVat: userRecord.billingVat,
            billingAddress: userRecord.billingAddress,
            billingPhone: userRecord.billingPhone
        };

        try {
            await updateStripeCustomerBilling(stripeCustomerId, billingDetails, user.id);
        } catch (error) {
            logger.error('Failed to update Stripe customer billing during payment retry', {
                error: error instanceof Error ? error.message : String(error),
                userId: user.id,
                stripeCustomerId
            });
        }

        // Attach payment method to customer if not already attached
        try {
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: stripeCustomerId,
            });
            logger.info('Payment method attached successfully', { paymentMethodId, stripeCustomerId });
        } catch (error: any) {
            if (error.code !== 'resource_already_attached') {
                logger.error('Failed to attach payment method', {
                    error: error.message,
                    code: error.code,
                    paymentMethodId,
                    stripeCustomerId
                });
                throw error;
            } else {
                logger.info('Payment method already attached', { paymentMethodId, stripeCustomerId });
            }
        }

        // Set as default payment method for invoices
        try {
            await stripe.customers.update(stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            logger.info('Payment method set as default', { paymentMethodId, stripeCustomerId });
        } catch (error: any) {
            logger.error('Failed to set payment method as default', {
                error: error.message,
                paymentMethodId,
                stripeCustomerId
            });
            throw error;
        }

        // Get the current Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId, {
            expand: ['latest_invoice.payment_intent']
        });

        logger.info('Retrieved Stripe subscription for retry', {
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            hasLatestInvoice: !!stripeSubscription.latest_invoice
        });

        let requiresAction = false;
        let clientSecret = null;
        let paymentStatus = 'processing';

        if (stripeSubscription.status === 'incomplete' && stripeSubscription.latest_invoice) {
            const invoice = stripeSubscription.latest_invoice as any;
            
            logger.info('Processing incomplete subscription with invoice', {
                invoiceId: invoice.id,
                invoiceStatus: invoice.status,
                hasPaymentIntent: !!invoice.payment_intent
            });

            if (invoice.payment_intent) {
                let paymentIntent;
                
                // Get payment intent
                if (typeof invoice.payment_intent === 'string') {
                    paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
                } else {
                    paymentIntent = invoice.payment_intent;
                }

                logger.info('Current payment intent status', {
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency
                });

                if (paymentIntent.status === 'requires_payment_method' || 
                    paymentIntent.status === 'requires_confirmation') {
                    
                    // Update the payment intent with the new payment method
                    const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntent.id, {
                        payment_method: paymentMethodId,
                    });

                    logger.info('Updated payment intent with new payment method', {
                        paymentIntentId: updatedPaymentIntent.id,
                        status: updatedPaymentIntent.status
                    });

                    // Confirm the payment intent
                    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
                        payment_method: paymentMethodId,
                        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/checkout?success=true`
                    });

                    logger.info('Payment intent confirmation result', {
                        paymentIntentId: confirmedPaymentIntent.id,
                        status: confirmedPaymentIntent.status,
                        nextAction: confirmedPaymentIntent.next_action?.type
                    });

                    paymentStatus = confirmedPaymentIntent.status;

                    if (confirmedPaymentIntent.status === 'requires_action' && confirmedPaymentIntent.client_secret) {
                        requiresAction = true;
                        clientSecret = confirmedPaymentIntent.client_secret;
                        
                        logger.info('Payment requires 3D Secure authentication', {
                            paymentIntentId: confirmedPaymentIntent.id,
                            nextAction: confirmedPaymentIntent.next_action
                        });
                    } else if (confirmedPaymentIntent.status === 'succeeded') {
                        logger.info('Payment succeeded immediately', {
                            paymentIntentId: confirmedPaymentIntent.id
                        });
                        paymentStatus = 'succeeded';
                    }
                } else if (paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
                    // Payment intent already requires action (3D Secure)
                    requiresAction = true;
                    clientSecret = paymentIntent.client_secret;
                    paymentStatus = 'requires_action';
                    
                    logger.info('Payment intent already requires action', {
                        paymentIntentId: paymentIntent.id,
                        nextAction: paymentIntent.next_action
                    });
                } else if (paymentIntent.status === 'succeeded') {
                    paymentStatus = 'succeeded';
                    logger.info('Payment intent already succeeded', {
                        paymentIntentId: paymentIntent.id
                    });
                }
            } else {
                // No payment intent on invoice, try to pay the invoice directly
                logger.info('No payment intent found, attempting to pay invoice directly', {
                    invoiceId: invoice.id
                });

                try {
                    const paidInvoice = await stripe.invoices.pay(invoice.id, {
                        payment_method: paymentMethodId,
                        expand: ['payment_intent']
                    });

                    logger.info('Invoice payment attempted', {
                        invoiceId: paidInvoice.id,
                        status: paidInvoice.status,
                        paid: paidInvoice.paid
                    });

                    if (paidInvoice.payment_intent) {
                        let paymentIntent;
                        
                        if (typeof paidInvoice.payment_intent === 'string') {
                            paymentIntent = await stripe.paymentIntents.retrieve(paidInvoice.payment_intent);
                        } else {
                            paymentIntent = paidInvoice.payment_intent;
                        }
                        
                        paymentStatus = paymentIntent.status;
                        
                        if (paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
                            requiresAction = true;
                            clientSecret = paymentIntent.client_secret;
                        } else if (paymentIntent.status === 'succeeded') {
                            paymentStatus = 'succeeded';
                        }
                    }
                } catch (paymentError: any) {
                    logger.error('Failed to pay invoice during retry', {
                        error: paymentError.message,
                        code: paymentError.code,
                        invoiceId: invoice.id
                    });

                    if (paymentError.payment_intent && paymentError.payment_intent.client_secret) {
                        requiresAction = true;
                        clientSecret = paymentError.payment_intent.client_secret;
                        paymentStatus = 'requires_action';
                    } else {
                        throw paymentError;
                    }
                }
            }
        } else if (stripeSubscription.status === 'active') {
            paymentStatus = 'succeeded';
            logger.info('Subscription is already active');
        }

        // Update local subscription status if payment succeeded
        if (paymentStatus === 'succeeded') {
            await db
                .update(subscriptions)
                .set({
                    status: 'active',
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(subscriptions.id, subscriptionId));

            logger.info('Updated local subscription status to active', {
                subscriptionId,
                userId: user.id
            });
        }

        logger.info('Returning payment retry response', {
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            requiresAction,
            hasClientSecret: !!clientSecret,
            paymentStatus
        });

        return NextResponse.json({
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            localSubscriptionId: subscription.id,
            requiresAction,
            clientSecret,
            paymentStatus
        });
    } catch (error: any) {
        logger.error('Payment retry error', {
            error: error.message || 'Unknown error',
            userId: request.headers.get('authorization') || undefined
        });
        
        return NextResponse.json(
            { error: error.message || 'Failed to retry payment' },
            { status: 500 }
        );
    }
}