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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { serviceId, paymentMethodId, coupon } = body;

        // Validate input
        if (!serviceId || typeof serviceId !== 'number') {
            return NextResponse.json({ error: 'Valid service ID is required' }, { status: 400 });
        }

        // Validate coupon code if provided
        if (coupon) {
            const couponValidation = validateCouponCode(coupon);
            if (!couponValidation.isValid) {
                return NextResponse.json({ 
                    error: `Invalid coupon code: ${couponValidation.error}` 
                }, { status: 400 });
            }
        }

        // Get the price ID for the service
        const priceId = getPriceIdByServiceId(serviceId);
        if (!priceId) {
            return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
        }

        // Get user's Stripe customer ID
        const [userRecord] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!userRecord.stripeCustomerId) {
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
            logger.error('Failed to update Stripe customer billing during subscription creation', {
                error: error instanceof Error ? error.message : String(error),
                userId: user.id,
                stripeCustomerId
            });
            // Continue with subscription creation even if billing update fails
        }

        // First, ensure payment method is attached and set as default
        if (paymentMethodId) {
            try {
                // Attach payment method to customer if not already attached
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: stripeCustomerId,
                });
            } catch (error: any) {
                // If already attached, that's fine
                if (error.code !== 'resource_already_attached') {
                    throw error;
                }
            }

            // Set as default payment method for invoices
            await stripe.customers.update(stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }

        // Check if user already has an active or trial subscription for this service
        const existingSubscriptions = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.userId, user.id),
                eq(subscriptions.serviceId, serviceId.toString())
            ));
        
        // Check for recent subscription attempts (within last 30 seconds) to prevent rapid duplicates
        const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
        const recentSubscription = existingSubscriptions.find(sub => 
            sub.createdAt && sub.createdAt > thirtySecondsAgo
        );
        
        if (recentSubscription) {
            logger.warn('Duplicate subscription attempt detected', {
                userId: user.id,
                serviceId,
                recentSubscriptionId: recentSubscription.id,
                createdAt: recentSubscription.createdAt
            });
            return NextResponse.json({ 
                error: 'O cerere de abonare pentru acest serviciu este deja în procesare. Te rugăm să aștepți.' 
            }, { status: 429 }); // 429 Too Many Requests
        }
        
        const existingActiveSubscription = existingSubscriptions.find(sub => 
            sub.status === 'active' || sub.status === 'trial' || sub.status === 'pending_payment'
        );

        // Prevent if there's an active, trial, or pending payment subscription
        if (existingActiveSubscription && 
            (existingActiveSubscription.status === 'active' || 
             existingActiveSubscription.status === 'trial' ||
             existingActiveSubscription.status === 'pending_payment')) {
            
            const statusMessage = existingActiveSubscription.status === 'pending_payment' 
                ? 'Ai deja o plată în așteptare pentru acest serviciu. Te rugăm să finalizezi plata existentă.'
                : 'Ai deja un abonament activ pentru acest serviciu.';
            
            return NextResponse.json({ 
                error: statusMessage 
            }, { status: 400 });
        }

        // Create subscription with immediate payment
        const subscriptionParams: any = {
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            default_payment_method: paymentMethodId,
            expand: ['latest_invoice', 'pending_setup_intent'],
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

        // Apply coupon if provided
        if (coupon) {
            subscriptionParams.discounts = [{ coupon }];
        }

        // Create the subscription - Stripe will automatically:
        // 1. Create the subscription
        // 2. Generate an invoice
        // 3. Attempt to pay the invoice using the default payment method
        // 4. Set the payment method as default for the subscription
        const stripeSubscription = await stripe.subscriptions.create(subscriptionParams);

        // Check if payment requires additional action (e.g., 3D Secure)
        const invoice = stripeSubscription.latest_invoice as any;
        let requiresAction = false;
        let clientSecret = null;
        let paymentStatus = 'processing';
        
        // With payment_behavior: 'default_incomplete', the subscription will be in 'incomplete' state
        // and we need to confirm the payment intent
        if (stripeSubscription.status === 'incomplete' && invoice && invoice.payment_intent) {
            let paymentIntent;
            
            // If payment_intent is a string, retrieve it
            if (typeof invoice.payment_intent === 'string') {
                paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
            } else {
                paymentIntent = invoice.payment_intent;
            }
            
            paymentStatus = paymentIntent.status;
            
            // The payment intent should be in requires_payment_method or requires_confirmation state
            if (paymentIntent.status === 'requires_payment_method' || 
                paymentIntent.status === 'requires_confirmation' ||
                paymentIntent.status === 'requires_action') {
                requiresAction = true;
                clientSecret = paymentIntent.client_secret;
                
                logger.info('Payment confirmation required', {
                    subscriptionId: stripeSubscription.id,
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status,
                    nextAction: paymentIntent.next_action
                });
            }
        } else if (stripeSubscription.pending_setup_intent) {
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

        return NextResponse.json({
            subscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            localSubscriptionId: newSubscription.id,
            requiresAction,
            clientSecret,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}