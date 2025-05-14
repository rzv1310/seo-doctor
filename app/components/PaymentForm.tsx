'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../utils/stripe';

// Stripe Payment Element form
const StripeForm = ({ 
  amount, 
  onSuccess, 
  onError,
  buttonText = 'Pay Now',
  isProcessing,
  setIsProcessing
}: { 
  amount: number; 
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred with your payment.');
      onError(error.message || 'An error occurred with your payment.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="mt-4 text-danger text-sm">{errorMessage}</div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full mt-6 py-2 px-4 rounded-md text-white ${
          !stripe || isProcessing 
            ? 'bg-primary/50 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary-dark'
        } transition-colors`}
      >
        {isProcessing ? 'Processing...' : buttonText}
      </button>
    </form>
  );
};

// Main payment form component with Stripe Elements wrapper
const PaymentForm = ({ 
  amount, 
  description,
  onSuccess,
  onError,
  buttonText
}: { 
  amount: number;
  description: string; 
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingSecret, setLoadingSecret] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoadingSecret(true);
        setError(null);
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount, // amount in cents
            currency: 'usd',
            description
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError('Error setting up payment. Please try again later.');
        if (onError) {
          onError('Error setting up payment. Please try again later.');
        }
      } finally {
        setLoadingSecret(false);
      }
    };

    createPaymentIntent();
  }, [amount, description]);

  if (loadingSecret) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-danger/20 border border-danger/30 rounded-md text-danger">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#1e293b',
        colorText: '#f8fafc',
        colorDanger: '#ef4444',
        fontFamily: 'Arial, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeForm 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError}
        buttonText={buttonText}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </Elements>
  );
};

export default PaymentForm;