import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { users, subscriptions } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';



export async function GET(request: NextRequest) {
    try {
        logger.info('Checking incomplete payments - start');
        
        const user = await getUserFromToken(request);
        if (!user) {
            logger.warn('Unauthorized request to check incomplete payments');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        logger.info('User authenticated', { userId: user.id });

        // Get user's Stripe customer ID
        const [userRecord] = await db
            .select({ stripeCustomerId: users.stripeCustomerId })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord?.stripeCustomerId) {
            return NextResponse.json({ 
                incompletePayments: [],
                message: 'No Stripe customer found' 
            });
        }

        const incompletePayments = [];

        try {
            // 1️⃣ Check for incomplete subscriptions
            logger.info('Checking incomplete subscriptions', { 
                stripeCustomerId: userRecord.stripeCustomerId 
            });
            
            const incompleteSubs = await stripe.subscriptions.list({
                customer: userRecord.stripeCustomerId,
                status: 'incomplete',
                expand: ['data.latest_invoice.payment_intent'],
            });
            
            logger.info('Found incomplete subscriptions', { 
                count: incompleteSubs.data.length 
            });

        for (const sub of incompleteSubs.data) {
            const invoice = sub.latest_invoice as any;
            const paymentIntent = invoice?.payment_intent;
            
            if (paymentIntent && (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method')) {
                incompletePayments.push({
                    type: 'subscription',
                    subscriptionId: sub.id,
                    invoiceId: invoice.id,
                    paymentIntentId: paymentIntent.id,
                    paymentIntentStatus: paymentIntent.status,
                    clientSecret: paymentIntent.client_secret,
                    amount: invoice.amount_due,
                    currency: invoice.currency,
                    created: new Date(sub.created * 1000).toISOString(),
                    metadata: sub.metadata
                });

                // Update local subscription status if needed
                const [localSub] = await db
                    .select()
                    .from(subscriptions)
                    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
                    .limit(1);

                if (localSub && localSub.status !== 'pending_payment') {
                    await db.update(subscriptions)
                        .set({ 
                            status: 'pending_payment',
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
                }
            }
        }
        } catch (stripeError: any) {
            logger.error('Error checking incomplete subscriptions', {
                error: stripeError.message,
                type: stripeError.type
            });
        }

        try {
            // 2️⃣ Check for open invoices
            logger.info('Checking open invoices');
            
            const openInvoices = await stripe.invoices.list({
                customer: userRecord.stripeCustomerId,
                status: 'open',
                expand: ['data.payment_intent'],
            });
            
            logger.info('Found open invoices', { 
                count: openInvoices.data.length 
            });

            for (const invoice of openInvoices.data) {
                const paymentIntent = invoice.payment_intent as any;
                
                if (paymentIntent && (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method')) {
                    // Check if we already added this from subscriptions
                    const alreadyAdded = incompletePayments.some(p => p.paymentIntentId === paymentIntent.id);
                    
                    if (!alreadyAdded) {
                        incompletePayments.push({
                            type: 'invoice',
                            invoiceId: invoice.id,
                            paymentIntentId: paymentIntent.id,
                            paymentIntentStatus: paymentIntent.status,
                            clientSecret: paymentIntent.client_secret,
                            amount: invoice.amount_due,
                            currency: invoice.currency,
                            created: new Date(invoice.created * 1000).toISOString(),
                            subscriptionId: invoice.subscription
                        });
                    }
                }
            }
        } catch (stripeError: any) {
            logger.error('Error checking open invoices', {
                error: stripeError.message,
                type: stripeError.type
            });
        }

        try {
            // 3️⃣ Check for payment intents that need action
            const pendingIntents = await stripe.paymentIntents.list({
                customer: userRecord.stripeCustomerId,
            });

            for (const intent of pendingIntents.data) {
                if (intent.status === 'requires_action' || intent.status === 'requires_payment_method') {
                    // Check if we already added this
                    const alreadyAdded = incompletePayments.some(p => p.paymentIntentId === intent.id);
                    
                    if (!alreadyAdded) {
                        incompletePayments.push({
                            type: 'payment_intent',
                            paymentIntentId: intent.id,
                            paymentIntentStatus: intent.status,
                            clientSecret: intent.client_secret,
                            amount: intent.amount,
                            currency: intent.currency,
                            created: new Date(intent.created * 1000).toISOString(),
                            metadata: intent.metadata
                        });
                    }
                }
            }
        } catch (stripeError: any) {
            logger.error('Error checking payment intents', {
                error: stripeError.message,
                type: stripeError.type
            });
        }

        logger.info('Checked for incomplete payments', {
            userId: user.id,
            stripeCustomerId: userRecord.stripeCustomerId,
            incompleteCount: incompletePayments.length
        });

        return NextResponse.json({
            incompletePayments: incompletePayments.sort((a, b) => 
                new Date(b.created).getTime() - new Date(a.created).getTime()
            )
        });

    } catch (error: any) {
        logger.error('Error checking incomplete payments', {
            error: error.message || 'Unknown error',
            stack: error.stack,
            userId: user?.id
        });
        
        return NextResponse.json(
            { 
                error: error.message || 'Failed to check incomplete payments',
                incompletePayments: [] 
            },
            { status: 500 }
        );
    }
}