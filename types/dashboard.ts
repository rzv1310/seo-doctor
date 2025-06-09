import { PaymentMethod } from './payment-method';
import { Invoice } from './invoice';
// Orders table removed - using invoices instead
import { Subscription } from './subscription';


export interface SidebarItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    divider?: boolean;
    adminOnly?: boolean;
}


export interface DashboardData {
    paymentMethods: PaymentMethod[];
    invoices: Invoice[];
    subscriptions: Subscription[];
    isLoading: {
        paymentMethods: boolean;
        invoices: boolean;
        subscriptions: boolean;
    };
    error: {
        paymentMethods: string | null;
        invoices: string | null;
        subscriptions: string | null;
    };
    lastFetched: {
        paymentMethods: number | null;
        invoices: number | null;
        subscriptions: number | null;
    };
}


export interface DashboardContextType extends DashboardData {
    fetchPaymentMethods: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
    fetchInvoices: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
    fetchSubscriptions: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
    refreshAll: () => Promise<void>;
}