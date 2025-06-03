'use client';

import { useState } from 'react';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import type { CartService } from '@/types/cart';
import { services as serviceData } from '@/data/services';
import type { Service } from '@/types/service';
import { useDashboardSubscriptions } from '@/context/DashboardContext';
import { useLogger } from '@/lib/client-logger';
import type { Subscription } from '@/types/subscription';
import { usePendingPayments } from '@/hooks/usePendingPayments';

import SubscriptionCancelModal from '@/components/SubscriptionCancelModal';
import { Card, Grid, ActionButton, Spinner, Alert } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import ServiceCard from '@/components/dashboard/services/ServiceCard';



export default function ServicesPage() {
    const logger = useLogger('ServicesPage');
    const { addItem, isInCart, removeItem, items } = useCart();
    const { isAuthenticated } = useAuth();

    const {
        subscriptions,
        isLoading: subscriptionsLoading,
        error: subscriptionsError,
        refresh: refreshSubscriptions
    } = useDashboardSubscriptions();
    
    const {
        pendingSubscriptions,
        hasPendingPayments,
        refresh: refreshPendingPayments
    } = usePendingPayments();

    // Helper functions for subscription management
    const isSubscribed = (serviceId: string) => {
        return (subscriptions || []).some(sub =>
            sub.serviceId?.toString() === serviceId &&
            (sub.status === 'active' || sub.status === 'trial')
        );
    };

    const getSubscription = (serviceId: string) => {
        return (subscriptions || []).find(sub =>
            sub.serviceId?.toString() === serviceId
        );
    };

    const subscribeToService = async (serviceId: string) => {
        // Redirect to service detail page for subscription
        window.location.href = `/dashboard/services/${serviceId}`;
    };

    const cancelSubscription = async (subscriptionId: string, reason?: string) => {
        const response = await fetch('/api/subscriptions/cancel-stripe-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscriptionId,
                reason,
                immediate: false,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cancel subscription');
        }

        return response.json();
    };

    // State for filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubscribing, setIsSubscribing] = useState<number | null>(null);
    const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);

    // Get services with subscription data
    const servicesWithStatus = serviceData.map(service => {
        // Get the user's subscription to this service, if any
        const subscription = getSubscription(service.id.toString());

        // Check if subscription is pending cancellation
        const status = subscription?.status || 'available';
        const metadata = subscription?.parsedMetadata || {};
        const isPendingCancellation = subscription && metadata.cancelAtPeriodEnd === true;

        // Use subscription data if available
        return {
            ...service,
            status,
            renewalDate: subscription?.renewalDate,
            endDate: subscription?.endDate,
            usage: subscription?.usage !== undefined ? subscription.usage : service.usage,
            subscriptionId: subscription?.id,
            isPendingCancellation,
            cancelledAt: subscription?.cancelledAt
        };
    });

    // Filter services based on status and search term
    const filteredServices = servicesWithStatus.filter(service => {
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Handle adding an item to cart
    const handleAddToCart = (service: Service) => {
        const cartService: CartService = {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            priceValue: service.priceValue,
            features: service.features,
        };
        addItem(cartService);
    };

    // Handle removing an item from cart
    const handleRemoveFromCart = (serviceId: number) => {
        removeItem(serviceId);
    };

    // Handle toggle cart item
    const handleToggleCartItem = (service: Service & { status: string }) => {
        // Check if any service has pending payment
        if (hasPendingPayments) {
            alert('Ai o plată în așteptare. Te rugăm să finalizezi sau să anulezi plata existentă înainte de a adăuga alte servicii în coș.');
            return;
        }
        
        if (isInCart(service.id)) {
            handleRemoveFromCart(service.id);
        } else {
            handleAddToCart(service);
        }
    };

    // Handle subscribing to a service
    const handleSubscribe = async (serviceId: number) => {
        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            window.location.href = `/login?redirect=/dashboard/services`;
            return;
        }

        setIsSubscribing(serviceId);

        try {
            await subscribeToService(serviceId.toString());
        } catch (error) {
            logger.error('Failed to subscribe', error, { serviceId });
        } finally {
            setIsSubscribing(null);
        }
    };

    // Handle cancelling subscription modal
    const handleCancelSubscriptionClick = (subscription: Subscription) => {
        setSubscriptionToCancel(subscription);
    };

    // Handle renewing/reactivating subscription
    const handleRenewSubscription = async (serviceId: string) => {
        if (!isAuthenticated) {
            window.location.href = `/login?redirect=/dashboard/services`;
            return;
        }

        setIsSubscribing(parseInt(serviceId));

        try {
            // Check if this is a pending cancellation that we need to reactivate
            const service = servicesWithStatus.find(s => s.id.toString() === serviceId);
            const subscription = getSubscription(serviceId);
            
            if (service?.isPendingCancellation && subscription?.id) {
                // Reactivate pending cancellation by removing the cancel_at_period_end flag
                const response = await fetch('/api/subscriptions/cancel-stripe-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscriptionId: subscription.id,
                        reactivate: true
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to reactivate subscription');
                }

                logger.info('Subscription reactivated successfully', { serviceId });
            } else {
                // Create new subscription for cancelled service
                const response = await fetch('/api/subscriptions/create-stripe-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceId: parseInt(serviceId)
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to renew subscription');
                }

                const result = await response.json();
                
                if (result.requiresAction && result.clientSecret) {
                    // Handle 3D Secure or other payment confirmation
                    logger.info('Payment requires additional action', { serviceId });
                    // You might want to handle this with Stripe Elements
                    // For now, we'll just refresh to show the updated status
                }

                logger.info('Subscription renewed successfully', { serviceId });
            }

            // Refresh subscriptions to show updated status
            await refreshSubscriptions();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            logger.error('Failed to renew subscription', { 
                error: errorMessage, 
                serviceId,
                fullError: error 
            });
            // You might want to show a user-facing error message here
            alert(`Failed to renew subscription: ${errorMessage}`);
        } finally {
            setIsSubscribing(null);
        }
    };

    // Close cancel subscription modal
    const handleCloseModal = () => {
        setSubscriptionToCancel(null);
    };

    return (
        <>
            <DashboardPageLayout
                title="Servicii"
                subtitle="Gestionează serviciile tale și explorează ofertele disponibile"
            >
                {/* Pending Payments Alert */}
                {hasPendingPayments && (
                    <Alert type="warning" className="mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="font-medium">Ai {pendingSubscriptions.length} {pendingSubscriptions.length === 1 ? 'plată' : 'plăți'} în așteptare</p>
                                    <p className="text-sm mt-1">
                                        Te rugăm să finalizezi plățile în așteptare pentru a activa serviciile.
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {pendingSubscriptions.map((subscription) => {
                                            const service = serviceData.find(s => s.id.toString() === subscription.serviceId);
                                            
                                            return (
                                                <div key={subscription.id} className="flex items-center justify-between bg-amber-900/20 rounded p-2">
                                                    <div>
                                                        <span className="text-sm font-medium">
                                                            {service?.name || 'Serviciu necunoscut'}
                                                        </span>
                                                        <span className="text-xs text-amber-200 ml-2">
                                                            {new Intl.NumberFormat('ro-RO', {
                                                                style: 'currency',
                                                                currency: 'RON'
                                                            }).format(subscription.price / 100)}
                                                        </span>
                                                    </div>
                                                    <ActionButton
                                                        size="sm"
                                                        variant="warning"
                                                        onClick={() => {
                                                            window.location.href = `/dashboard/services/${subscription.serviceId}`;
                                                        }}
                                                    >
                                                        Finalizează
                                                    </ActionButton>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Alert>
                )}
                <Grid cols={2} gap="md" className="mb-6">
                    {filteredServices.map(service => {
                        const subscription = getSubscription(service.id.toString());

                        // Debug log for pending payment detection
                        if (subscription?.status === 'pending_payment') {
                            console.log(`Service ${service.name} has pending_payment subscription`, {
                                serviceStatus: service.status,
                                subscriptionStatus: subscription.status,
                                subscriptionId: subscription.id
                            });
                        }
                        
                        return (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                subscription={subscription}
                                isInCart={isInCart(service.id)}
                                isSubscribing={isSubscribing === service.id}
                                onToggleCart={() => handleToggleCartItem(service)}
                                onSubscribe={() => handleSubscribe(service.id)}
                                onCancelSubscription={handleCancelSubscriptionClick}
                                onRenewSubscription={handleRenewSubscription}
                            />
                        );
                    })}
                </Grid>

                {filteredServices.length === 0 && !subscriptionsLoading && (
                    <Card className="p-8 text-center">
                        <div className="text-xl font-semibold mb-2">Nu s-au găsit servicii</div>
                        <p className="text-text-primary mb-6">Ajustează criteriile de căutare sau filtrare.</p>
                        <ActionButton
                            onClick={() => setStatusFilter('available')}
                            size="md"
                            showArrow={false}
                        >
                            Explorează Servicii Disponibile
                        </ActionButton>
                    </Card>
                )}

                {subscriptionsLoading && (!subscriptions || subscriptions.length === 0) && (
                    <Card className="p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <Spinner size="lg" />
                        </div>
                        <div className="text-xl font-semibold mb-2">Încărcare servicii...</div>
                        <p className="text-text-primary">Se încarcă datele serviciilor și abonamentelor tale.</p>
                    </Card>
                )}

                {items.length > 0 && (
                    <div className="fixed bottom-8 right-8 z-10">
                        <ActionButton
                            href="/dashboard/checkout"
                            size="md"
                            animate
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Finalizează Comanda
                            <span className="inline-flex items-center justify-center bg-white text-primary rounded-full w-6 h-6 text-sm font-semibold ml-1">
                                {items.length}
                            </span>
                        </ActionButton>
                    </div>
                )}

                {/* Cancellation Modal */}
                {subscriptionToCancel && (
                    <SubscriptionCancelModal
                        subscription={subscriptionToCancel}
                        isOpen={!!subscriptionToCancel}
                        onClose={handleCloseModal}
                        onCancel={async (subscriptionId, reason) => {
                            const success = await cancelSubscription(subscriptionId, reason);
                            if (success) {
                                handleCloseModal();
                                // Refresh subscriptions to show updated status
                                await refreshSubscriptions();
                            }
                            return success;
                        }}
                    />
                )}
            </DashboardPageLayout>
        </>
    );
}
