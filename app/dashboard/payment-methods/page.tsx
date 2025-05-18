'use client';

import { useState } from 'react';

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

      {/* Billing Address */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Adresa de Facturare</h2>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <div className="p-4 border border-border-color rounded-lg">
              <h3 className="font-medium mb-2">Adresa de Facturare Implicită</h3>
              <div className="text-text-secondary">
                <p>John Doe</p>
                <p>123 Main St</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
              <div className="mt-4 flex gap-3">
                <button className="text-primary hover:text-primary-dark transition-colors text-sm">
                  Editează
                </button>
              </div>
            </div>
          </div>
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