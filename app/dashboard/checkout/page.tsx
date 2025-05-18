'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PaymentForm from '../../../components/PaymentForm';
import { useCart } from '../../../context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, formattedTotalPrice, clearCart } = useCart();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Create a description for payment processing
  const paymentDescription = items.length === 1
    ? `Payment for ${items[0].name} subscription`
    : `Payment for ${items.length} services subscription`;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !paymentSuccess) {
      router.push('/dashboard/services');
    }
  }, [items, router, paymentSuccess]);

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setPaymentIntentId(paymentId);
    setPaymentSuccess(true);

    // In a real app, you would:
    // 1. Send a request to your server to verify the payment
    // 2. Create an order and invoice in your database
    // 3. Create subscriptions for the services
    
    // Clear the cart after successful payment
    clearCart();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
  };

  const handleContinue = () => {
    // Redirect to dashboard
    router.push('/dashboard');
  };

  if (items.length === 0 && !paymentSuccess) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Finalizează Comanda</h1>
        <p className="text-text-secondary">Completează plata pentru serviciile selectate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="dashboard-card mb-6">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-xl font-semibold">Plată</h2>
            </div>
            <div className="p-4">
              {paymentSuccess ? (
                <div className="bg-green-900/20 border border-green-900/30 rounded-md p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-xl font-semibold text-green-300 mb-2">Plată Reușită!</h3>
                  <p className="text-text-secondary mb-6">
                    Plata pentru {items.length === 1 ? `serviciul ${items[0].name}` : `${items.length} servicii`} a fost procesată cu succes.
                  </p>
                  <p className="text-sm text-text-secondary mb-6">
                    ID Plată: {paymentIntentId}
                  </p>
                  <button
                    onClick={handleContinue}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Continuă la Panou de Control
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-text-secondary">
                    Te rugăm să introduci detaliile de plată pentru a finaliza achiziția.
                  </p>

                  {paymentError && (
                    <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-6 text-danger">
                      {paymentError}
                    </div>
                  )}

                  <PaymentForm
                    amount={totalPrice}
                    description={paymentDescription}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    buttonText="Finalizează Plata"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card h-fit">
          <div className="p-4 border-b border-border-color">
            <h2 className="text-xl font-semibold">Rezumat Comandă</h2>
          </div>
          <div className="p-4">
            {/* Cart Items */}
            <div className="mb-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="pb-3 border-b border-border-color last:border-0">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-text-secondary text-sm mb-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Abonament lunar</span>
                    <span>{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="py-4 border-t border-border-color">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Subtotal</span>
                <span>{formattedTotalPrice}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Taxe</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span className="text-primary">{formattedTotalPrice}</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-text-secondary">
              <p className="mb-2">Finalizând achiziția, ești de acord cu:</p>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-primary hover:text-primary-dark">Termenii de Serviciu</a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:text-primary-dark">Politica de Confidențialitate</a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:text-primary-dark">Politica de Rambursare</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/services"
          className="text-text-secondary hover:text-primary transition-colors"
        >
          ← Înapoi la Servicii
        </Link>
      </div>
    </>
  );
}