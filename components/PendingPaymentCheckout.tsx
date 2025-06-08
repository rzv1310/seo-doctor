'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentElement } from '@stripe/react-stripe-js';
import { ActionButton, Alert, Spinner } from './ui';
import { formatCurrency } from '@/lib/utils';
import { useLogger } from '@/lib/client-logger';



interface PendingPaymentCheckoutProps {
    incompletePayment: {
        paymentIntentId: string;
        clientSecret: string;
        amount: number;
        currency: string;
    };
    serviceName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function PendingPaymentCheckout({
    incompletePayment,
    serviceName,
    onSuccess,
    onCancel,
}: PendingPaymentCheckoutProps) {
    const stripe = useStripe();
    const elements = useElements();
    const logger = useLogger('PendingPaymentCheckout');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            logger.info('Confirming pending payment', { 
                paymentIntentId: incompletePayment.paymentIntentId 
            });

            // Confirm the payment with the existing payment intent
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard/services?subscription_success=true`,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                // Handle different error types
                if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
                    setError(confirmError.message || 'Eroare la procesarea plății');
                } else {
                    setError('A apărut o eroare neașteptată. Te rugăm să încerci din nou.');
                }
                logger.error('Payment confirmation failed', confirmError);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                logger.info('Payment succeeded', {
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status
                });
                
                // Payment succeeded
                if (onSuccess) {
                    onSuccess();
                }
            } else if (paymentIntent && paymentIntent.status === 'processing') {
                logger.info('Payment is processing', {
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status
                });
                
                // Payment is still processing
                setError('Plata ta este în curs de procesare. Vei fi notificat când este finalizată.');
            }
        } catch (err: any) {
            logger.error('Error confirming payment', err);
            setError(err.message || 'Eroare la procesarea plății');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Finalizează Plata</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Serviciu:</span>
                        <span className="font-medium">{serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Sumă de plată:</span>
                        <span className="font-medium text-lg">
                            {formatCurrency(incompletePayment.amount)}
                        </span>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-amber-900/20 border border-amber-900/30 rounded-md">
                    <p className="text-sm text-amber-300">
                        Această plată necesită confirmare suplimentară. Te rugăm să completezi procesul de autentificare pentru a finaliza abonamentul.
                    </p>
                </div>
            </div>

            {/* Payment Element for updating payment method if needed */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        business: { name: 'SEO Doctor' },
                    }}
                />
            </div>

            {error && (
                <Alert type="error">
                    {error}
                </Alert>
            )}

            <div className="flex gap-4">
                <ActionButton
                    type="submit"
                    disabled={!stripe || loading}
                    variant="success"
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" />
                            <span className="ml-2">Se procesează...</span>
                        </>
                    ) : (
                        'Confirmă Plata'
                    )}
                </ActionButton>
                {onCancel && (
                    <ActionButton
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        variant="default"
                    >
                        Anulează
                    </ActionButton>
                )}
            </div>
        </form>
    );
}