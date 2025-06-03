import { DiscountInfo } from './discount';


export type SubscriptionStatus = 'active' | 'trial' | 'inactive' | 'cancelled' | 'paused' | 'expired' | 'pending_payment';
export type PlanType = 'monthly' | 'yearly' | 'custom';


export interface SubscriptionMetadata {
    planType?: PlanType;
    quantity?: number;
    couponCode?: string | null;
    cancelReason?: string;
    pauseReason?: string;
    pausedAt?: string;
    pauseUntil?: string;
    notes?: string;
    [key: string]: any; // Allow for additional custom metadata
}


export type Subscription = {
    id: string;
    serviceId: string;
    status: SubscriptionStatus;
    startDate: string;
    endDate?: string;
    trialEndDate?: string;
    renewalDate?: string;
    cancelledAt?: string;
    price: number;
    usage?: number;
    stripeSubscriptionId?: string | null;
    metadata?: string; // JSON string of SubscriptionMetadata
    createdAt: string;
    updatedAt: string;
    // From joined service
    service?: {
        id: string;
        name: string;
        description: string;
        price: number;
    };
    // Parsed metadata (added for convenience)
    parsedMetadata?: SubscriptionMetadata;
    // Discount information from Stripe
    discountInfo?: DiscountInfo | null;
};


export interface SubscribeOptions {
    planType?: PlanType;
    trialPeriod?: number;
    quantity?: number;
    couponCode?: string;
    metadata?: Record<string, any>;
}


export interface UpdateSubscriptionOptions {
    status?: SubscriptionStatus;
    cancelReason?: string;
    renewalDate?: string;
    planType?: PlanType;
    quantity?: number;
    pauseUntil?: string;
    usage?: number;
    notes?: string;
    additionalMetadata?: Record<string, any>;
}