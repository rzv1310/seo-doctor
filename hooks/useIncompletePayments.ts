import { useState, useEffect } from 'react';
import { useLogger } from '@/lib/client-logger';



export interface IncompletePayment {
    type: 'subscription' | 'invoice' | 'payment_intent';
    subscriptionId?: string;
    invoiceId?: string;
    paymentIntentId: string;
    paymentIntentStatus: string;
    clientSecret: string;
    amount: number;
    currency: string;
    created: string;
    metadata?: any;
}

export function useIncompletePayments() {
    const logger = useLogger('useIncompletePayments');
    const [incompletePayments, setIncompletePayments] = useState<IncompletePayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkIncompletePayments = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/subscriptions/check-incomplete-payments');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to check incomplete payments');
            }

            const data = await response.json();
            setIncompletePayments(data.incompletePayments || []);
            
            logger.info('Incomplete payments checked', { 
                count: data.incompletePayments?.length || 0 
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            logger.error('Failed to check incomplete payments', { error: errorMessage });
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkIncompletePayments();
    }, []);

    return {
        incompletePayments,
        isLoading,
        error,
        refresh: checkIncompletePayments,
        hasIncompletePayments: incompletePayments.length > 0
    };
}