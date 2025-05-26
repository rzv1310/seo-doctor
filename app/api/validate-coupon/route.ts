import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { couponCode } = body;

        if (!couponCode) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        // Try to retrieve the coupon from Stripe
        const coupon = await stripe.coupons.retrieve(couponCode);

        if (!coupon || !coupon.valid) {
            return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 });
        }

        // Return coupon details
        return NextResponse.json({
            valid: true,
            percentOff: coupon.percent_off,
            amountOff: coupon.amount_off,
            currency: coupon.currency,
            duration: coupon.duration,
            durationInMonths: coupon.duration_in_months,
            name: coupon.name,
            metadata: coupon.metadata,
        });
    } catch (error: any) {
        console.error('Validate coupon error:', error);
        
        // Check if it's a Stripe error for invalid coupon
        if (error.code === 'resource_missing') {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to validate coupon' },
            { status: 500 }
        );
    }
}