export type CartService = {
    id: number;
    name: string;
    description: string;
    price: string; // Price in display format "X.XXX €"
    priceValue: number; // Price in RON bani for Stripe
    priceValueEUR: number; // Price in EUR cents for calculations
    features: string[];
    period?: string;
    isPendingPayment?: boolean; // True if this item represents a pending payment
    pendingSubscriptionId?: string; // ID of the pending subscription
};


export type CouponData = {
    valid: boolean;
    promotionCodeId?: string;
    couponId?: string;
    percentOff?: number | null;
    amountOff?: number | null;
    currency?: string | null;
    duration?: string;
    durationInMonths?: number | null;
    name?: string | null;
    metadata?: Record<string, string>;
};


export type CartContextType = {
    items: CartService[];
    addItem: (service: CartService) => void;
    removeItem: (serviceId: number) => void;
    clearCart: () => void;
    isInCart: (serviceId: number) => boolean;
    itemCount: number;
    totalPrice: number;
    formattedTotalPrice: string;
    couponCode: string;
    setCouponCode: (code: string) => void;
    couponData: CouponData | null;
    setCouponData: (data: CouponData | null) => void;
    discountAmount: number;
    formattedDiscountAmount: string;
    finalPrice: number;
    formattedFinalPrice: string;
};
