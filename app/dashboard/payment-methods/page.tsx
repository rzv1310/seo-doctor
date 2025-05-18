'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

type PaymentMethod = {
  id: number;
  type: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  cardBrand?: string;
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

  // Mock data for payment methods
  const initialPaymentMethods: PaymentMethod[] = [
    {
      id: 1,
      type: 'card',
      lastFour: '4242',
      expiryMonth: 3,
      expiryYear: 27,
      isDefault: true,
      cardBrand: 'visa'
    },
    {
      id: 2,
      type: 'card',
      lastFour: '1234',
      expiryMonth: 11,
      expiryYear: 26,
      isDefault: false,
      cardBrand: 'mastercard'
    }
  ];

  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardForm, setAddCardForm] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    setDefault: false
  });

  // Form state for add card
  const [formErrors, setFormErrors] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;

    setAddCardForm({
      ...addCardForm,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error when user types
    setFormErrors({
      ...formErrors,
      [name]: ''
    });
  };

  // Set default payment method
  const setDefaultMethod = (id: number) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  // Delete payment method
  const deleteMethod = (id: number) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    const errors = {
      cardNumber: '',
      nameOnCard: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    };

    if (!addCardForm.cardNumber.trim()) {
      errors.cardNumber = 'Numărul cardului este obligatoriu';
      valid = false;
    } else if (!/^\d{16}$/.test(addCardForm.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Numărul cardului trebuie să aibă 16 cifre';
      valid = false;
    }

    if (!addCardForm.nameOnCard.trim()) {
      errors.nameOnCard = 'Numele este obligatoriu';
      valid = false;
    }

    if (!addCardForm.expiryMonth) {
      errors.expiryMonth = 'Luna este obligatorie';
      valid = false;
    }

    if (!addCardForm.expiryYear) {
      errors.expiryYear = 'Anul este obligatoriu';
      valid = false;
    }

    if (!addCardForm.cvv.trim()) {
      errors.cvv = 'CVV este obligatoriu';
      valid = false;
    } else if (!/^\d{3,4}$/.test(addCardForm.cvv)) {
      errors.cvv = 'CVV trebuie să aibă 3 sau 4 cifre';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  // Submit new card form
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // In a real app, we would call Stripe API to create a payment method
    // For demo, just add a new card to the list
    const newCard: PaymentMethod = {
      id: Date.now(), // use timestamp as ID
      type: 'card',
      lastFour: addCardForm.cardNumber.slice(-4),
      expiryMonth: parseInt(addCardForm.expiryMonth),
      expiryYear: parseInt(addCardForm.expiryYear),
      isDefault: addCardForm.setDefault,
      cardBrand: 'visa' // Assuming Visa for demo
    };

    // If new card is default, update all other cards
    if (newCard.isDefault) {
      setPaymentMethods(methods =>
        methods.map(method => ({
          ...method,
          isDefault: false
        }))
      );
    }

    // Add new card to list
    setPaymentMethods(methods => [...methods, newCard]);

    // Reset form
    setAddCardForm({
      cardNumber: '',
      nameOnCard: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      setDefault: false
    });

    // Hide form
    setShowAddCard(false);
  };

  // Get card brand icon
  const getCardIcon = (brand: string) => {
    switch (brand) {
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
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <button
            onClick={() => setShowAddCard(!showAddCard)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            {showAddCard ? 'Anulare' : 'Adaugă Metodă de Plată'}
          </button>
        </div>
        <div className="p-4">
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-4 border border-border-color rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="w-12 h-12 flex items-center justify-center mr-4">
                        {method.cardBrand ? getCardIcon(method.cardBrand) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">•••• {method.lastFour}</h3>
                          {method.isDefault && (
                            <span className="ml-2 bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                              Implicit
                            </span>
                          )}
                        </div>
                        <p className="text-text-secondary text-sm">Expiră în {method.expiryMonth}/{method.expiryYear}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultMethod(method.id)}
                          className="text-primary hover:text-primary-dark transition-colors text-sm"
                        >
                          Setează ca Implicit
                        </button>
                      )}
                      <button
                        onClick={() => deleteMethod(method.id)}
                        className="text-danger hover:text-red-500 transition-colors text-sm"
                      >
                        Șterge
                      </button>
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
            <div className="mt-6 p-4 border border-border-color rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Adaugă Card Nou</h3>
              <form onSubmit={handleAddCard}>
                <div className="mb-4">
                  <label htmlFor="cardNumber" className="block text-sm text-text-secondary mb-1">
                    Număr Card
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={addCardForm.cardNumber}
                    onChange={handleInputChange}
                    className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                  />
                  {formErrors.cardNumber && (
                    <p className="text-danger text-xs mt-1">{formErrors.cardNumber}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="nameOnCard" className="block text-sm text-text-secondary mb-1">
                    Nume pe Card
                  </label>
                  <input
                    type="text"
                    id="nameOnCard"
                    name="nameOnCard"
                    placeholder="John Doe"
                    value={addCardForm.nameOnCard}
                    onChange={handleInputChange}
                    className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                  />
                  {formErrors.nameOnCard && (
                    <p className="text-danger text-xs mt-1">{formErrors.nameOnCard}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="expiryMonth" className="block text-sm text-text-secondary mb-1">
                      Luna
                    </label>
                    <select
                      id="expiryMonth"
                      name="expiryMonth"
                      value={addCardForm.expiryMonth}
                      onChange={handleInputChange}
                      className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{month.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    {formErrors.expiryMonth && (
                      <p className="text-danger text-xs mt-1">{formErrors.expiryMonth}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="expiryYear" className="block text-sm text-text-secondary mb-1">
                      Anul
                    </label>
                    <select
                      id="expiryYear"
                      name="expiryYear"
                      value={addCardForm.expiryYear}
                      onChange={handleInputChange}
                      className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() % 100 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {formErrors.expiryYear && (
                      <p className="text-danger text-xs mt-1">{formErrors.expiryYear}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm text-text-secondary mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={addCardForm.cvv}
                      onChange={handleInputChange}
                      className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                    />
                    {formErrors.cvv && (
                      <p className="text-danger text-xs mt-1">{formErrors.cvv}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="setDefault"
                      checked={addCardForm.setDefault}
                      onChange={handleInputChange}
                      className="h-4 w-4 bg-dark-blue-lighter border border-border-color rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-text-secondary">
                      Setează ca metodă de plată implicită
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Anulare
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Adaugă Card
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Billing Details */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold">Detalii Facturare</h2>
          {!isEditingBilling && (
            <button
              onClick={() => setIsEditingBilling(true)}
              className="text-primary hover:text-primary-dark transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editează
            </button>
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
                  <button
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
                    className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Anulare
                  </button>
                  <button
                    onClick={handleBillingUpdate}
                    disabled={isUpdatingBilling}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    {isUpdatingBilling ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Se procesează...</span>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Salvează
                      </span>
                    )}
                  </button>
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

      {/* Payment Security */}
      <div className="dashboard-card">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Securitatea Plăților</h2>
        </div>
        <div className="p-4">
          <div className="bg-dark-blue-lighter rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Procesare Securizată
            </h3>
            <p className="text-text-secondary text-sm">
              Toate informațiile de plată sunt criptate și stocate în siguranță. Folosim practici de securitate standard în industrie pentru a-ți proteja datele.
            </p>
          </div>

          <div className="bg-dark-blue-lighter rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Procesarea Plăților
            </h3>
            <p className="text-text-secondary text-sm">
              Folosim Stripe pentru procesarea securizată a plăților. Informațiile tale de plată nu sunt niciodată stocate pe serverele noastre.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}