import { NextRequest, NextResponse } from 'next/server';

import stripe from '@/lib/stripe-server';
import { logger } from '@/lib/logger';



export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { couponCode } = body;

        if (!couponCode) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const normalizedCode = couponCode.trim().toUpperCase();
        
        // First, try to find a promotion code with this code
        try {
            const promotionCodes = await stripe.promotionCodes.list({
                code: normalizedCode,
                active: true,
                limit: 1
            });

            if (promotionCodes.data.length > 0) {
                const promotionCode = promotionCodes.data[0];
                const coupon = promotionCode.coupon;

                // Check if the coupon is valid
                if (!coupon.valid) {
                    return NextResponse.json({ error: 'Cupon expirat sau invalid' }, { status: 400 });
                }

                logger.info('Promotion code validated', {
                    promotionCodeId: promotionCode.id,
                    code: normalizedCode,
                    couponId: coupon.id
                });

                return NextResponse.json({
                    valid: true,
                    promotionCodeId: promotionCode.id,
                    couponId: coupon.id,
                    percentOff: coupon.percent_off,
                    amountOff: coupon.amount_off,
                    currency: coupon.currency,
                    duration: coupon.duration,
                    durationInMonths: coupon.duration_in_months,
                    name: coupon.name || `${coupon.percent_off}% reducere`,
                    metadata: coupon.metadata,
                });
            }
        } catch (err) {
            // If promotion code lookup fails, continue to direct coupon lookup
            logger.debug('Promotion code lookup failed, trying direct coupon lookup', {
                code: normalizedCode,
                error: err instanceof Error ? err.message : String(err)
            });
        }

        // Fallback: try direct coupon lookup (for backward compatibility)
        try {
            const coupon = await stripe.coupons.retrieve(normalizedCode);

            if (!coupon || !coupon.valid) {
                return NextResponse.json({ error: 'Cod promoțional invalid sau expirat' }, { status: 400 });
            }

            logger.info('Direct coupon validated', {
                couponId: coupon.id,
                code: normalizedCode
            });

            return NextResponse.json({
                valid: true,
                couponId: coupon.id,
                percentOff: coupon.percent_off,
                amountOff: coupon.amount_off,
                currency: coupon.currency,
                duration: coupon.duration,
                durationInMonths: coupon.duration_in_months,
                name: coupon.name || `${coupon.percent_off}% reducere`,
                metadata: coupon.metadata,
            });
        } catch (error: any) {
            if (error.code === 'resource_missing') {
                return NextResponse.json({ error: 'Cod promoțional invalid' }, { status: 400 });
            }
            throw error;
        }
    } catch (error: any) {
        logger.error('Failed to validate coupon', {
            error: error.message || String(error),
            code: error.code
        });
        
        return NextResponse.json(
            { error: 'Eroare la validarea codului promoțional' },
            { status: 500 }
        );
    }
}