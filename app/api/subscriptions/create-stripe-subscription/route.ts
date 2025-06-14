import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { users, subscriptions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { getPriceIdByServiceId } from '@/data/payment';
import { updateStripeCustomerBilling } from '@/lib/billing-utils';
import { validateCouponCode } from '@/lib/discount-utils';
import { logger } from '@/lib/logger';
import { BillingDetails } from '@/types/billing';


export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            logger.warn('Unauthorized subscription creation attempt', {});
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { serviceId, paymentMethodId, coupon, promotionCodeId } = body;
        
        logger.info('Subscription creation started', {
            userId: user.id,
            userEmail: user.email,
            serviceId,
            paymentMethodId,
            hasCoupon: !!coupon,
            hasPromotionCode: !!promotionCodeId
        });

        // Validate input
        if (!serviceId || typeof serviceId !== 'number') {
            return NextResponse.json({ error: 'Valid service ID is required' }, { status: 400 });
        }

        // Validate coupon code format if provided (but not the existence)
        if (coupon && !promotionCodeId) {
            const couponValidation = validateCouponCode(coupon);
            if (!couponValidation.isValid) {
                return NextResponse.json({ 
                    error: `Invalid coupon code format: ${couponValidation.error}` 
                }, { status: 400 });
            }
        }

        // Get the price ID for the service
        const priceId = getPriceIdByServiceId(serviceId);
        if (!priceId) {
            logger.error('Invalid service ID provided', { serviceId, userId: user.id });
            return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
        }
        
        logger.info('Service price ID retrieved', {
            serviceId,
            priceId,
            userId: user.id
        });

        // Get user's Stripe customer ID
        const [userRecord] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord) {
            logger.error('User record not found in database', { userId: user.id });
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!userRecord.stripeCustomerId) {
            logger.error('User has no Stripe customer ID', { userId: user.id });
            return NextResponse.json({ 
                error: 'No payment method found. Please add a payment method first.' 
            }, { status: 400 });
        }

        const stripeCustomerId = userRecord.stripeCustomerId;
        
        logger.info('User and Stripe customer validated', {
            userId: user.id,
            stripeCustomerId,
            hasBillingDetails: !!(userRecord.billingName && userRecord.billingAddress)
        });

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
            logger.error('Failed to update Stripe customer billing during subscription creation', {
                error: error instanceof Error ? error.message : String(error),
                userId: user.id,
                stripeCustomerId
            });
            // Continue with subscription creation even if billing update fails
        }

        // First, ensure payment method is attached and set as default
        if (paymentMethodId) {
            logger.info('Attaching payment method to customer', {
                paymentMethodId,
                stripeCustomerId,
                userId: user.id
            });
            
            try {
                // Attach payment method to customer if not already attached
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: stripeCustomerId,
                });
                logger.info('Payment method attached successfully', { paymentMethodId, stripeCustomerId });
            } catch (error: any) {
                // If already attached, that's fine
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
        } else {
            logger.warn('No payment method ID provided for subscription', { userId: user.id });
        }

        // Check if user already has an active or trial subscription for this service
        const existingSubscriptions = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.userId, user.id),
                eq(subscriptions.serviceId, serviceId.toString())
            ));
        
        // Remove the 30-second check - we'll handle all existing subscriptions properly below
        
        const existingActiveSubscription = existingSubscriptions.find(sub => 
            sub.status === 'active' || sub.status === 'trial'
        );

        // Only prevent if there's an active or trial subscription
        if (existingActiveSubscription) {
            return NextResponse.json({ 
                error: 'Ai deja un abonament activ pentru acest serviciu.' 
            }, { status: 400 });
        }

        // The logic for handling incomplete subscriptions has been moved below
        // to check ALL incomplete subscriptions, not just pending_payment ones

        // Check if there's any pending payment subscription we should handle
        const pendingSubscriptions = existingSubscriptions.filter(sub => 
            sub.status === 'pending_payment' || sub.status === 'inactive'
        );
        
        logger.info('Found existing subscriptions for service', {
            userId: user.id,
            serviceId,
            total: existingSubscriptions.length,
            pending: pendingSubscriptions.length,
            statuses: existingSubscriptions.map(s => ({ id: s.id, status: s.status, hasStripeId: !!s.stripeSubscriptionId }))
        });
        
        // If there's a pending subscription without a Stripe ID, we need to clean it up
        // This happens when payment fails during initial creation
        for (const pendingSub of pendingSubscriptions) {
            if (!pendingSub.stripeSubscriptionId) {
                logger.info('Found pending subscription without Stripe ID, marking as cancelled', {
                    localId: pendingSub.id,
                    status: pendingSub.status
                });
                
                // Mark it as cancelled so we can create a new one
                await db.update(subscriptions)
                    .set({ 
                        status: 'cancelled',
                        cancelledAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    })
                    .where(eq(subscriptions.id, pendingSub.id));
            }
        }
        
        // Now check for subscriptions with Stripe IDs that we can retry
        const retryableSubscriptions = existingSubscriptions.filter(sub => 
            sub.status !== 'cancelled' && 
            sub.stripeSubscriptionId
        );
        
        // Try each subscription with a Stripe ID to see if we can pay its invoice
        for (const existingSub of retryableSubscriptions) {
            
            try {
                logger.info('Checking existing subscription for payable invoice', {
                    subscriptionId: existingSub.stripeSubscriptionId,
                    localId: existingSub.id,
                    status: existingSub.status
                });
                
                // Retrieve the subscription with its latest invoice
                let stripeSubscription;
                try {
                    stripeSubscription = await stripe.subscriptions.retrieve(
                        existingSub.stripeSubscriptionId,
                        { expand: ['latest_invoice'] }
                    );
                } catch (retrieveError: any) {
                    // If subscription doesn't exist in Stripe, clean up local record
                    if (retrieveError.code === 'resource_missing') {
                        logger.info('Stripe subscription not found, cleaning up local record', {
                            stripeSubscriptionId: existingSub.stripeSubscriptionId,
                            localId: existingSub.id
                        });
                        
                        await db.update(subscriptions)
                            .set({ 
                                status: 'cancelled',
                                cancelledAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            })
                            .where(eq(subscriptions.id, existingSub.id));
                        
                        continue; // Skip to next subscription
                    }
                    throw retrieveError;
                }
                
                const latestInvoice = stripeSubscription.latest_invoice as any;
                
                // Check if the invoice is open and can be paid
                if (latestInvoice && (latestInvoice.status === 'open' || latestInvoice.status === 'draft')) {
                    logger.info('Found open invoice for existing subscription', {
                        invoiceId: latestInvoice.id,
                        invoiceStatus: latestInvoice.status,
                        subscriptionId: stripeSubscription.id
                    });
                    
                    try {
                        // First update the payment method on the subscription
                        await stripe.subscriptions.update(stripeSubscription.id, {
                            default_payment_method: paymentMethodId
                        });
                        
                        // Pay the existing invoice
                        const paidInvoice = await stripe.invoices.pay(latestInvoice.id, {
                            payment_method: paymentMethodId,
                            expand: ['payment_intent']
                        });
                        
                        logger.info('Paid existing invoice', {
                            invoiceId: paidInvoice.id,
                            status: paidInvoice.status,
                            paid: paidInvoice.paid
                        });
                        
                        // Handle payment intent for 3D Secure if needed
                        if (paidInvoice.payment_intent) {
                            let paymentIntent;
                            
                            if (typeof paidInvoice.payment_intent === 'string') {
                                paymentIntent = await stripe.paymentIntents.retrieve(paidInvoice.payment_intent);
                            } else {
                                paymentIntent = paidInvoice.payment_intent;
                            }
                            
                            if (paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
                                logger.info('Existing invoice payment requires 3D Secure', {
                                    paymentIntentId: paymentIntent.id
                                });
                                
                                return NextResponse.json({
                                    subscriptionId: stripeSubscription.id,
                                    status: stripeSubscription.status,
                                    localSubscriptionId: existingSub.id,
                                    requiresAction: true,
                                    clientSecret: paymentIntent.client_secret,
                                    paymentStatus: 'requires_action',
                                    isRetry: true
                                });
                            } else if (paymentIntent.status === 'succeeded') {
                                // Payment succeeded, update local subscription
                                await db.update(subscriptions)
                                    .set({ 
                                        status: 'active',
                                        updatedAt: new Date().toISOString()
                                    })
                                    .where(eq(subscriptions.id, existingSub.id));
                                
                                logger.info('Activated existing subscription after successful payment', {
                                    subscriptionId: stripeSubscription.id,
                                    localSubscriptionId: existingSub.id
                                });
                                
                                return NextResponse.json({
                                    subscriptionId: stripeSubscription.id,
                                    status: 'active',
                                    localSubscriptionId: existingSub.id,
                                    requiresAction: false,
                                    clientSecret: null,
                                    paymentStatus: 'succeeded',
                                    isRetry: true
                                });
                            }
                        }
                    } catch (payError: any) {
                        logger.error('Failed to pay existing invoice', {
                            error: payError.message,
                            code: payError.code,
                            invoiceId: latestInvoice.id
                        });
                        
                        // If it's a 3D Secure requirement, handle it
                        if (payError.code === 'invoice_payment_intent_requires_action') {
                            // Try to get the payment intent from the error or updated invoice
                            const updatedInvoice = await stripe.invoices.retrieve(latestInvoice.id, {
                                expand: ['payment_intent']
                            });
                            
                            if (updatedInvoice.payment_intent) {
                                let paymentIntent;
                                
                                if (typeof updatedInvoice.payment_intent === 'string') {
                                    paymentIntent = await stripe.paymentIntents.retrieve(updatedInvoice.payment_intent);
                                } else {
                                    paymentIntent = updatedInvoice.payment_intent;
                                }
                                
                                if (paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
                                    return NextResponse.json({
                                        subscriptionId: stripeSubscription.id,
                                        status: stripeSubscription.status,
                                        localSubscriptionId: existingSub.id,
                                        requiresAction: true,
                                        clientSecret: paymentIntent.client_secret,
                                        paymentStatus: 'requires_action',
                                        isRetry: true
                                    });
                                }
                            }
                        }
                        // Continue to next subscription if this one fails
                    }
                }
            } catch (error) {
                logger.error('Failed to check incomplete subscription', {
                    error: error instanceof Error ? error.message : String(error),
                    subscriptionId: existingSub.stripeSubscriptionId
                });
                // Continue to next subscription
            }
        }
        
        // Only block if there's an active subscription with a Stripe ID
        const activeSubscriptionsWithStripeId = existingSubscriptions.filter(sub => 
            (sub.status === 'active' || sub.status === 'trial') && 
            sub.stripeSubscriptionId
        );
        
        if (activeSubscriptionsWithStripeId.length > 0) {
            logger.error('Active subscription already exists', {
                userId: user.id,
                serviceId,
                existingSubscriptions: activeSubscriptionsWithStripeId.map(s => ({ 
                    id: s.id, 
                    status: s.status, 
                    stripeId: s.stripeSubscriptionId 
                }))
            });
            
            return NextResponse.json({ 
                error: 'Ai deja un abonament activ pentru acest serviciu.' 
            }, { status: 400 });
        }
        
        // Only create a new subscription if there are NO existing subscriptions
        logger.info('No existing subscriptions found, creating new subscription', {
            userId: user.id,
            serviceId
        });

        // Create subscription with immediate payment
        const subscriptionParams: any = {
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            default_payment_method: paymentMethodId,
            expand: ['latest_invoice.payment_intent', 'latest_invoice', 'pending_setup_intent'],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card'],
                payment_method_options: {
                    card: {
                        request_three_d_secure: 'any'
                    }
                }
            },
            metadata: {
                userId: user.id.toString(),
                serviceId: serviceId.toString(),
            },
        };

        // Apply promotion code or coupon if provided
        if (promotionCodeId) {
            // Use promotion code ID if provided (from validation)
            subscriptionParams.discounts = [{ promotion_code: promotionCodeId }];
            logger.info('Applying promotion code to subscription', {
                promotionCodeId,
                userId: user.id,
                serviceId
            });
        } else if (coupon) {
            // Fallback to direct coupon for backward compatibility
            subscriptionParams.discounts = [{ coupon }];
            logger.info('Applying direct coupon to subscription', {
                coupon,
                userId: user.id,
                serviceId
            });
        }

        // Create the subscription - Stripe will automatically:
        // 1. Create the subscription
        // 2. Generate an invoice
        // 3. Attempt to pay the invoice using the default payment method
        // 4. If payment requires authentication, subscription will be incomplete
        const stripeSubscription = await stripe.subscriptions.create(subscriptionParams);
        
        logger.info('Stripe subscription created', {
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            hasLatestInvoice: !!stripeSubscription.latest_invoice,
            invoiceStatus: typeof stripeSubscription.latest_invoice === 'object' ? stripeSubscription.latest_invoice?.status : 'string_id',
            invoicePaymentIntentId: typeof stripeSubscription.latest_invoice === 'object' ? (typeof stripeSubscription.latest_invoice?.payment_intent === 'object' ? stripeSubscription.latest_invoice?.payment_intent?.id : stripeSubscription.latest_invoice?.payment_intent) : null,
            invoicePaymentIntentType: typeof stripeSubscription.latest_invoice === 'object' ? typeof stripeSubscription.latest_invoice?.payment_intent : 'string',
            hasPendingSetupIntent: !!stripeSubscription.pending_setup_intent,
            currentPeriodStart: stripeSubscription.current_period_start,
            currentPeriodEnd: stripeSubscription.current_period_end,
            trialStart: stripeSubscription.trial_start,
            trialEnd: stripeSubscription.trial_end,
            canceledAt: stripeSubscription.canceled_at,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            items: stripeSubscription.items?.data?.map(item => ({
                id: item.id,
                priceId: item.price.id,
                quantity: item.quantity
            })),
            userId: user.id,
            serviceId
        });

        // Check if payment requires additional action (e.g., 3D Secure)
        let requiresAction = false;
        let clientSecret = null;
        let paymentStatus = 'processing';
        
        // Check the subscription's invoice for payment intent
        const invoice = stripeSubscription.latest_invoice as any;
        
        logger.info('Checking subscription invoice details', {
            subscriptionId: stripeSubscription.id,
            subscriptionStatus: stripeSubscription.status,
            hasInvoice: !!invoice,
            invoiceId: invoice?.id,
            invoiceStatus: invoice?.status,
            hasPaymentIntent: !!invoice?.payment_intent,
            paymentIntentId: invoice?.payment_intent?.id || invoice?.payment_intent,
            paymentIntentType: typeof invoice?.payment_intent
        });
        
        if (stripeSubscription.status === 'active') {
            paymentStatus = 'succeeded';
            logger.info('Subscription is already active, no payment confirmation needed');
        } else if (stripeSubscription.status === 'incomplete' && invoice && invoice.payment_intent) {
            let paymentIntent;
            
            // If payment_intent is a string, retrieve it
            if (typeof invoice.payment_intent === 'string') {
                paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
            } else {
                paymentIntent = invoice.payment_intent;
            }
            
            paymentStatus = paymentIntent.status;
            
            logger.info('Payment intent status', {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                hasClientSecret: !!paymentIntent.client_secret,
                nextAction: paymentIntent.next_action?.type,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                confirmationMethod: paymentIntent.confirmation_method,
                captureMethod: paymentIntent.capture_method,
                lastPaymentError: paymentIntent.last_payment_error,
                charges: (paymentIntent as any).charges?.data?.map((charge: any) => ({
                    id: charge.id,
                    status: charge.status,
                    outcome: charge.outcome,
                    threeDSecure: charge.payment_method_details?.card?.three_d_secure
                }))
            });
            
            // For incomplete subscriptions, always provide the client secret for frontend confirmation
            // This allows the frontend to trigger 3D Secure when needed
            if (paymentIntent.client_secret) {
                requiresAction = true;
                clientSecret = paymentIntent.client_secret;
                
                logger.info('Payment confirmation required', {
                    subscriptionId: stripeSubscription.id,
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status,
                    clientSecret: !!clientSecret,
                    nextAction: paymentIntent.next_action
                });
            }
        } else if (stripeSubscription.status === 'incomplete' && invoice && !invoice.payment_intent) {
            // Invoice exists but no payment intent - need to pay the invoice directly
            logger.info('Invoice exists without payment intent, attempting to pay invoice', {
                subscriptionId: stripeSubscription.id,
                invoiceId: invoice.id,
                invoiceStatus: invoice.status,
                invoiceTotal: invoice.total,
                invoiceCurrency: invoice.currency
            });
            
            try {
                // Pay the invoice directly, which will create the payment intent
                const paidInvoice = await stripe.invoices.pay(invoice.id, {
                    payment_method: paymentMethodId,
                    expand: ['payment_intent']
                });
                
                logger.info('Invoice payment attempted', {
                    invoiceId: paidInvoice.id,
                    status: paidInvoice.status,
                    paid: paidInvoice.paid,
                    hasPaymentIntent: !!paidInvoice.payment_intent,
                    paymentIntentId: typeof paidInvoice.payment_intent === 'object' ? paidInvoice.payment_intent?.id : paidInvoice.payment_intent
                });
                
                if (paidInvoice.payment_intent) {
                    let paymentIntent;
                    
                    // If payment_intent is a string, retrieve it
                    if (typeof paidInvoice.payment_intent === 'string') {
                        paymentIntent = await stripe.paymentIntents.retrieve(paidInvoice.payment_intent);
                    } else {
                        paymentIntent = paidInvoice.payment_intent;
                    }
                    
                    paymentStatus = paymentIntent.status;
                    
                    logger.info('Payment intent from paid invoice', {
                        paymentIntentId: paymentIntent.id,
                        status: paymentIntent.status,
                        hasClientSecret: !!paymentIntent.client_secret,
                        nextAction: paymentIntent.next_action?.type,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                        confirmationMethod: paymentIntent.confirmation_method,
                        charges: (paymentIntent as any).charges?.data?.map((charge: any) => ({
                            id: charge.id,
                            status: charge.status,
                            outcome: charge.outcome,
                            threeDSecure: charge.payment_method_details?.card?.three_d_secure
                        }))
                    });
                    
                    // If payment requires action (3D Secure), provide client secret
                    if (paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
                        requiresAction = true;
                        clientSecret = paymentIntent.client_secret;
                        
                        logger.info('Payment confirmation required - 3D Secure needed', {
                            subscriptionId: stripeSubscription.id,
                            paymentIntentId: paymentIntent.id,
                            status: paymentIntent.status,
                            clientSecret: !!clientSecret,
                            nextAction: paymentIntent.next_action
                        });
                    } else if (paymentIntent.status === 'succeeded') {
                        // Payment succeeded immediately, subscription should be active
                        logger.info('Payment succeeded immediately, no 3D Secure required', {
                            paymentIntentId: paymentIntent.id
                        });
                        paymentStatus = 'succeeded';
                    }
                }
                
            } catch (paymentError: any) {
                logger.error('Failed to pay invoice', {
                    error: paymentError.message,
                    code: paymentError.code,
                    type: paymentError.type,
                    invoiceId: invoice.id,
                    subscriptionId: stripeSubscription.id
                });
                
                // If payment requires action (3D Secure), retrieve the updated invoice to get payment intent
                if (paymentError.code === 'invoice_payment_intent_requires_action') {
                    logger.info('Invoice payment requires action, retrieving payment intent', {
                        invoiceId: invoice.id,
                        subscriptionId: stripeSubscription.id,
                        errorHasPaymentIntent: !!paymentError.payment_intent,
                        errorPaymentIntentId: paymentError.payment_intent?.id
                    });
                    
                    // Check if the error contains the payment intent directly
                    if (paymentError.payment_intent) {
                        logger.info('Payment intent found in error object', {
                            paymentIntentId: paymentError.payment_intent.id,
                            status: paymentError.payment_intent.status,
                            hasClientSecret: !!paymentError.payment_intent.client_secret
                        });
                        
                        if (paymentError.payment_intent.client_secret && paymentError.payment_intent.status === 'requires_action') {
                            requiresAction = true;
                            clientSecret = paymentError.payment_intent.client_secret;
                            paymentStatus = paymentError.payment_intent.status;
                            
                            logger.info('Using payment intent from error object for 3D Secure', {
                                subscriptionId: stripeSubscription.id,
                                paymentIntentId: paymentError.payment_intent.id
                            });
                        }
                    }
                    
                    try {
                        // First try to retrieve the updated invoice
                        const updatedInvoice = await stripe.invoices.retrieve(invoice.id, {
                            expand: ['payment_intent']
                        });
                        
                        logger.info('Updated invoice retrieved after payment attempt', {
                            invoiceId: updatedInvoice.id,
                            status: updatedInvoice.status,
                            hasPaymentIntent: !!updatedInvoice.payment_intent,
                            paymentIntentId: typeof updatedInvoice.payment_intent === 'object' ? updatedInvoice.payment_intent?.id : updatedInvoice.payment_intent
                        });
                        
                        if (updatedInvoice.payment_intent) {
                            let paymentIntent;
                            
                            // If payment_intent is a string, retrieve it
                            if (typeof updatedInvoice.payment_intent === 'string') {
                                paymentIntent = await stripe.paymentIntents.retrieve(updatedInvoice.payment_intent);
                            } else {
                                paymentIntent = updatedInvoice.payment_intent;
                            }
                            
                            logger.info('Payment intent retrieved from updated invoice', {
                                paymentIntentId: paymentIntent.id,
                                status: paymentIntent.status,
                                hasClientSecret: !!paymentIntent.client_secret,
                                nextAction: paymentIntent.next_action?.type
                            });
                            
                            paymentStatus = paymentIntent.status;
                            
                            // Provide client secret for 3D Secure authentication
                            if (paymentIntent.client_secret && paymentIntent.status === 'requires_action') {
                                requiresAction = true;
                                clientSecret = paymentIntent.client_secret;
                                
                                logger.info('Payment confirmation required - 3D Secure needed from error handling', {
                                    subscriptionId: stripeSubscription.id,
                                    paymentIntentId: paymentIntent.id,
                                    status: paymentIntent.status,
                                    clientSecret: !!clientSecret,
                                    nextAction: paymentIntent.next_action
                                });
                            }
                        } else {
                            // The invoice might not have a payment intent immediately after pay() is called
                            // Try to retrieve the subscription again to get the latest invoice with payment intent
                            logger.info('Invoice has no payment intent yet, retrieving subscription again');
                            
                            const updatedSubscription = await stripe.subscriptions.retrieve(stripeSubscription.id, {
                                expand: ['latest_invoice.payment_intent']
                            });
                            
                            const latestInvoice = updatedSubscription.latest_invoice as any;
                            if (latestInvoice && latestInvoice.payment_intent) {
                                let paymentIntent;
                                
                                if (typeof latestInvoice.payment_intent === 'string') {
                                    paymentIntent = await stripe.paymentIntents.retrieve(latestInvoice.payment_intent);
                                } else {
                                    paymentIntent = latestInvoice.payment_intent;
                                }
                                
                                logger.info('Payment intent found in updated subscription', {
                                    paymentIntentId: paymentIntent.id,
                                    status: paymentIntent.status,
                                    hasClientSecret: !!paymentIntent.client_secret
                                });
                                
                                paymentStatus = paymentIntent.status;
                                
                                if (paymentIntent.client_secret && paymentIntent.status === 'requires_action') {
                                    requiresAction = true;
                                    clientSecret = paymentIntent.client_secret;
                                    
                                    logger.info('Payment confirmation required - 3D Secure needed', {
                                        subscriptionId: stripeSubscription.id,
                                        paymentIntentId: paymentIntent.id,
                                        status: paymentIntent.status
                                    });
                                }
                            } else {
                                // Still no payment intent found, try to list recent payment intents
                                logger.info('Still no payment intent found, searching for recent payment intents');
                                
                                const recentPaymentIntents = await stripe.paymentIntents.list({
                                    customer: stripeCustomerId,
                                    limit: 5,
                                    created: {
                                        gte: Math.floor(Date.now() / 1000) - 60 // Last 60 seconds
                                    }
                                });
                                
                                logger.info('Recent payment intents found', {
                                    count: recentPaymentIntents.data.length,
                                    paymentIntents: recentPaymentIntents.data.map(pi => ({
                                        id: pi.id,
                                        status: pi.status,
                                        amount: pi.amount,
                                        created: pi.created
                                    }))
                                });
                                
                                // Find the payment intent for this invoice amount
                                const matchingPaymentIntent = recentPaymentIntents.data.find(pi => 
                                    pi.amount === invoice.total && 
                                    (pi.status === 'requires_action' || pi.status === 'requires_payment_method')
                                );
                                
                                if (matchingPaymentIntent && matchingPaymentIntent.client_secret) {
                                    logger.info('Found matching payment intent requiring action', {
                                        paymentIntentId: matchingPaymentIntent.id,
                                        status: matchingPaymentIntent.status,
                                        amount: matchingPaymentIntent.amount
                                    });
                                    
                                    requiresAction = true;
                                    clientSecret = matchingPaymentIntent.client_secret;
                                    paymentStatus = matchingPaymentIntent.status;
                                }
                            }
                        }
                    } catch (retrieveError: any) {
                        logger.error('Failed to retrieve updated invoice', {
                            error: retrieveError.message,
                            invoiceId: invoice.id
                        });
                    }
                }
            }
        } else {
            logger.warn('Incomplete subscription without payment intent or missing invoice', {
                subscriptionId: stripeSubscription.id,
                subscriptionStatus: stripeSubscription.status,
                hasInvoice: !!invoice,
                hasPaymentIntent: !!invoice?.payment_intent
            });
        }
        
        if (stripeSubscription.pending_setup_intent) {
            // Handle setup intent for future payments
            const setupIntent = stripeSubscription.pending_setup_intent as any;
            if (setupIntent.status === 'requires_action' || setupIntent.status === 'requires_confirmation') {
                requiresAction = true;
                clientSecret = setupIntent.client_secret;
                logger.info('Setup intent requires action', {
                    subscriptionId: stripeSubscription.id,
                    setupIntentId: setupIntent.id
                });
            }
        }

        // Create local subscription record
        const currentPeriodStart = stripeSubscription.current_period_start 
            ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
            : new Date().toISOString();
        
        const currentPeriodEnd = stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
        
        const [newSubscription] = await db
            .insert(subscriptions)
            .values({
                id: `sub_${Date.now()}_${user.id}`,
                userId: user.id,
                serviceId: serviceId.toString(),
                stripeSubscriptionId: stripeSubscription.id,
                status: paymentStatus === 'succeeded' ? 'active' :
                       stripeSubscription.status === 'trialing' ? 'trial' : 
                       requiresAction || stripeSubscription.status === 'incomplete' ? 'pending_payment' : 'inactive',
                price: stripeSubscription.items.data[0].price.unit_amount || 0,
                startDate: currentPeriodStart,
                endDate: currentPeriodEnd,
                renewalDate: currentPeriodEnd,
                metadata: JSON.stringify({
                    stripePriceId: priceId,
                    stripeCoupon: coupon || null,
                }),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .returning();

        logger.info('Returning subscription response', {
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            requiresAction,
            hasClientSecret: !!clientSecret,
            paymentStatus
        });

        return NextResponse.json({
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            localSubscriptionId: newSubscription.id,
            requiresAction,
            clientSecret,
            paymentStatus,
            isRetry: false
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}