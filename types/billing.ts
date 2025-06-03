export interface BillingDetails {
    billingName?: string | null;
    billingCompany?: string | null;
    billingVat?: string | null;
    billingRegistrationNumber?: string | null;
    billingAddress?: string | null;
    billingPhone?: string | null;
}


export interface ParsedAddress {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    state?: string;
    country: string;
}


export interface StripeCustomerUpdateData {
    name?: string;
    address?: ParsedAddress;
    phone?: string;
    tax_exempt?: 'none' | 'exempt' | 'reverse';
}