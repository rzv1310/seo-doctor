'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardPaymentMethods } from '@/context/DashboardContext';
import { ActionButton, LinkButton, Toggle } from '@/components/ui';
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


  // Get card brand icon
  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case 'visa':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="#1434CB">
            <path d="M12 0h-10c-1.105 0-2 .895-2 2v20c0 1.105.895 2 2 2h20c1.105 0 2-.895 2-2v-20c0-1.105-.895-2-2-2h-10zm0 2v6h-10v-6h10zm-10 8h10v12h-10v-12zm12 12v-12h10v12h-10zm10-14h-10v-6h10v6z" />
          </svg>
        );
      case 'mastercard':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24">
            <circle cx="7" cy="12" r="7" fill="#EB001B" />
            <circle cx="17" cy="12" r="7" fill="#F79E1B" />
            <path d="M12 17.5a7 7 0 010-11c1.94 1.94 1.94 9.06 0 11z" fill="#FF5F00" />
          </svg>
        );
      case 'amex':
      case 'american express':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="#2E77BB">
            <rect width="24" height="24" rx="2" />
          </svg>
        );
      case 'discover':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="#FF6000">
            <rect width="24" height="24" rx="2" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Metode de Plată</h1>
        <p className="text-text-secondary">Gestionează metodele tale de plată</p>
      </div>

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
                <div key={method.id} className="p-4 border border-border-color rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="w-12 h-12 flex items-center justify-center mr-4">
                        {getCardIcon(method.brand)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">•••• {method.last4}</h3>
                          {method.isDefault && (
                            <span className="ml-2 bg-primary/20 text-text-primary text-xs px-2 py-1 rounded">
                              Implicit
                            </span>
                          )}
                        </div>
                        <p className="text-text-secondary text-sm">
                          Expiră în {method.expMonth}/{method.expYear}
                          {method.funding && ` • ${method.funding === 'credit' ? 'Credit' : method.funding === 'debit' ? 'Debit' : method.funding}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {!method.isDefault && (
                        <LinkButton
                          onClick={() => setDefaultMethod(method.id)}
                          variant="default"
                          size="sm"
                        >
                          Setează ca Implicit
                        </LinkButton>
                      )}
                      <LinkButton
                        onClick={() => deleteMethod(method.id)}
                        variant="danger"
                        size="sm"
                      >
                        Șterge
                      </LinkButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              Nu au fost găsite metode de plată. Adaugă o metodă de plată pentru a începe.
            </div>
          )}

          {/* Add Card Form */}
          {showAddCard && (
            <div className="mt-6 mb-6 p-4 border border-border-color rounded-lg">
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
            <div className="p-4 border border-border-color rounded-lg">
              <h3 className="font-medium mb-4">Editează Detaliile de Facturare</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billingName" className="block text-sm text-text-secondary mb-1">
                      Nume persoană fizică
                    </label>
                    <input
                      id="billingName"
                      type="text"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      placeholder="Numele și prenumele"
                      className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="billingCompany" className="block text-sm text-text-secondary mb-1">
                      Denumire companie
                    </label>
                    <input
                      id="billingCompany"
                      type="text"
                      value={billingCompany}
                      onChange={(e) => setBillingCompany(e.target.value)}
                      placeholder="Denumirea companiei"
                      className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="billingVat" className="block text-sm text-text-secondary mb-1">
                    Cod fiscal / CUI
                  </label>
                  <input
                    id="billingVat"
                    type="text"
                    value={billingVat}
                    onChange={(e) => setBillingVat(e.target.value)}
                    placeholder="Codul fiscal al companiei"
                    className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="billingAddress" className="block text-sm text-text-secondary mb-1">
                    Adresă <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="billingAddress"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Adresa completă (stradă, număr, bloc, scară, apartament, localitate, județ, cod poștal, țară)"
                    className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 min-h-[100px]"
                  />
                </div>

                <div>
                  <label htmlFor="billingPhone" className="block text-sm text-text-secondary mb-1">
                    Telefon
                  </label>
                  <input
                    id="billingPhone"
                    type="text"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    placeholder="Număr de telefon"
                    className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <LinkButton
                    onClick={() => {
                      setIsEditingBilling(false);
                      setBillingName(user?.billingName || '');
                      setBillingCompany(user?.billingCompany || '');
                      setBillingVat(user?.billingVat || '');
                      setBillingAddress(user?.billingAddress || '');
                      setBillingPhone(user?.billingPhone || '');
                      setBillingUpdateError('');
                      setBillingUpdateSuccess('');
                    }}
                    variant="default"
                    size="sm"
                  >
                    Anulare
                  </LinkButton>
                  <ActionButton
                    onClick={handleBillingUpdate}
                    disabled={isUpdatingBilling}
                    loading={isUpdatingBilling}
                    size="sm"
                    showArrow={false}
                    fullRounded={false}
                  >
                    {isUpdatingBilling ? (
                      'Se procesează...'
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Salvează
                      </>
                    )}
                  </ActionButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-border-color rounded-lg">
              <h3 className="font-medium mb-4">Detalii Facturare</h3>
              <div className="space-y-3">
                {(user?.billingName || user?.billingCompany) ? (
                  <>
                    {user?.billingName && (
                      <div>
                        <p className="text-sm text-text-secondary">Nume persoană fizică:</p>
                        <p className="text-base">{user.billingName}</p>
                      </div>
                    )}

                    {user?.billingCompany && (
                      <div>
                        <p className="text-sm text-text-secondary">Denumire companie:</p>
                        <p className="text-base">{user.billingCompany}</p>
                      </div>
                    )}

                    {user?.billingVat && (
                      <div>
                        <p className="text-sm text-text-secondary">Cod fiscal / CUI:</p>
                        <p className="text-base">{user.billingVat}</p>
                      </div>
                    )}

                    {user?.billingAddress && (
                      <div>
                        <p className="text-sm text-text-secondary">Adresă:</p>
                        <p className="text-base whitespace-pre-wrap">{user.billingAddress}</p>
                      </div>
                    )}

                    {user?.billingPhone && (
                      <div>
                        <p className="text-sm text-text-secondary">Telefon:</p>
                        <p className="text-base">{user.billingPhone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-text-tertiary italic">Nu există detalii de facturare specificate</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}