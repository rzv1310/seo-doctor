import { useState, useEffect } from 'react';
import { useLogger } from '@/lib/client-logger';
import type { Subscription } from '@/types/subscription';



export function usePendingPayments() {
    const logger = useLogger('usePendingPayments');
    const [pendingSubscriptions, setPendingSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkPendingPayments = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // First run cleanup to ensure database consistency
            try {
                await fetch('/api/subscriptions/cleanup-pending', {
                    method: 'POST'
                });
                logger.info('Cleanup completed before checking pending payments');
            } catch (cleanupError) {
                logger.warn('Cleanup failed, but continuing with pending payments check', cleanupError);
            }

            const response = await fetch('/api/subscriptions/pending-payments');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to check pending payments');
            }

            const data = await response.json();
            setPendingSubscriptions(data.pendingSubscriptions || []);
            
            logger.info('Pending payments checked', { 
                count: data.pendingSubscriptions?.length || 0 
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            logger.error('Failed to check pending payments', { error: errorMessage });
            setError(errorMessage);
            setPendingSubscriptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkPendingPayments();
    }, []);

    return {
        pendingSubscriptions,
        isLoading,
        error,
        refresh: checkPendingPayments,
        hasPendingPayments: pendingSubscriptions.length > 0
    };
}