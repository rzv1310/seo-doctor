import Stripe from 'stripe';
import stripe from './stripe-server';
import { logger } from './logger';
import { CouponInfo, DiscountInfo, StripeDiscountData } from '@/types/discount';
import { convertRONtoEUR } from './currency-utils';



// Calculate discounted price from original price and coupons
export function calculateDiscountedPrice(
    originalPrice: number, 
    discounts: StripeDiscountData[]
): DiscountInfo {
    if (!originalPrice || originalPrice <= 0) {
        throw new Error('Original price must be greater than 0');
    }

    if (!discounts || discounts.length === 0) {
        return {
            couponId: '',
            originalPrice,
            discountedPrice: originalPrice,
            appliedCoupons: [],
            totalPercentOff: 0,
            totalAmountOff: 0,
            totalSavings: 0
        };
    }

    let discountedPrice = originalPrice;
    let totalPercentOff = 0;
    let totalAmountOff = 0;
    const appliedCoupons: CouponInfo[] = [];

    // Apply discounts sequentially
    for (const discount of discounts) {
        const coupon = discount.coupon;
        
        if (!coupon || !coupon.valid) {
            logger.warn('Invalid or expired coupon found', { couponId: coupon?.id });
            continue;
        }

        const priceBeforeDiscount = discountedPrice;

        if (coupon.percent_off && coupon.percent_off > 0) {
            // Apply percentage discount
            const discountAmount = discountedPrice * (coupon.percent_off / 100);
            discountedPrice = Math.max(0, discountedPrice - discountAmount);
            totalPercentOff += coupon.percent_off;
        } else if (coupon.amount_off && coupon.amount_off > 0) {
            // Apply fixed amount discount (convert from cents to euros)
            const amountOffEur = coupon.amount_off / 100;
            discountedPrice = Math.max(0, discountedPrice - amountOffEur);
            totalAmountOff += amountOffEur;
        }

        // Record applied coupon
        appliedCoupons.push({
            id: coupon.id,
            name: coupon.name,
            percentOff: coupon.percent_off,
            amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
            currency: coupon.currency,
            duration: coupon.duration,
            durationInMonths: coupon.duration_in_months,
            valid: coupon.valid
        });

        logger.debug('Applied discount', {
            couponId: coupon.id,
            priceBeforeDiscount,
            priceAfterDiscount: discountedPrice,
            discountType: coupon.percent_off ? 'percentage' : 'fixed_amount'
        });
    }

    // Round to 2 decimal places to avoid floating point issues
    discountedPrice = Math.round(discountedPrice * 100) / 100;
    const totalSavings = Math.round((originalPrice - discountedPrice) * 100) / 100;

    const primaryCoupon = appliedCoupons[0];

    return {
        couponId: primaryCoupon?.id || '',
        couponName: primaryCoupon?.name,
        percentOff: primaryCoupon?.percentOff,
        amountOff: primaryCoupon?.amountOff,
        currency: primaryCoupon?.currency,
        originalPrice,
        discountedPrice,
        appliedCoupons,
        totalPercentOff: Math.round(totalPercentOff * 100) / 100,
        totalAmountOff: Math.round(totalAmountOff * 100) / 100,
        totalSavings
    };
}

// Fetch discount information from Stripe subscription
export async function fetchSubscriptionDiscounts(
    stripeSubscriptionId: string
): Promise<DiscountInfo | null> {
    try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
            stripeSubscriptionId,
            { expand: ['discounts'] }
        );

        if (!stripeSubscription.discounts || stripeSubscription.discounts.length === 0) {
            return null;
        }

        const originalPrice = stripeSubscription.items.data[0]?.price?.unit_amount;
        if (!originalPrice) {
            logger.warn('No price found for subscription', { stripeSubscriptionId });
            return null;
        }

        // Convert price to EUR for display if it's in RON
        const currency = stripeSubscription.items.data[0]?.price?.currency || 'eur';
        const originalPriceInSmallestUnit = originalPrice;
        const originalPriceForCalculation = currency === 'ron' 
            ? convertRONtoEUR(originalPriceInSmallestUnit) / 100 // Convert RON to EUR
            : originalPriceInSmallestUnit / 100; // Already in EUR or other currency
            
        const discounts = stripeSubscription.discounts
            .filter((discount): discount is Stripe.Discount => 
                typeof discount === 'object' && discount !== null
            )
            .map((discount): StripeDiscountData => ({
                id: discount.id,
                coupon: {
                    id: discount.coupon.id,
                    name: discount.coupon.name,
                    percent_off: discount.coupon.percent_off,
                    amount_off: discount.coupon.amount_off,
                    currency: discount.coupon.currency,
                    duration: discount.coupon.duration,
                    duration_in_months: discount.coupon.duration_in_months,
                    valid: discount.coupon.valid
                },
                start: discount.start,
                end: discount.end
            }));

        return calculateDiscountedPrice(originalPriceForCalculation, discounts);
    } catch (error) {
        logger.error('Failed to fetch subscription discounts', {
            error: error instanceof Error ? error.message : String(error),
            stripeSubscriptionId
        });
        throw error;
    }
}

// Format discount for display
export function formatDiscountDisplay(discount: DiscountInfo): {
    primaryCouponText: string;
    savingsText: string;
    badgeText: string;
} {
    const primaryCoupon = discount.appliedCoupons[0];
    
    return {
        primaryCouponText: primaryCoupon?.name || primaryCoupon?.id || 'Unknown Coupon',
        savingsText: new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'EUR'
        }).format(discount.totalSavings),
        badgeText: primaryCoupon?.percentOff 
            ? `-${primaryCoupon.percentOff}%`
            : primaryCoupon?.amountOff 
                ? `-${new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'EUR' }).format(primaryCoupon.amountOff)}`
                : 'Discount'
    };
}

// Format price with optional discount display
export function formatPriceWithDiscount(
    originalPrice: number,
    discountInfo?: DiscountInfo | null,
    currency: string = 'EUR'
): {
    originalPriceFormatted: string;
    discountedPriceFormatted: string;
    hasDiscount: boolean;
    savingsFormatted: string;
} {
    const formatter = new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: currency.toUpperCase()
    });

    const hasDiscount = discountInfo && discountInfo.discountedPrice < discountInfo.originalPrice;

    return {
        originalPriceFormatted: formatter.format(originalPrice),
        discountedPriceFormatted: hasDiscount 
            ? formatter.format(discountInfo.discountedPrice)
            : formatter.format(originalPrice),
        hasDiscount: !!hasDiscount,
        savingsFormatted: hasDiscount 
            ? formatter.format(discountInfo.totalSavings)
            : formatter.format(0)
    };
}

// Validate coupon code format
export function validateCouponCode(couponCode: string): { isValid: boolean; error?: string } {
    if (!couponCode || typeof couponCode !== 'string') {
        return { isValid: false, error: 'Coupon code is required' };
    }

    const trimmed = couponCode.trim().toUpperCase();
    
    if (trimmed.length < 2 || trimmed.length > 50) {
        return { isValid: false, error: 'Coupon code must be between 2 and 50 characters' };
    }

    if (!/^[A-Z0-9\-_]+$/.test(trimmed)) {
        return { isValid: false, error: 'Coupon code can only contain letters, numbers, hyphens, and underscores' };
    }

    return { isValid: true };
}