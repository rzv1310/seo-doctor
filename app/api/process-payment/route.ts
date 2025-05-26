import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users, orders } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import { logger, withLogging } from '@/lib/logger';

export const POST = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated || !session.user) {
            logger.warn('Unauthorized payment attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            amount,
            currency = 'usd',
            description,
            orderId,
            cardId,
            metadata = {}
        } = body;

        logger.info('Processing payment', {
            userId: session.user.id,
            amount,
            currency,
            orderId
        });

        if (!amount || amount <= 0) {
            logger.warn('Invalid payment amount', { amount, userId: session.user.id });
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .then((results) => results[0]);

        if (!user || !user.stripeCustomerId) {
            logger.error('No payment methods found for user', { userId: session.user.id });
            return NextResponse.json({ error: 'No payment methods found' }, { status: 400 });
        }

        const sourceId = cardId || user.defaultPaymentMethodId;

        if (!sourceId) {
            logger.warn('No payment method selected', { userId: session.user.id });
            return NextResponse.json({ error: 'No payment method selected' }, { status: 400 });
        }

        const charge = await stripe.charges.create({
            amount,
            currency,
            customer: user.stripeCustomerId,
            source: sourceId,
            description: description || `Payment for order ${orderId}`,
            metadata: {
                userId: user.id,
                orderId: orderId || '',
                ...metadata
            }
        });

        logger.info('Charge created', { amount, currency, userId: user.id });

        if (orderId) {
            await db
                .update(orders)
                .set({
                    status: 'paid',
                    stripePaymentId: charge.id
                })
                .where(eq(orders.id, orderId));

            logger.info('Order status updated to paid', { orderId, chargeId: charge.id });
        }

        return NextResponse.json({
            success: true,
            chargeId: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            last4: (charge.source as any)?.last4,
            brand: (charge.source as any)?.brand
        });

    } catch (error) {
        if (error instanceof Error && 'type' in error) {
            const stripeError = error as any;
            logger.error('Stripe payment error', {
                error: stripeError.message,
                type: stripeError.type,
                code: stripeError.code
            });
            return NextResponse.json(
                {
                    error: stripeError.message,
                    type: stripeError.type,
                    code: stripeError.code
                },
                { status: 400 }
            );
        }

        logger.error('Failed to process payment', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
});

export const GET = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated || !session.user) {
            logger.warn('Unauthorized payment methods fetch attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .then((results) => results[0]);

        if (!user || !user.stripeCustomerId) {
            logger.info('No payment methods found - no Stripe customer', { userId: session.user.id });
            return NextResponse.json({ cards: [] });
        }

        const cards = await stripe.customers.listSources(
            user.stripeCustomerId,
            { object: 'card' }
        );

        const paymentMethods = cards.data.map((card: any) => ({
            id: card.id,
            brand: card.brand,
            last4: card.last4,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            isDefault: card.id === user.defaultPaymentMethodId
        }));

        logger.info('Payment methods fetched', {
            userId: session.user.id,
            cardCount: paymentMethods.length
        });

        return NextResponse.json({
            cards: paymentMethods,
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
