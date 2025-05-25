import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';
import { logger, withLogging } from '@/lib/logger';

export const POST = withLogging(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { amount, currency = 'usd', description, metadata = {} } = body;

        logger.info('Creating payment intent', { amount, currency });

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            description,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        logger.payment('payment_intent_created', amount, currency, metadata.userId, undefined);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error: any) {
        let errorMessage = 'Error creating payment intent';
        let statusCode = 500;

        if (error.type === 'StripeCardError') {
            errorMessage = error.message;
            statusCode = 400;
        } else if (error.type === 'StripeInvalidRequestError') {
            errorMessage = 'Invalid parameters were supplied to Stripe API';
            statusCode = 400;
        } else if (error.type === 'StripeAPIError') {
            errorMessage = 'An error occurred while communicating with Stripe';
            statusCode = 503;
        }

        logger.error('Payment intent creation failed', error, { 
            errorType: error.type,
            statusCode 
        });

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
});