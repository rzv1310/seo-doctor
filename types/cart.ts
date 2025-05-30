export type CartService = {
    id: number;
    name: string;
    description: string;
    price: string; // Price in display format "$XX.XX"
    priceValue: number; // Price in cents for calculations
    features: string[];
};


export type CouponData = {
    valid: boolean;
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