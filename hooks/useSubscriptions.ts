import { useState, useEffect, useCallback } from 'react';
import { getAuthUser } from '@/utils/auth';

// Define subscription types
export type SubscriptionStatus = 'active' | 'trial' | 'inactive' | 'cancelled';

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
  // From joined service
  service?: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
};

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status
  useEffect(() => {
    const user = getAuthUser();
    setIsAuthenticated(!!user);
  }, []);

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
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Subscribe to a service
  const subscribeToService = useCallback(async (serviceId: string, planType: 'monthly' | 'yearly' = 'monthly') => {
    if (!isAuthenticated) {
      setError('You must be logged in to subscribe');
      return null;
    }
    
    try {
      const response = await fetch(`/api/subscriptions/${serviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to subscribe to service');
      }
      
      const data = await response.json();
      
      // Refresh subscriptions list
      await fetchSubscriptions();
      
      return data.subscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error subscribing to service:', err);
      return null;
    }
  }, [isAuthenticated, fetchSubscriptions]);

  // Cancel a subscription
  const cancelSubscription = useCallback(async (subscriptionId: string, cancelReason?: string) => {
    if (!isAuthenticated) {
      setError('You must be logged in to cancel a subscription');
      return false;
    }
    
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancelReason
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
      
      // Refresh subscriptions list
      await fetchSubscriptions();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error cancelling subscription:', err);
      return false;
    }
  }, [isAuthenticated, fetchSubscriptions]);

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

  return {
    subscriptions,
    isLoading,
    error,
    isAuthenticated,
    fetchSubscriptions,
    subscribeToService,
    cancelSubscription,
    isSubscribed,
    getSubscription,
  };
}