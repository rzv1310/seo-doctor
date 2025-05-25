import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, currency = 'usd', description, metadata = {} } = body;

        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            description,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Return the client secret to the client
        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);

        // Return more detailed error information
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

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
