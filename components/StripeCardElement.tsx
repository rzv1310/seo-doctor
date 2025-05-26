'use client';

import { useState } from 'react';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import stripePromise from '@/utils/stripe';
import { ActionButton, LinkButton, Toggle } from '@/components/ui';
import { useLogger } from '@/lib/client-logger';



interface StripeCardFormProps {
    onSuccess: (cardId: string) => void;
    onCancel: () => void;
    setAsDefault?: boolean;
}

function StripeCardForm({ onSuccess, onCancel, setAsDefault = false }: StripeCardFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [saveAsDefault, setSaveAsDefault] = useState(setAsDefault);
    const logger = useLogger('StripeCardForm');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            logger.warn('Stripe or Elements not loaded');
            return;
        }

        setError('');
        setProcessing(true);
        logger.info('Card form submitted', { saveAsDefault });

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            const errorMsg = 'Elementul card nu a fost găsit';
            logger.error('Card element not found', new Error(errorMsg));
            setError(errorMsg);
            setProcessing(false);
            return;
        }

        try {
            const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (pmError) {
                logger.error('Payment method creation failed', pmError, {
                    errorType: pmError.type,
                    errorCode: pmError.code
                });
                throw new Error(pmError.message);
            }

            if (!paymentMethod) {
                const errorMsg = 'Nu s-a putut crea metoda de plată';
                logger.error('Payment method not created', new Error(errorMsg));
                throw new Error(errorMsg);
            }

            logger.info('Payment method created successfully', { paymentMethodId: paymentMethod.id });

            const response = await fetch('/api/payment-methods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    setAsDefault: saveAsDefault,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || 'Eroare la adăugarea cardului';
                logger.error('Failed to add payment method', new Error(errorMsg), {
                    status: response.status,
                    error: data.error
                });
                throw new Error(errorMsg);
            }

            logger.info('Payment method added successfully', {
                cardId: data.card.id,
                isDefault: saveAsDefault
            });
            onSuccess(data.card.id);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'A apărut o eroare';
            logger.error('Card submission error', err as Error);
            setError(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">
                    Detalii Card
                </label>
                <div className="bg-dark-blue-lighter/50 border border-border-color rounded-lg p-3">
                    <CardElement
                        onReady={() => logger.info('Card element ready')}
                        onChange={(event) => {
                            if (event.error) {
                                logger.warn('Card validation error', {
                                    error: event.error.message,
                                    code: event.error.code
                                });
                            } else if (event.complete) {
                                logger.info('Card details completed');
                            }
                        }}
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#ffffff',
                                    '::placeholder': {
                                        color: '#6b7280',
                                    },
                                },
                                invalid: {
                                    color: '#ef4444',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <Toggle
                    checked={saveAsDefault}
                    onChange={(checked) => {
                        setSaveAsDefault(checked);
                        logger.interaction('toggle_default_payment', { setAsDefault: checked });
                    }}
                    label="Setează ca metodă de plată implicită"
                    size="sm"
                />
            </div>

            <div className="flex justify-end gap-3">
                <LinkButton
                    type="button"
                    onClick={onCancel}
                    variant="default"
                    size="sm"
                    disabled={processing}
                >
                    Anulare
                </LinkButton>
                <ActionButton
                    type="submit"
                    size="sm"
                    showArrow={false}
                    fullRounded={false}
                    disabled={!stripe || processing}
                    loading={processing}
                >
                    {processing ? 'Se procesează...' : 'Adaugă Card'}
                </ActionButton>
            </div>
        </form>
    );
}

interface StripeCardElementProps {
    onSuccess: (cardId: string) => void;
    onCancel: () => void;
    setAsDefault?: boolean;
}

export default function StripeCardElement({ onSuccess, onCancel, setAsDefault }: StripeCardElementProps) {
    return (
        <Elements stripe={stripePromise}>
            <StripeCardForm
                onSuccess={onSuccess}
                onCancel={onCancel}
                setAsDefault={setAsDefault}
            />
        </Elements>
    );
}
