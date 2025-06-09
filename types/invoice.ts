export interface Invoice {
    id: string;
    userId: string;
    subscriptionId: string | null;
    stripeInvoiceId: string;
    stripeCustomerId: string;
    
    // Invoice details
    number: string | null;
    status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    currency: string;
    amount: number; // For backward compatibility
    amountTotal: number;
    amountPaid: number;
    amountRemaining: number;
    
    // Service details
    serviceName: string | null;
    serviceId: string | null;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
    dueDate: string | null;
    paidAt: string | null;
    
    // URLs
    hostedInvoiceUrl?: string | null;
    invoicePdf?: string | null;
    
    // Additional fields
    paymentIntentId?: string | null;
    metadata?: Record<string, any>;
}


export interface InvoiceDetail extends Invoice {
    billingAddress: {
        name: string;
        email: string;
        address: string;
        city: string;
        country: string;
        postalCode: string;
        company?: string;
    };
    items: {
        name: string;
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    discounts?: {
        couponId?: string;
        couponName?: string;
        percentOff?: number;
        amountOff?: number;
        currency?: string;
    }[];
    // Additional fields from Stripe
    subtotal?: number;
    tax?: number;
    total?: number;
    discountTotal?: number;
}


export interface PaginationResult {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}