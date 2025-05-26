'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ActionButton, Alert, Input, Spinner } from './ui';
import { formatCurrency } from '@/lib/utils';
import { stripeIds } from '@/data/payment';
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
    const [loading, setLoading] = useState(false);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [localCouponCode, setLocalCouponCode] = useState(couponCode || '');
    const [discount, setDiscount] = useState(0);
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
    }, []);

    useEffect(() => {
        if (couponCode) {
            setLocalCouponCode(couponCode);
            if (couponCode.toUpperCase() === stripeIds.coupons.SEO70) {
                setDiscount(70);
                setCouponValid(true);
            }
        }
    }, [couponCode]);

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
            console.error('Failed to fetch payment methods:', err);
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

            setDiscount(data.percentOff || 0);
            setCouponValid(true);
        } catch (err: any) {
            setError(err.message);
            setCouponValid(false);
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
            console.log('Creating subscriptions with payment method:', selectedPaymentMethod);
            
            // Create subscriptions for each service
            for (const item of items) {
                console.log(`Creating subscription for service ${item.id}:`, item.name);
                
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
                console.log('Subscription response:', data);

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
            
            console.log('Subscriptions created:', {
                count: createdSubscriptions.length,
                allActive,
                requiresAction,
                statuses: createdSubscriptions.map(s => ({ id: s.subscriptionId, status: s.status }))
            });

            if (requiresAction) {
                // Handle 3D Secure or other payment confirmations if needed
                console.log('Payment requires additional action');
                // For now, we'll still consider it a success since the subscription is created
            }

            // Call success callback regardless of status
            // The subscription is created, even if payment is pending
            if (onSuccess) {
                onSuccess(createdSubscriptions.map(sub => sub.subscriptionId));
            }
        } catch (err: any) {
            console.error('Subscription creation error:', err);
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
        await createSubscriptions();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Detalii Abonament</h3>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <span className="text-gray-300">{item.name}</span>
                            <span className="font-medium">{formatCurrency(item.priceValue)}/lună</span>
                        </div>
                    ))}
                    
                    {discount > 0 && (
                        <div className="border-t border-gray-800 pt-3 mt-3">
                            <div className="flex justify-between text-green-400">
                                <span>Discount ({discount}%):</span>
                                <span>-{formatCurrency(totalPrice * discount / 100)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold mt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(discountedPrice)}/lună</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                                *Discount se aplică pentru primele 3 luni
                            </p>
                        </div>
                    )}
                </div>
            </div>

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
                    <p className="text-sm text-green-400">
                        ✓ Cod promoțional aplicat cu succes!
                    </p>
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
                                    onClick={() => setShowAddCard(true)}
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