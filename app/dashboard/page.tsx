'use client';

import { useSubscriptions } from '@/hooks/useSubscriptions';
import { PageHeader, Card, Grid, Button, Spinner } from '@/components/ui';

export default function Dashboard() {
  const {
    subscriptions,
    isLoading,
    error,
    calculateTotalMonthlySpend
  } = useSubscriptions();

  const activeSubscriptions = subscriptions.filter(
    sub => sub.status === 'active' || sub.status === 'trial'
  );

  return (
    <>
      <PageHeader
        title="Serviciile Tale Active"
        subtitle="Gestionează abonamentele și monitorizează utilizarea"
      />

      {isLoading && (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Spinner size="lg" />
          </div>
          <div className="text-xl font-semibold mb-2">Se încarcă serviciile...</div>
        </Card>
      )}

      {!isLoading && activeSubscriptions.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-xl font-semibold mb-2">Nu ai servicii active</div>
          <p className="text-text-secondary mb-6">Explorează și abonează-te la serviciile noastre.</p>
          <Button
            href="/dashboard/services"
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
          </Button>
        </Card>
      )}

      {!isLoading && activeSubscriptions.length > 0 && (
        <div className="mb-8">
          <Grid cols={1} gap="md" className="mb-6">
            {activeSubscriptions.map(subscription => (
              <Card key={subscription.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{subscription.service?.name}</h3>
                    <p className="text-sm text-text-secondary">{subscription.service?.description}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-primary text-lg">
                      {new Intl.NumberFormat('ro-RO', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(subscription.price / 100)}
                      <span className="text-xs text-text-secondary">/lună</span>
                    </div>
                    {subscription.renewalDate && (
                      <div className="text-xs text-text-secondary">
                        Reînnoiește: {new Date(subscription.renewalDate).toLocaleDateString('ro-RO')}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Grid>

          <Card className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text-primary">Total Plată Lunară</h3>
              <p className="text-xl font-bold text-primary">
                {new Intl.NumberFormat('ro-RO', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(calculateTotalMonthlySpend() / 100)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Future dashboard stats can be added here */}
    </>
  );
}
