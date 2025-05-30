export interface CouponInfo {
    id: string;
    name?: string | null;
    percentOff?: number | null;
    amountOff?: number | null;
    currency?: string | null;
    duration?: string;
    durationInMonths?: number | null;
    valid?: boolean;
}


export interface DiscountInfo {
    couponId: string;
    couponName?: string | null;
    percentOff?: number | null;
    amountOff?: number | null;
    currency?: string | null;
    originalPrice: number;
    discountedPrice: number;
    appliedCoupons: CouponInfo[];
    totalPercentOff: number;
    totalAmountOff: number;
    totalSavings: number;
}


export interface StripeDiscountData {
    id: string;
    coupon: {
        id: string;
        name?: string | null;
        percent_off?: number | null;
        amount_off?: number | null;
        currency?: string | null;
        duration?: string;
        duration_in_months?: number | null;
        valid?: boolean;
    };
    start: number;
    end?: number | null;
}