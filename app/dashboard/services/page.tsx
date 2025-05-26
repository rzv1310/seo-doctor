'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import type { CartService } from '@/context/CartContext';
import { services as serviceData, type Service } from '@/data/services';
import { useDashboardSubscriptions } from '@/context/DashboardContext';
import type { Subscription } from '@/hooks/useSubscriptions';
import SubscriptionCancelModal from '@/components/SubscriptionCancelModal';
import { Card, Grid, ActionButton, Spinner } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import ServiceCard from '@/components/dashboard/services/ServiceCard';



export default function ServicesPage() {
    const { addItem, isInCart, removeItem, items } = useCart();
    const { isAuthenticated } = useAuth();

    const {
        subscriptions,
        isLoading: subscriptionsLoading,
        error: subscriptionsError
    } = useDashboardSubscriptions();

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
        // TODO: Implement subscription API call
        console.log('Subscribe to service:', serviceId);
        throw new Error('Not implemented yet');
    };

    const cancelSubscription = async (subscriptionId: string) => {
        // TODO: Implement cancellation API call
        console.log('Cancel subscription:', subscriptionId);
        throw new Error('Not implemented yet');
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

        // Default to 'available' status if no subscription found
        const status = subscription?.status || 'available';

        // Use subscription data if available
        return {
            ...service,
            status,
            renewalDate: subscription?.renewalDate,
            usage: subscription?.usage !== undefined ? subscription.usage : service.usage,
            subscriptionId: subscription?.id
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
    const handleToggleCartItem = (service: Service) => {
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
            // Success notification could be added here
        } catch (error) {
            console.error('Failed to subscribe:', error);
            // Error notification could be added here
        } finally {
            setIsSubscribing(null);
        }
    };

    // Handle cancelling subscription modal
    const handleCancelSubscriptionClick = (subscription: Subscription) => {
        setSubscriptionToCancel(subscription);
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

                {/* Filters and search */}
                {/* <div className="dashboard-card mb-6">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold">Filtre</h2>
                </div>
                <div className="p-4 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="md:flex-1">
                        <label htmlFor="search-input" className="block text-sm text-text-secondary mb-1">Căutare</label>
                        <div className="relative">
                            <input
                                id="search-input"
                                type="text"
                                placeholder="Caută servicii..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="max-w-[300px]">
                        <label htmlFor="status-filter" className="block text-sm text-text-secondary mb-1">Status</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                        >
                            <option value="all">Toate</option>
                            <option value="active">Active</option>
                            <option value="trial">Probă</option>
                            <option value="inactive">Inactive</option>
                            <option value="available">Disponibile</option>
                            <option value="cancelled">Anulate</option>
                        </select>
                    </div>
                </div>
            </div> */}

                <Grid cols={2} gap="md" className="mb-6">
                    {filteredServices.map(service => {
                        const subscription = getSubscription(service.id.toString());

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
                        onCancel={cancelSubscription}
                        onClose={handleCloseModal}
                        isOpen={!!subscriptionToCancel}
                    />
                )}
            </DashboardPageLayout>
        </>
    );
}
