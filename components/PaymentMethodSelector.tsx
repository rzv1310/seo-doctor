'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActionButton } from '@/components/ui';
import { useLogger } from '@/lib/client-logger';



interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
}

interface PaymentMethodSelectorProps {
    onPayment: (cardId: string) => Promise<void>;
    amount: number;
    currency?: string;
}

export default function PaymentMethodSelector({
    onPayment,
    amount,
    currency = 'USD'
}: PaymentMethodSelectorProps) {
    const router = useRouter();
    const logger = useLogger('PaymentMethodSelector');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                logger.info('Fetching payment methods', { amount, currency });
                const response = await fetch('/api/process-payment');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch payment methods');
                }

                logger.info('Payment methods fetched successfully', { count: data.cards.length });
                setPaymentMethods(data.cards);

                const defaultCard = data.cards.find((card: PaymentMethod) => card.isDefault);
                if (defaultCard) {
                    setSelectedCardId(defaultCard.id);
                    logger.info('Default payment method selected', { cardId: defaultCard.id });
                } else if (data.cards.length > 0) {
                    setSelectedCardId(data.cards[0].id);
                    logger.info('First payment method selected', { cardId: data.cards[0].id });
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to load payment methods';
                logger.error('Failed to fetch payment methods', err as Error);
                setError(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentMethods();
    }, [logger, amount, currency]);

    const handlePayment = async () => {
        if (!selectedCardId) {
            const errorMsg = 'Vă rugăm să selectați o metodă de plată';
            logger.warn('Payment attempted without card selection');
            setError(errorMsg);
            return;
        }

        setIsProcessing(true);
        setError('');
        logger.info('Payment initiated', { cardId: selectedCardId, amount, currency });

        try {
            await onPayment(selectedCardId);
            logger.info('Payment completed successfully', { cardId: selectedCardId });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Plata a eșuat';
            logger.error('Payment failed', err as Error, { cardId: selectedCardId });
            setError(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    const getCardIcon = (brand: string) => {
        const brandLower = brand.toLowerCase();
        switch (brandLower) {
            case 'visa':
                return (
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="#1434CB">
                        <rect width="24" height="16" rx="2" fill="#1434CB" />
                        <text x="4" y="12" fill="white" fontSize="8" fontWeight="bold">VISA</text>
                    </svg>
                );
            case 'mastercard':
                return (
                    <svg className="h-8 w-8" viewBox="0 0 24 24">
                        <circle cx="9" cy="8" r="7" fill="#EB001B" />
                        <circle cx="15" cy="8" r="7" fill="#F79E1B" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-8 w-8 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-2 text-text-secondary">Se încarcă metodele de plată...</p>
            </div>
        );
    }

    if (paymentMethods.length === 0) {
        return (
            <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-text-secondary mb-4">Nu aveți metode de plată salvate</p>
                <ActionButton
                    onClick={() => router.push('/dashboard/payment-methods')}
                    variant="default"
                >
                    Adaugă Card
                </ActionButton>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Selectați metoda de plată</h3>

            {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => (
                    <label
                        key={method.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-all ${selectedCardId === method.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border-color hover:border-primary/50'
                            }`}
                    >
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={selectedCardId === method.id}
                                onChange={(e) => {
                                    setSelectedCardId(e.target.value);
                                    logger.interaction('payment_method_selected', { cardId: e.target.value });
                                }}
                                className="sr-only"
                            />
                            <div className="flex-shrink-0 mr-4">
                                {getCardIcon(method.brand)}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center">
                                    <span className="font-medium">•••• {method.last4}</span>
                                    {method.isDefault && (
                                        <span className="ml-2 text-xs bg-primary/20 text-text-primary px-2 py-1 rounded">
                                            Implicit
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary">
                                    Expiră în {method.expMonth}/{method.expYear}
                                </p>
                            </div>
                            <div className="ml-4">
                                {selectedCardId === method.id && (
                                    <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </label>
                ))}
            </div>

            <div className="border-t border-border-color pt-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total de plată:</span>
                    <span className="text-2xl font-bold text-text-primary">
                        {(amount / 100).toFixed(2)} {currency}
                    </span>
                </div>

                <ActionButton
                    onClick={handlePayment}
                    disabled={!selectedCardId || isProcessing}
                    loading={isProcessing}
                    fullWidth
                    size="lg"
                >
                    {isProcessing ? 'Se procesează...' : 'Plătește acum'}
                </ActionButton>

                <p className="text-xs text-text-secondary text-center mt-3">
                    Plata va fi procesată în siguranță prin Stripe
                </p>
            </div>
        </div>
    );
}
