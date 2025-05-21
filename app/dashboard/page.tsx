'use client';

import Link from 'next/link';
import { useSubscriptions } from '@/hooks/useSubscriptions';

// Main dashboard page showing overview and recent orders
export default function Dashboard() {
  const {
    subscriptions,
    isLoading,
    error,
    calculateTotalMonthlySpend
  } = useSubscriptions();

  // Filter only active or trial subscriptions
  const activeSubscriptions = subscriptions.filter(
    sub => sub.status === 'active' || sub.status === 'trial'
  );

  return (
    <>
      {/* Current Services Section */}
      <h2 className="text-2xl font-bold mb-4">Serviciile Tale Active</h2>

      {isLoading && (
        <div className="p-8 bg-slate-800 rounded-lg text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="text-xl font-semibold mb-2">Se încarcă serviciile...</div>
        </div>
      )}

      {!isLoading && activeSubscriptions.length === 0 && (
        <div className="p-8 bg-slate-800 rounded-lg text-center">
          <div className="text-xl font-semibold mb-2">Nu ai servicii active</div>
          <p className="text-slate-300 mb-6">Explorează și abonează-te la serviciile noastre.</p>
          <Link
            href="/dashboard/services"
            onClick={() => {
              // Force sidebar update when navigating programmatically
              const servicesItem = document.querySelector('.sidebar-item[href="/dashboard/services"]');
              if (servicesItem) {
                const items = document.querySelectorAll('.sidebar-item');
                items.forEach(item => item.classList.remove('active'));
                servicesItem.classList.add('active');
              }
            }}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
            Explorează Serviciile Disponibile
          </Link>
        </div>
      )}

      {!isLoading && activeSubscriptions.length > 0 && (
        <div className="mb-8">
          <div className="space-y-4">
            {activeSubscriptions.map(subscription => (
              <div key={subscription.id} className="p-4 bg-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{subscription.service?.name}</h3>
                  <p className="text-sm text-slate-400">{subscription.service?.description}</p>
                </div>

                <div className="text-right">
                  <div className="font-bold text-green-400 text-lg">
                    {/* Format price appropriately */}
                    {new Intl.NumberFormat('ro-RO', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(subscription.price / 100)}
                    <span className="text-xs text-slate-400">/lună</span>
                  </div>
                  {subscription.renewalDate && (
                    <div className="text-xs text-slate-400">
                      Reînnoiește: {new Date(subscription.renewalDate).toLocaleDateString('ro-RO')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total monthly payment */}
          <div className="mt-6 p-4 bg-slate-800 rounded-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Total Plată Lunară</h3>
            <p className="text-xl font-bold text-green-400">
              {new Intl.NumberFormat('ro-RO', {
                style: 'currency',
                currency: 'EUR'
              }).format(calculateTotalMonthlySpend() / 100)}
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

      </div>
    </>
  );
}
