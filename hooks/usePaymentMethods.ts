'use client';

import { useState, useEffect } from 'react';

import { useLogger } from '@/lib/client-logger';



interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
    funding: string;
    country: string;
}

interface PaymentMethodsResponse {
    cards: PaymentMethod[];
    defaultCardId: string | null;
}

export function usePaymentMethods() {
    const logger = useLogger('usePaymentMethods');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [defaultCardId, setDefaultCardId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPaymentMethods = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/payment-methods', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment methods');
            }

            const data: PaymentMethodsResponse = await response.json();
            setPaymentMethods(data.cards);
            setDefaultCardId(data.defaultCardId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment methods';
            setError(errorMessage);
            logger.error('Failed to fetch payment methods', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const hasValidPaymentMethod = paymentMethods.length > 0;

    return {
        paymentMethods,
        defaultCardId,
        isLoading,
        error,
        hasValidPaymentMethod,
        refresh: fetchPaymentMethods,
    };
}