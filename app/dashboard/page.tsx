'use client';

import { useDashboardSubscriptions } from '@/context/DashboardContext';
import { Card, Grid, ActionButton, Spinner } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';



export default function Dashboard() {
    const {
        subscriptions,
        isLoading,
        error
    } = useDashboardSubscriptions();

    const calculateTotalMonthlySpend = () => {
        return (subscriptions || [])
            .filter(sub => sub.status === 'active' || sub.status === 'trial')
            .reduce((total, sub) => {
                // Use discounted price if available, otherwise use stored price
                const price = sub.discountInfo?.discountedPrice ? 
                    sub.discountInfo.discountedPrice * 100 : sub.price;
                return total + price;
            }, 0);
    };

    const activeSubscriptions = (subscriptions || []).filter(
        sub => sub.status === 'active' || sub.status === 'trial'
    );

    return (
        <DashboardPageLayout
            title="Serviciile Tale Active"
            subtitle="Gestionează abonamentele și monitorizează utilizarea"
        >

            {isLoading && (
                <Card glass className="dashboard-card p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <Spinner size="lg" />
                    </div>
                    <div className="text-xl font-semibold mb-2 text-text-primary">Se încarcă serviciile...</div>
                </Card>
            )}

            {!isLoading && activeSubscriptions.length === 0 && (
                <Card glass className="dashboard-card p-8 text-center">
                    <div className="text-xl font-semibold mb-2 text-text-primary">Nu ai servicii active</div>
                    <p className="text-text-primary mb-6">Explorează și abonează-te la serviciile noastre.</p>
                    <ActionButton
                        href="/dashboard/services"
                        size="md"
                        onClick={() => {
                            const servicesItem = document.querySelector('.sidebar-item[href="/dashboard/services"]');
                            if (servicesItem) {
                                const items = document.querySelectorAll('.sidebar-item');
                                items.forEach(item => item.classList.remove('active'));
                                servicesItem.classList.add('active');
                            }
                        }}
                    >
                        Explorează Serviciile Disponibile
                    </ActionButton>
                </Card>
            )}

            {!isLoading && activeSubscriptions.length > 0 && (
                <div className="mb-8">
                    <Grid cols={1} gap="md" className="mb-6">
                        {activeSubscriptions.map(subscription => (
                            <Card key={subscription.id} glass className="dashboard-card p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-text-primary">{subscription.service?.name}</h3>
                                        <p className="text-sm text-text-primary">{subscription.service?.description}</p>
                                        {subscription.parsedMetadata?.stripeCoupon && (
                                            <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-900/30 border border-green-900/50 rounded text-xs text-green-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                Cod: {subscription.parsedMetadata.stripeCoupon}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold text-lg">
                                            {subscription.discountInfo?.discountedPrice && subscription.discountInfo?.originalPrice && subscription.discountInfo.discountedPrice < subscription.discountInfo.originalPrice ? (
                                                <div className="flex flex-col items-end">
                                                    <div className="text-sm text-gray-400 line-through">
                                                        {new Intl.NumberFormat('ro-RO', {
                                                            style: 'currency',
                                                            currency: 'EUR'
                                                        }).format(subscription.discountInfo.originalPrice)}
                                                    </div>
                                                    <div className="text-green-400">
                                                        {new Intl.NumberFormat('ro-RO', {
                                                            style: 'currency',
                                                            currency: 'EUR'
                                                        }).format(subscription.discountInfo.discountedPrice)}
                                                        <span className="text-xs text-text-primary">/lună</span>
                                                        {subscription.discountInfo.percentOff && (
                                                            <span className="ml-1 text-xs bg-green-900/30 text-green-300 px-1 rounded">
                                                                -{subscription.discountInfo.percentOff}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {new Intl.NumberFormat('ro-RO', {
                                                        style: 'currency',
                                                        currency: 'EUR'
                                                    }).format(subscription.price / 100)}
                                                    <span className="text-xs text-text-primary">/lună</span>
                                                </div>
                                            )}
                                        </div>
                                        {subscription.renewalDate && (
                                            <div className="text-xs text-text-primary">
                                                Reînnoiește: {new Date(subscription.renewalDate).toLocaleDateString('ro-RO')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </Grid>

                    <Card glass className="dashboard-card p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-text-primary">Total Plată Lunară</h3>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('ro-RO', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(calculateTotalMonthlySpend() / 100)}
                            </p>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardPageLayout>
    );
}
