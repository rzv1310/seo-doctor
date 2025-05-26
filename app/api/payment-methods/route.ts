import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import { logger, withLogging } from '@/lib/logger';


// Helper function to ensure user has a Stripe customer
async function ensureStripeCustomer(user: any) {
    if (user.stripeCustomerId) {
        try {
            // Verify customer exists in Stripe
            await stripe.customers.retrieve(user.stripeCustomerId);
            return user.stripeCustomerId;
        } catch (error: any) {
            if (error.code === 'resource_missing') {
                logger.warn('Stripe customer not found, creating new one', {
                    userId: user.id,
                    oldStripeCustomerId: user.stripeCustomerId
                });
                // Clear invalid customer ID
                await db
                    .update(users)
                    .set({ stripeCustomerId: null })
                    .where(eq(users.id, user.id));
            } else {
                throw error;
            }
        }
    }

    logger.info('Creating new Stripe customer', { userId: user.id });

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
            userId: user.id.toString(),
        },
    });

    await db
        .update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, user.id));

    logger.info('Stripe customer created', {
        userId: user.id,
        stripeCustomerId: customer.id
    });

    return customer.id;
}

export const GET = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated || !session.user) {
            logger.warn('Unauthorized payment methods access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .then((results) => results[0]);

        if (!user) {
            logger.error('User not found', { userId: session.user.id });
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const stripeCustomerId = await ensureStripeCustomer(user);

        // Use modern paymentMethods API
        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'card',
        });

        const transformedCards = paymentMethods.data.map((pm: any) => ({
            id: pm.id,
            brand: pm.card.brand.toLowerCase(),
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
            isDefault: pm.id === user.defaultPaymentMethodId,
            funding: pm.card.funding,
            country: pm.card.country,
        }));

        logger.info('Payment methods retrieved', {
            userId: session.user.id,
            cardCount: transformedCards.length
        });

        return NextResponse.json({ 
            cards: transformedCards, 
            defaultCardId: user.defaultPaymentMethodId 
        });
    } catch (error) {
        logger.error('Failed to fetch payment methods', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Failed to fetch payment methods' },
            { status: 500 }
        );
    }
});

export const POST = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated || !session.user) {
            logger.warn('Unauthorized payment method add attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { paymentMethodId, setAsDefault } = body;

        if (!paymentMethodId) {
            logger.warn('Missing payment method ID in request', { userId: session.user.id });
            return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
        }

        logger.info('Adding payment method', {
            userId: session.user.id,
            setAsDefault
        });

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .then((results) => results[0]);

        if (!user) {
            logger.error('User not found', { userId: session.user.id });
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const stripeCustomerId = await ensureStripeCustomer(user);

        // Attach payment method to customer using modern API
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId,
        });

        // Get payment method details
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        logger.info('Payment method added', { userId: user.id });

        if (setAsDefault) {
            await stripe.customers.update(stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            await db
                .update(users)
                .set({ defaultPaymentMethodId: paymentMethodId })
                .where(eq(users.id, user.id));

            logger.info('Payment method set as default', {
                userId: user.id,
                paymentMethodId
            });
        }

        return NextResponse.json({
            card: {
                id: paymentMethod.id,
                brand: paymentMethod.card!.brand.toLowerCase(),
                last4: paymentMethod.card!.last4,
                expMonth: paymentMethod.card!.exp_month,
                expYear: paymentMethod.card!.exp_year,
                isDefault: setAsDefault,
                funding: paymentMethod.card!.funding,
                country: paymentMethod.card!.country,
            },
        });
    } catch (error) {
        logger.error('Failed to add payment method', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Failed to add payment method' },
            { status: 500 }
        );
    }
});

export const DELETE = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated || !session.user) {
            logger.warn('Unauthorized payment method deletion attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const paymentMethodId = searchParams.get('paymentMethodId');

        if (!paymentMethodId) {
            logger.warn('Missing payment method ID in deletion request', { userId: session.user.id });
            return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
        }

        logger.info('Deleting payment method', {
            userId: session.user.id,
            paymentMethodId
        });

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .then((results) => results[0]);

        if (!user || !user.stripeCustomerId) {
            logger.error('User or customer not found', { userId: session.user.id });
            return NextResponse.json({ error: 'User or customer not found' }, { status: 404 });
        }

        // Detach payment method using modern API
        await stripe.paymentMethods.detach(paymentMethodId);

        logger.info('Payment method deleted', { userId: user.id });

        if (user.defaultPaymentMethodId === paymentMethodId) {
            await db
                .update(users)
                .set({ defaultPaymentMethodId: null })
                .where(eq(users.id, user.id));

            logger.info('Default payment method cleared', { userId: user.id });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Failed to delete payment method', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Failed to delete payment method' },
            { status: 500 }
        );
    }
});

export const PATCH = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated || !session.user) {
            logger.warn('Unauthorized default payment method update attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { paymentMethodId } = body;

        if (!paymentMethodId) {
            logger.warn('Missing payment method ID in update request', { userId: session.user.id });
            return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
        }

        logger.info('Updating default payment method', {
            userId: session.user.id,
            paymentMethodId
        });

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .then((results) => results[0]);

        if (!user || !user.stripeCustomerId) {
            logger.error('User or customer not found', { userId: session.user.id });
            return NextResponse.json({ error: 'User or customer not found' }, { status: 404 });
        }

        await stripe.customers.update(user.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        await db
            .update(users)
            .set({ defaultPaymentMethodId: paymentMethodId })
            .where(eq(users.id, user.id));

        logger.info('Default payment method updated', { userId: user.id });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Failed to update default payment method', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Failed to update default payment method' },
            { status: 500 }
        );
    }
});