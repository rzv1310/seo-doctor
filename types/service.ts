export type Service = {
    id: number;
    name: string;
    description: string;
    price: string;
    priceValue: number; // Price in RON bani for Stripe
    priceValueEUR: number; // Price in EUR cents for calculations
    status?: string;
    renewalDate?: string;
    usage?: number;
    features: string[];
    // Landing page specific fields
    tag?: string;
    tagClass?: string;
    period?: string;
    details?: string;
    buttonText?: string;
    buttonTextUnauth?: string;
    url?: string;
    unauthUrl?: string;
    // Additional fields for dashboard
    offers?: {
        text: string;
        bgClass: string;
        textClass: string;
    }[];
};