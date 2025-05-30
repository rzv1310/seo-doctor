import { useState, useEffect, useCallback } from 'react';

import { useLogger } from '@/lib/client-logger';
import type { 
    SubscriptionStatus, 
    PlanType, 
    SubscriptionMetadata, 
    Subscription, 
    SubscribeOptions, 
    UpdateSubscriptionOptions 
} from '@/types/subscription';

export function useSubscriptions(isAuthenticated: boolean = true) {
    const logger = useLogger('useSubscriptions');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Parse metadata for a subscription
    const parseSubscriptionMetadata = (subscription: Subscription): Subscription => {
        if (!subscription.metadata) {
            return {
                ...subscription,
                parsedMetadata: {},
            };
        }

        try {
            const parsedMetadata = JSON.parse(subscription.metadata) as SubscriptionMetadata;
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
    };

    // Fetch all subscriptions for the current user
    const fetchSubscriptions = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/subscriptions');

            if (!response.ok) {
                throw new Error('Failed to fetch subscriptions');
            }

            const data = await response.json();

            // Parse metadata for each subscription
            const processedSubscriptions = (data.subscriptions || []).map(parseSubscriptionMetadata);
            setSubscriptions(processedSubscriptions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            logger.error('Error fetching subscriptions', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Subscribe to a service
    const subscribeToService = useCallback(async (
        serviceId: string,
        options: SubscribeOptions = {}
    ) => {
        if (!isAuthenticated) {
            setError('You must be logged in to subscribe');
            return null;
        }

        const {
            planType = 'monthly',
            trialPeriod = 0,
            quantity = 1,
            couponCode = null,
            metadata = {}
        } = options;

        try {
            const response = await fetch(`/api/subscriptions/${serviceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planType,
                    trialPeriod,
                    quantity,
                    couponCode,
                    metadata
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to subscribe to service');
            }

            const data = await response.json();

            // Refresh subscriptions list
            await fetchSubscriptions();

            return {
                subscription: parseSubscriptionMetadata(data.subscription),
                orderId: data.orderId,
                invoiceId: data.invoiceId,
                message: data.message,
                planDetails: data.planDetails,
                service: data.service
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            logger.error('Error subscribing to service', err, { serviceId });
            return null;
        }
    }, [isAuthenticated, fetchSubscriptions]);

    // Update a subscription
    const updateSubscription = useCallback(async (
        subscriptionId: string,
        options: UpdateSubscriptionOptions
    ) => {
        if (!isAuthenticated) {
            setError('You must be logged in to update a subscription');
            return null;
        }

        try {
            const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update subscription');
            }

            const data = await response.json();

            // Refresh subscriptions list
            await fetchSubscriptions();

            return {
                subscription: parseSubscriptionMetadata(data.subscription),
                message: data.message,
                updatedFields: data.updatedFields
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            logger.error('Error updating subscription', err, { subscriptionId });
            return null;
        }
    }, [isAuthenticated, fetchSubscriptions]);

    // Cancel a subscription with Stripe
    const cancelSubscription = useCallback(async (subscriptionId: string, cancelReason?: string) => {
        if (!isAuthenticated) {
            setError('You must be logged in to cancel a subscription');
            return false;
        }

        try {
            const response = await fetch('/api/subscriptions/cancel-stripe-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscriptionId,
                    reason: cancelReason,
                    immediate: false // Cancel at end of period
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel subscription');
            }

            const data = await response.json();

            // Refresh subscriptions list
            await fetchSubscriptions();

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            logger.error('Error cancelling subscription', err, { subscriptionId });
            return false;
        }
    }, [isAuthenticated, fetchSubscriptions]);

    // Pause a subscription (convenience method)
    const pauseSubscription = useCallback(async (
        subscriptionId: string,
        pauseUntil: string,
        pauseReason?: string
    ) => {
        if (!isAuthenticated) {
            setError('You must be logged in to pause a subscription');
            return false;
        }

        try {
            const result = await updateSubscription(subscriptionId, {
                status: 'paused',
                pauseUntil,
                additionalMetadata: { pauseReason }
            });

            return !!result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            logger.error('Error pausing subscription', err, { subscriptionId, pauseUntil });
            return false;
        }
    }, [isAuthenticated, updateSubscription]);

    // Check if user is subscribed to a specific service
    const isSubscribed = useCallback((serviceId: string): boolean => {
        return subscriptions.some(
            sub => sub.serviceId === serviceId &&
                (sub.status === 'active' || sub.status === 'trial')
        );
    }, [subscriptions]);

    // Get subscription for a specific service
    const getSubscription = useCallback((serviceId: string): Subscription | null => {
        return subscriptions.find(sub => sub.serviceId === serviceId) || null;
    }, [subscriptions]);

    // Load subscriptions on component mount or when authentication status changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchSubscriptions();
        } else {
            setSubscriptions([]);
            setIsLoading(false);
        }
    }, [isAuthenticated, fetchSubscriptions]);

    // Helper to get active subscription count
    const getActiveSubscriptionCount = useCallback((): number => {
        return subscriptions.filter(sub =>
            sub.status === 'active' || sub.status === 'trial'
        ).length;
    }, [subscriptions]);

    // Helper to calculate total monthly spend
    const calculateTotalMonthlySpend = useCallback((): number => {
        return subscriptions
            .filter(sub => sub.status === 'active' || sub.status === 'trial')
            .reduce((total, sub) => {
                const parsedMeta = sub.parsedMetadata || {};
                // For yearly subscriptions, divide by 12 to get monthly equivalent
                if (parsedMeta.planType === 'yearly') {
                    return total + (sub.price / 12);
                }
                return total + sub.price;
            }, 0);
    }, [subscriptions]);

    return {
        // State
        subscriptions,
        isLoading,
        error,

        // Core methods
        fetchSubscriptions,
        subscribeToService,
        updateSubscription,
        cancelSubscription,
        pauseSubscription,

        // Helper methods
        isSubscribed,
        getSubscription,
        getActiveSubscriptionCount,
        calculateTotalMonthlySpend,

        // Utility
        parseSubscriptionMetadata,
    };
}
