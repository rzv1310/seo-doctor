'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

import { Invoice } from '@/hooks/useInvoices';
import { PaymentMethod } from '@/types/payment-method';
import { Order } from '@/types/order';
import { Subscription } from '@/hooks/useSubscriptions';
import { useLogger } from '@/lib/client-logger';



interface DashboardData {
    paymentMethods: PaymentMethod[];
    invoices: Invoice[];
    orders: Order[];
    subscriptions: Subscription[];
    isLoading: {
        paymentMethods: boolean;
        invoices: boolean;
        orders: boolean;
        subscriptions: boolean;
    };
    error: {
        paymentMethods: string | null;
        invoices: string | null;
        orders: string | null;
        subscriptions: string | null;
    };
    lastFetched: {
        paymentMethods: number | null;
        invoices: number | null;
        orders: number | null;
        subscriptions: number | null;
    };
}

interface DashboardContextType extends DashboardData {
    fetchPaymentMethods: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
    fetchInvoices: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
    fetchOrders: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
    fetchSubscriptions: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
    refreshAll: () => Promise<void>;
}

const initialState: DashboardData = {
    paymentMethods: [],
    invoices: [],
    orders: [],
    subscriptions: [],
    isLoading: {
        paymentMethods: false,
        invoices: false,
        orders: false,
        subscriptions: false,
    },
    error: {
        paymentMethods: null,
        invoices: null,
        orders: null,
        subscriptions: null,
    },
    lastFetched: {
        paymentMethods: null,
        invoices: null,
        orders: null,
        subscriptions: null,
    },
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const logger = useLogger('DashboardProvider');
    const [data, setData] = useState<DashboardData>(initialState);

    const fetchPaymentMethods = useCallback(async (forceRefresh = false, silent = false) => {
        // If data exists and not forcing refresh, return cached data
        if (!forceRefresh && data.paymentMethods.length > 0 && data.lastFetched.paymentMethods) {
            return;
        }

        // If already loading, skip
        if (data.isLoading.paymentMethods) return;

        // Only show loading spinner if not a silent background refresh
        if (!silent) {
            setData(prev => ({
                ...prev,
                isLoading: { ...prev.isLoading, paymentMethods: true },
                error: { ...prev.error, paymentMethods: null },
            }));
        }

        try {
            const response = await fetch('/api/payment-methods', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch payment methods');

            const result = await response.json();
            const paymentMethods = result.cards || [];

            setData(prev => ({
                ...prev,
                paymentMethods,
                isLoading: { ...prev.isLoading, paymentMethods: false },
                lastFetched: { ...prev.lastFetched, paymentMethods: Date.now() },
            }));
        } catch (error) {
            // Only update loading state if we were showing a spinner
            if (!silent) {
                setData(prev => ({
                    ...prev,
                    isLoading: { ...prev.isLoading, paymentMethods: false },
                    error: { ...prev.error, paymentMethods: error instanceof Error ? error.message : 'Failed to fetch payment methods' },
                }));
            }
        }
    }, [data.paymentMethods.length, data.lastFetched.paymentMethods, data.isLoading.paymentMethods]);

    const fetchInvoices = useCallback(async (forceRefresh = false, silent = false) => {
        // If data exists and not forcing refresh, return cached data
        if (!forceRefresh && data.invoices.length > 0 && data.lastFetched.invoices) {
            return;
        }

        // If already loading, skip
        if (data.isLoading.invoices) return;

        // Only show loading spinner if not a silent background refresh
        if (!silent) {
            setData(prev => ({
                ...prev,
                isLoading: { ...prev.isLoading, invoices: true },
                error: { ...prev.error, invoices: null },
            }));
        }

        try {
            const response = await fetch('/api/invoices', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch invoices');

            const result = await response.json();
            const invoices = result.invoices || [];

            setData(prev => ({
                ...prev,
                invoices,
                isLoading: { ...prev.isLoading, invoices: false },
                lastFetched: { ...prev.lastFetched, invoices: Date.now() },
            }));
        } catch (error) {
            // Only update loading state if we were showing a spinner
            if (!silent) {
                setData(prev => ({
                    ...prev,
                    isLoading: { ...prev.isLoading, invoices: false },
                    error: { ...prev.error, invoices: error instanceof Error ? error.message : 'Failed to fetch invoices' },
                }));
            }
        }
    }, [data.invoices.length, data.lastFetched.invoices, data.isLoading.invoices]);

    const fetchOrders = useCallback(async (forceRefresh = false, silent = false) => {
        // If data exists and not forcing refresh, return cached data
        if (!forceRefresh && data.orders.length > 0 && data.lastFetched.orders) {
            return;
        }

        // If already loading, skip
        if (data.isLoading.orders) return;

        // Only show loading spinner if not a silent background refresh
        if (!silent) {
            setData(prev => ({
                ...prev,
                isLoading: { ...prev.isLoading, orders: true },
                error: { ...prev.error, orders: null },
            }));
        }

        try {
            const response = await fetch('/api/orders', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch orders');

            const result = await response.json();
            const orders = result.orders || [];

            setData(prev => ({
                ...prev,
                orders,
                isLoading: { ...prev.isLoading, orders: false },
                lastFetched: { ...prev.lastFetched, orders: Date.now() },
            }));
        } catch (error) {
            // Only update loading state if we were showing a spinner
            if (!silent) {
                setData(prev => ({
                    ...prev,
                    isLoading: { ...prev.isLoading, orders: false },
                    error: { ...prev.error, orders: error instanceof Error ? error.message : 'Failed to fetch orders' },
                }));
            }
        }
    }, [data.orders.length, data.lastFetched.orders, data.isLoading.orders]);

    const fetchSubscriptions = useCallback(async (forceRefresh = false, silent = false) => {
        // If data exists and not forcing refresh, return cached data
        if (!forceRefresh && data.subscriptions.length > 0 && data.lastFetched.subscriptions) {
            return;
        }

        // If already loading, skip
        if (data.isLoading.subscriptions) return;

        // Only show loading spinner if not a silent background refresh
        if (!silent) {
            setData(prev => ({
                ...prev,
                isLoading: { ...prev.isLoading, subscriptions: true },
                error: { ...prev.error, subscriptions: null },
            }));
        }

        try {
            const response = await fetch('/api/subscriptions', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch subscriptions');

            const result = await response.json();
            const rawSubscriptions = result.subscriptions || [];
            
            // Parse metadata for each subscription
            const subscriptions = rawSubscriptions.map((subscription: Subscription) => {
                if (!subscription.metadata) {
                    return {
                        ...subscription,
                        parsedMetadata: {},
                    };
                }

                try {
                    const parsedMetadata = JSON.parse(subscription.metadata);
                    return {
                        ...subscription,
                        parsedMetadata,
                    };
                } catch (e) {
                    logger.error('Error parsing subscription metadata', e, { subscriptionId: subscription.id });
                    return {
                        ...subscription,
                        parsedMetadata: {},
                    };
                }
            });

            setData(prev => ({
                ...prev,
                subscriptions,
                isLoading: { ...prev.isLoading, subscriptions: false },
                lastFetched: { ...prev.lastFetched, subscriptions: Date.now() },
            }));
        } catch (error) {
            // Only update loading state if we were showing a spinner
            if (!silent) {
                setData(prev => ({
                    ...prev,
                    isLoading: { ...prev.isLoading, subscriptions: false },
                    error: { ...prev.error, subscriptions: error instanceof Error ? error.message : 'Failed to fetch subscriptions' },
                }));
            }
        }
    }, [data.subscriptions.length, data.lastFetched.subscriptions, data.isLoading.subscriptions]);

    const refreshAll = useCallback(async () => {
        await Promise.all([
            fetchPaymentMethods(true),
            fetchInvoices(true),
            fetchOrders(true),
            fetchSubscriptions(true),
        ]);
    }, [fetchPaymentMethods, fetchInvoices, fetchOrders, fetchSubscriptions]);

    return (
        <DashboardContext.Provider
            value={{
                ...data,
                fetchPaymentMethods,
                fetchInvoices,
                fetchOrders,
                fetchSubscriptions,
                refreshAll,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within DashboardProvider');
    }
    return context;
}

// Convenience hooks for specific data types
export function useDashboardPaymentMethods() {
    const { paymentMethods, isLoading, error, fetchPaymentMethods, lastFetched } = useDashboard();

    useEffect(() => {
        // Initial fetch if no data
        if (!lastFetched.paymentMethods) {
            fetchPaymentMethods();
        }
    }, [fetchPaymentMethods, lastFetched.paymentMethods]);

    // Background refresh after mount if data exists - silent refresh
    useEffect(() => {
        if (lastFetched.paymentMethods) {
            fetchPaymentMethods(true, true); // forceRefresh=true, silent=true
        }
    }, []);

    return {
        paymentMethods,
        isLoading: isLoading.paymentMethods,
        error: error.paymentMethods,
        refresh: () => fetchPaymentMethods(true, false), // Manual refresh shows spinner
    };
}

export function useDashboardInvoices() {
    const { invoices, isLoading, error, fetchInvoices, lastFetched } = useDashboard();

    useEffect(() => {
        // Initial fetch if no data
        if (!lastFetched.invoices) {
            fetchInvoices();
        }
    }, [fetchInvoices, lastFetched.invoices]);

    // Background refresh after mount if data exists - silent refresh
    useEffect(() => {
        if (lastFetched.invoices) {
            fetchInvoices(true, true); // forceRefresh=true, silent=true
        }
    }, []);

    return {
        invoices,
        isLoading: isLoading.invoices,
        error: error.invoices,
        refresh: () => fetchInvoices(true, false), // Manual refresh shows spinner
    };
}

export function useDashboardOrders() {
    const { orders, isLoading, error, fetchOrders, lastFetched } = useDashboard();

    useEffect(() => {
        // Initial fetch if no data
        if (!lastFetched.orders) {
            fetchOrders();
        }
    }, [fetchOrders, lastFetched.orders]);

    // Background refresh after mount if data exists - silent refresh
    useEffect(() => {
        if (lastFetched.orders) {
            fetchOrders(true, true); // forceRefresh=true, silent=true
        }
    }, []);

    return {
        orders,
        isLoading: isLoading.orders,
        error: error.orders,
        refresh: () => fetchOrders(true, false), // Manual refresh shows spinner
    };
}

export function useDashboardSubscriptions() {
    const { subscriptions, isLoading, error, fetchSubscriptions, lastFetched } = useDashboard();

    useEffect(() => {
        // Initial fetch if no data
        if (!lastFetched.subscriptions) {
            fetchSubscriptions();
        }
    }, [fetchSubscriptions, lastFetched.subscriptions]);

    // Background refresh after mount if data exists - silent refresh
    useEffect(() => {
        if (lastFetched.subscriptions) {
            fetchSubscriptions(true, true); // forceRefresh=true, silent=true
        }
    }, []);

    return {
        subscriptions,
        isLoading: isLoading.subscriptions,
        error: error.subscriptions,
        refresh: () => fetchSubscriptions(true, false), // Manual refresh shows spinner
    };
}
