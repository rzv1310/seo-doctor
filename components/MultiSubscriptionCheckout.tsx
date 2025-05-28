'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { ActionButton, Alert, Input, Spinner } from './ui';
import { formatCurrency } from '@/lib/utils';
import { stripeIds } from '@/data/payment';
import { useCart } from '@/context/CartContext';
import { useLogger } from '@/lib/client-logger';
import type { CartService } from '@/context/CartContext';

import SimplePaymentMethodSelector from './SimplePaymentMethodSelector';
import StripeCardElement from './StripeCardElement';


const Link = dynamic(() => import('next/link'), { ssr: false });

interface MultiSubscriptionCheckoutProps {
    items: CartService[];
    couponCode?: string | null;
    onSuccess?: (subscriptionIds: string[]) => void;
    onError?: (error: string) => void;
}

export default function MultiSubscriptionCheckout({
    items,
    couponCode,
    onSuccess,
    onError,
}: MultiSubscriptionCheckoutProps) {
    const { setCouponCode, setCouponData } = useCart();
    const logger = useLogger('MultiSubscriptionCheckout');
    const [loading, setLoading] = useState(false);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [localCouponCode, setLocalCouponCode] = useState(couponCode || '');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponValid, setCouponValid] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [showAddCard, setShowAddCard] = useState(false);

    // Calculate total price
    const totalPrice = items.reduce((sum, item) => sum + item.priceValue, 0);
    const discountedPrice = totalPrice - (totalPrice * discount / 100);

    // Fetch payment methods on mount
    useEffect(() => {
        fetchPaymentMethods();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (couponCode && localCouponCode) {
            // Validate the coupon on load to get proper discount data
            validateCoupon();
        }
    }, [localCouponCode]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch('/api/payment-methods');
            const data = await response.json();
            
            if (response.ok) {
                setPaymentMethods(data.cards || []);
                // Auto-select default payment method
                const defaultCard = data.cards?.find((card: any) => card.isDefault);
                if (defaultCard) {
                    setSelectedPaymentMethod(defaultCard.id);
                }
            }
        } catch (err) {
            logger.error('Failed to fetch payment methods', err);
        } finally {
            setLoadingPaymentMethods(false);
        }
    };

    const handleCardAdded = (cardId: string) => {
        setShowAddCard(false);
        setSelectedPaymentMethod(cardId);
        fetchPaymentMethods(); // Refresh the list
    };

    const validateCoupon = async () => {
        if (!localCouponCode) return;

        setValidatingCoupon(true);
        setError(null);

        try {
            const response = await fetch('/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode: localCouponCode.toUpperCase() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Cod promoțional invalid');
            }

            if (data.percentOff) {
                setDiscount(data.percentOff);
                setDiscountType('percent');
            } else if (data.amountOff) {
                setDiscount(data.amountOff);
                setDiscountType('amount');
            }
            setCouponValid(true);
            // Update cart context with validated coupon
            setCouponCode(localCouponCode.toUpperCase());
            setCouponData(data);
        } catch (err: any) {
            setError(err.message);
            setCouponValid(false);
            // Clear cart coupon on error
            setCouponCode('');
            setCouponData(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const createSubscriptions = async () => {
        if (!selectedPaymentMethod) {
            setError('Selectează o metodă de plată pentru a continua');
            return;
        }

        setLoading(true);
        setError(null);
        const createdSubscriptions = [];

        try {
            logger.info('Creating subscriptions', { 
                paymentMethodId: selectedPaymentMethod,
                itemCount: items.length 
            });
            
            for (const item of items) {
                logger.info('Creating subscription for service', { 
                    serviceId: item.id, 
                    serviceName: item.name 
                });
                
                const response = await fetch('/api/subscriptions/create-stripe-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceId: item.id,
                        paymentMethodId: selectedPaymentMethod,
                        coupon: couponValid ? localCouponCode.toUpperCase() : undefined,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Failed to create subscription for ${item.name}`);
                }

                createdSubscriptions.push({
                    ...data,
                    serviceName: item.name,
                });
            }

            setSubscriptions(createdSubscriptions);

            // Check subscription statuses
            const allActive = createdSubscriptions.every(sub => sub.status === 'active');
            const requiresAction = createdSubscriptions.some(sub => sub.requiresAction);
            
            logger.info('Subscriptions created', {
                count: createdSubscriptions.length,
                allActive,
                requiresAction,
                statuses: createdSubscriptions.map(s => ({ id: s.subscriptionId, status: s.status }))
            });

            if (requiresAction) {
                logger.info('Payment requires additional action');
            }

            // Call success callback regardless of status
            // The subscription is created, even if payment is pending
            if (onSuccess) {
                onSuccess(createdSubscriptions.map(sub => sub.subscriptionId));
            }
        } catch (err: any) {
            logger.error('Subscription creation error', err);
            const errorMessage = err.message || 'A apărut o eroare la crearea abonamentelor';
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Only submit if we're not showing the add card form
        if (!showAddCard) {
            await createSubscriptions();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Code Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                    Cod Promoțional (Opțional)
                </label>
                <div className="flex gap-2">
                    <Input
                        value={localCouponCode}
                        onChange={(e) => setLocalCouponCode(e.target.value)}
                        placeholder="Introdu codul promoțional"
                        disabled={couponValid || validatingCoupon}
                        className="flex-1"
                    />
                    <ActionButton
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            validateCoupon();
                        }}
                        disabled={!localCouponCode || couponValid || validatingCoupon}
                    >
                        {validatingCoupon ? <Spinner size="sm" /> : 'Aplică'}
                    </ActionButton>
                </div>
                {couponValid && (
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-green-400">
                            ✓ Cod promoțional aplicat cu succes! 
                            {discountType === 'percent' ? ` (${discount}% discount)` : ` (-${formatCurrency(discount)})`}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setCouponValid(false);
                                setDiscount(0);
                                setLocalCouponCode('');
                                setCouponCode('');
                                setCouponData(null);
                            }}
                            className="text-text-secondary hover:text-danger transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Metodă de Plată</h3>
                
                {loadingPaymentMethods ? (
                    <div className="text-center py-4">
                        <Spinner size="md" />
                        <p className="text-sm text-gray-400 mt-2">Se încarcă metodele de plată...</p>
                    </div>
                ) : showAddCard ? (
                    <StripeCardElement
                        onSuccess={handleCardAdded}
                        onCancel={() => setShowAddCard(false)}
                        setAsDefault={paymentMethods.length === 0}
                    />
                ) : (
                    <div className="space-y-4">
                        {paymentMethods.length > 0 ? (
                            <>
                                <SimplePaymentMethodSelector
                                    paymentMethods={paymentMethods}
                                    selectedId={selectedPaymentMethod}
                                    onSelect={setSelectedPaymentMethod}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowAddCard(true);
                                    }}
                                    className="text-sm text-primary hover:text-primary-hover transition-colors"
                                >
                                    + Adaugă card nou
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <p className="text-gray-400 mb-4">Nu ai nicio metodă de plată salvată</p>
                                <ActionButton
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowAddCard(true);
                                    }}
                                    size="sm"
                                    showArrow={false}
                                >
                                    Adaugă Card
                                </ActionButton>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <Alert type="error">
                    {error}
                </Alert>
            )}

            <ActionButton
                type="submit"
                disabled={loading || !selectedPaymentMethod}
                fullWidth
            >
                {loading ? (
                    <>
                        <Spinner size="sm" />
                        <span className="ml-2">Se procesează...</span>
                    </>
                ) : (
                    `Abonează-te pentru ${formatCurrency(discountedPrice)}/lună`
                )}
            </ActionButton>
        </form>
    );
}