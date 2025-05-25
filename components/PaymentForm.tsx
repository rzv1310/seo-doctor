'use client';

import { useState, useEffect } from 'react';
import {
    Elements, PaymentElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import {
    StripeElementsOptions,
} from '@stripe/stripe-js';
import stripePromise from '../utils/stripe';
import { useLogger } from '@/lib/client-logger';

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
    const logger = useLogger('StripeForm');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            logger.warn('Stripe or Elements not loaded');
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);
        
        logger.form('submit', 'PaymentForm', false);
        logger.info('Payment form submitted', { amount });

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                const errorMsg = error.message || 'A apărut o eroare cu plata ta.';
                logger.form('submit', 'PaymentForm', false, new Error(errorMsg));
                logger.error('Payment confirmation failed', error, { 
                    errorType: error.type,
                    errorCode: error.code 
                });
                setErrorMessage(errorMsg);
                onError(errorMsg);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                logger.form('submit', 'PaymentForm', true);
                logger.info('Payment succeeded', { 
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status 
                });
                onSuccess(paymentIntent.id);
                return;
            } else {
                const errorMsg = 'Plata nu a putut fi procesată. Te rugăm să încerci din nou.';
                logger.form('submit', 'PaymentForm', false, new Error(errorMsg));
                logger.warn('Payment not completed', { 
                    status: paymentIntent?.status 
                });
                setErrorMessage(errorMsg);
                onError(errorMsg);
            }
        } catch (err) {
            const errorMsg = 'Eroare de conexiune cu procesatorul de plăți. Te rugăm să verifici conexiunea la internet și să încerci din nou.';
            logger.form('submit', 'PaymentForm', false, err as Error);
            logger.error('Payment processing error', err as Error);
            setErrorMessage(errorMsg);
            onError(errorMsg);
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

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`w-full mt-6 py-2 px-4 rounded-md text-white ${!stripe || isProcessing
                        ? 'bg-primary/50 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    } transition-colors`}
            >
                {isProcessing ? 'Se procesează...' : buttonText}
            </button>
        </form>
    );
};

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
    const logger = useLogger('PaymentForm');

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                setLoadingSecret(true);
                setError(null);
                
                logger.info('Creating payment intent', { amount, description });

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const response = await fetch('/api/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount,
                        currency: 'usd',
                        description
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    logger.error('Payment intent creation failed', new Error(`HTTP ${response.status}`), {
                        status: response.status,
                        errorText
                    });
                    throw new Error('Nu s-a putut crea intenția de plată');
                }

                const data = await response.json();
                logger.info('Payment intent created successfully', { 
                    hasClientSecret: !!data.clientSecret 
                });
                setClientSecret(data.clientSecret);
            } catch (error: any) {
                let errorMessage = 'Eroare la configurarea plății. Te rugăm să încerci din nou mai târziu.';
                
                if (error.name === 'AbortError') {
                    errorMessage = 'Conexiunea a expirat. Verifică conexiunea la internet și încearcă din nou.';
                } else if (error instanceof TypeError && error.message.includes('fetch')) {
                    errorMessage = 'Eroare de conexiune. Verifică conexiunea la internet și încearcă din nou.';
                }
                
                logger.error('Error creating payment intent', error, {
                    errorName: error.name,
                    errorMessage: error.message
                });
                
                setError(errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            } finally {
                setLoadingSecret(false);
            }
        };

        createPaymentIntent();
    }, [amount, description, onError, logger]);

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
