'use client';

import { useState, useEffect } from 'react';
import {
    Elements, PaymentElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import {
    StripeElementsOptions,
} from '@stripe/stripe-js';
import stripePromise from '../utils/stripe';
import { Button } from '@/components/ui/Button';

// Stripe Payment Element form
const StripeForm = ({
    amount,
    onSuccess,
    onError,
    buttonText = 'Plătește Acum',
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

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || 'A apărut o eroare cu plata ta.');
                onError(error.message || 'A apărut o eroare cu plata ta.');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
                return;
            } else {
                setErrorMessage('Plata nu a putut fi procesată. Te rugăm să încerci din nou.');
                onError('Plata nu a putut fi procesată. Te rugăm să încerci din nou.');
            }
        } catch (err) {
            console.error('Payment processing error:', err);
            setErrorMessage('Eroare de conexiune cu procesatorul de plăți. Te rugăm să verifici conexiunea la internet și să încerci din nou.');
            onError('Eroare de conexiune cu procesatorul de plăți. Te rugăm să verifici conexiunea la internet și să încerci din nou.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <PaymentElement />

            {errorMessage && (
                <div className="mt-4 text-danger text-sm">{errorMessage}</div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                loading={isProcessing}
                className="w-full mt-6"
            >
                {isProcessing ? 'Se procesează...' : buttonText}
            </Button>
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

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    console.error('Payment intent creation failed:', response.status, errorText);
                    throw new Error('Nu s-a putut crea intenția de plată');
                }

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (error: any) {
                console.error('Error creating payment intent:', error);
                
                let errorMessage = 'Eroare la configurarea plății. Te rugăm să încerci din nou mai târziu.';
                
                if (error.name === 'AbortError') {
                    errorMessage = 'Conexiunea a expirat. Verifică conexiunea la internet și încearcă din nou.';
                } else if (error instanceof TypeError && error.message.includes('fetch')) {
                    errorMessage = 'Eroare de conexiune. Verifică conexiunea la internet și încearcă din nou.';
                }
                
                setError(errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            } finally {
                setLoadingSecret(false);
            }
        };

        createPaymentIntent();
    }, [amount, description, onError]);

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

    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
            theme: 'night' as const,
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
