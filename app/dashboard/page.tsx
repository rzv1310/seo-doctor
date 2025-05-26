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
            .reduce((total, sub) => total + sub.price, 0);
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary">{subscription.service?.name}</h3>
                                        <p className="text-sm text-text-primary">{subscription.service?.description}</p>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold text-sky-400 text-lg">
                                            {new Intl.NumberFormat('ro-RO', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            }).format(subscription.price / 100)}
                                            <span className="text-xs text-text-primary">/lună</span>
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
                            <p className="text-xl font-bold text-sky-400">
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
