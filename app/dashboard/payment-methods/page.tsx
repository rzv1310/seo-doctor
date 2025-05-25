'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardPaymentMethods } from '@/context/DashboardContext';
import { ActionButton, LinkButton, Toggle } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import PaymentMethodCard from '@/components/dashboard/payment-methods/PaymentMethodCard';
import BillingDetailsForm from '@/components/dashboard/payment-methods/BillingDetailsForm';
import BillingDetailsDisplay from '@/components/dashboard/payment-methods/BillingDetailsDisplay';
import dynamic from 'next/dynamic';

const StripeCardElement = dynamic(
  () => import('@/components/StripeCardElement'),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="mt-2 text-text-secondary">Se încarcă formularul...</p>
      </div>
    )
  }
);

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  funding?: string;
  country?: string;
};

export default function PaymentMethodsPage() {
  const { user } = useAuth();

  // Billing details states
  const [billingName, setBillingName] = useState('');
  const [billingCompany, setBillingCompany] = useState('');
  const [billingVat, setBillingVat] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isUpdatingBilling, setIsUpdatingBilling] = useState(false);
  const [billingUpdateSuccess, setBillingUpdateSuccess] = useState('');
  const [billingUpdateError, setBillingUpdateError] = useState('');

  // Update billing details when user changes
  useEffect(() => {
    if (user) {
      setBillingName(user.billingName || '');
      setBillingCompany(user.billingCompany || '');
      setBillingVat(user.billingVat || '');
      setBillingAddress(user.billingAddress || '');
      setBillingPhone(user.billingPhone || '');
    }
  }, [user]);

  const { paymentMethods, isLoading: isLoadingCards, error: cardsError, refresh: refreshPaymentMethods } = useDashboardPaymentMethods();
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardSuccess, setCardSuccess] = useState('');
  const [localCardsError, setLocalCardsError] = useState('');

  // Combined error handling
  const displayError = localCardsError || cardsError;

  // Handle billing details update
  const handleBillingUpdate = async () => {
    try {
      // Reset states
      setBillingUpdateError('');
      setBillingUpdateSuccess('');

      // Validate fields
      if (!billingName.trim() && !billingCompany.trim()) {
        setBillingUpdateError('Numele sau compania este obligatorie');
        return;
      }

      if (!billingAddress.trim()) {
        setBillingUpdateError('Adresa este obligatorie');
        return;
      }

      setIsUpdatingBilling(true);

      // Call API to update billing details
      const response = await fetch('/api/auth/update-billing-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingName,
          billingCompany,
          billingVat,
          billingAddress,
          billingPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'A apărut o eroare');
      }

      // Success
      setBillingUpdateSuccess('Detaliile de facturare au fost actualizate cu succes');
      setIsEditingBilling(false);

      // Update user context
      if (user) {
        user.billingName = billingName;
        user.billingCompany = billingCompany;
        user.billingVat = billingVat;
        user.billingAddress = billingAddress;
        user.billingPhone = billingPhone;
      }
    } catch (error) {
      setBillingUpdateError(error instanceof Error ? error.message : 'A apărut o eroare');
    } finally {
      setIsUpdatingBilling(false);
    }
  };

  // Handle successful card addition
  const handleCardAdded = (cardId: string) => {
    refreshPaymentMethods();
    setShowAddCard(false);
    setCardSuccess('Cardul a fost adăugat cu succes');
    setTimeout(() => setCardSuccess(''), 5000);
  };

  // Set default payment method
  const setDefaultMethod = async (cardId: string) => {
    try {
      setLocalCardsError('');
      const response = await fetch('/api/payment-methods', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update default payment method');
      }

      // Refresh data from context
      refreshPaymentMethods();
    } catch (error) {
      setLocalCardsError(error instanceof Error ? error.message : 'Failed to update default payment method');
    }
  };

  // Delete payment method
  const deleteMethod = async (cardId: string) => {
    try {
      setLocalCardsError('');
      const response = await fetch(`/api/payment-methods?cardId=${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete payment method');
      }

      // Refresh data from context
      refreshPaymentMethods();
      setCardSuccess('Cardul a fost șters cu succes');
    } catch (error) {
      setLocalCardsError(error instanceof Error ? error.message : 'Failed to delete payment method');
    }
  };



  return (
    <DashboardPageLayout
      title="Metode de Plată"
      subtitle="Gestionează metodele tale de plată"
    >
        {/* Payment Methods List */}
        <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold">Metodele Tale de Plată</h2>
          <ActionButton
            onClick={() => setShowAddCard(!showAddCard)}
            size="sm"
            showArrow={false}
            fullRounded={false}
          >
            {showAddCard ? 'Anulare' : 'Adaugă Metodă de Plată'}
          </ActionButton>
        </div>
        <div className="p-4">
          {displayError && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2 rounded-lg mb-4 flex items-start text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {displayError}
            </div>
          )}

          {cardSuccess && (
            <div className="bg-success/10 border border-success/30 text-success px-4 py-2 rounded-lg mb-4 flex items-start text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {cardSuccess}
            </div>
          )}

          {isLoadingCards ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-text-secondary">Se încarcă metodele de plată...</p>
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onSetDefault={setDefaultMethod}
                  onDelete={deleteMethod}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              Nu au fost găsite metode de plată. Adaugă o metodă de plată pentru a începe.
            </div>
          )}

          {/* Add Card Form */}
          {showAddCard && (
            <div className="mt-6 p-4 border border-border-color rounded-lg bg-dark-blue-lighter/50">
              <h3 className="text-lg font-semibold mb-4">Adaugă Card Nou</h3>
              <StripeCardElement
                onSuccess={handleCardAdded}
                onCancel={() => {
                  setShowAddCard(false);
                  setCardError('');
                }}
                setAsDefault={paymentMethods.length === 0}
              />
            </div>
          )}
        </div>
      </div>

      {/* Billing Details */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold">Detalii Facturare</h2>
          {!isEditingBilling && (
            <LinkButton
              onClick={() => setIsEditingBilling(true)}
              variant="default"
              size="sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editează
            </LinkButton>
          )}
        </div>
        <div className="p-4">
          {billingUpdateError && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2 rounded-lg mb-4 flex items-start text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {billingUpdateError}
            </div>
          )}

          {billingUpdateSuccess && (
            <div className="bg-success/10 border border-success/30 text-success px-4 py-2 rounded-lg mb-4 flex items-start text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {billingUpdateSuccess}
            </div>
          )}

          {isEditingBilling ? (
            <BillingDetailsForm
              initialData={{
                billingName: billingName,
                billingCompany: billingCompany,
                billingVat: billingVat,
                billingAddress: billingAddress,
                billingPhone: billingPhone
              }}
              onSave={async (data) => {
                setBillingName(data.billingName);
                setBillingCompany(data.billingCompany);
                setBillingVat(data.billingVat);
                setBillingAddress(data.billingAddress);
                setBillingPhone(data.billingPhone);
                await handleBillingUpdate();
              }}
              onCancel={() => {
                setIsEditingBilling(false);
                setBillingName(user?.billingName || '');
                setBillingCompany(user?.billingCompany || '');
                setBillingVat(user?.billingVat || '');
                setBillingAddress(user?.billingAddress || '');
                setBillingPhone(user?.billingPhone || '');
                setBillingUpdateError('');
                setBillingUpdateSuccess('');
              }}
            />
          ) : (
            <BillingDetailsDisplay
              details={{
                billingName: user?.billingName,
                billingCompany: user?.billingCompany,
                billingVat: user?.billingVat,
                billingAddress: user?.billingAddress,
                billingPhone: user?.billingPhone
              }}
            />
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}