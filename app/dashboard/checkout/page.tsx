'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PaymentForm from '../../../components/PaymentForm';

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Mock checkout data
  // In a real app, this would be fetched from your API
  const checkoutData = {
    serviceId: 'premium-hosting',
    serviceName: 'Premium Hosting',
    description: 'Monthly subscription for premium web hosting services',
    price: 1299, // $12.99 in cents
    formattedPrice: '$12.99',
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setPaymentIntentId(paymentId);
    setPaymentSuccess(true);

    // In a real app, you would:
    // 1. Send a request to your server to verify the payment
    // 2. Create an order and invoice in your database
    // 3. Redirect the user to a success page

    // For this demo, we'll just show a success message
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
  };

  const handleContinue = () => {
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-text-secondary">Complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="dashboard-card mb-6">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-xl font-semibold">Payment</h2>
            </div>
            <div className="p-4">
              {paymentSuccess ? (
                <div className="bg-green-900/20 border border-green-900/30 rounded-md p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-xl font-semibold text-green-300 mb-2">Payment Successful!</h3>
                  <p className="text-text-secondary mb-6">
                    Your payment for {checkoutData.serviceName} has been processed successfully.
                  </p>
                  <p className="text-sm text-text-secondary mb-6">
                    Payment ID: {paymentIntentId}
                  </p>
                  <button
                    onClick={handleContinue}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-text-secondary">
                    Please enter your payment details to complete your purchase.
                  </p>

                  {paymentError && (
                    <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-6 text-danger">
                      {paymentError}
                    </div>
                  )}

                  <PaymentForm
                    amount={checkoutData.price}
                    description={checkoutData.description}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    buttonText="Complete Purchase"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card h-fit">
          <div className="p-4 border-b border-border-color">
            <h2 className="text-xl font-semibold">Order Summary</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{checkoutData.serviceName}</h3>
              <p className="text-text-secondary text-sm">
                {checkoutData.description}
              </p>
            </div>

            <div className="py-4 border-t border-border-color">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Subtotal</span>
                <span>{checkoutData.formattedPrice}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span className="text-primary">{checkoutData.formattedPrice}</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-text-secondary">
              <p className="mb-2">By completing your purchase, you agree to our:</p>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-primary hover:text-primary-dark">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:text-primary-dark">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:text-primary-dark">Refund Policy</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="text-text-secondary hover:text-primary transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}