export interface Invoice {
    id: string;
    userId: string;
    orderId: string | null;
    createdAt: string;
    dueDate: string | null;
    amount: number;
    status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'void';
    stripeInvoiceId: string | null;
    orderServiceId: string | null;
    serviceName: string | null;
    // Additional Stripe fields
    number?: string;
    currency?: string;
    hostedInvoiceUrl?: string | null;
    invoicePdf?: string | null;
    subscriptionId?: string | null;
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