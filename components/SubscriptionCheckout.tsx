'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentElement } from '@stripe/react-stripe-js';
import { stripeIds } from '@/data/payment';
import { ActionButton, Alert, Input, Spinner } from './ui';
import { formatCurrency } from '@/lib/utils';


interface SubscriptionCheckoutProps {
    serviceId: number;
    serviceName: string;
    price: number; // In cents
    onSuccess?: (subscriptionId: string) => void;
    onCancel?: () => void;
}

export default function SubscriptionCheckout({
    serviceId,
    serviceName,
    price,
    onSuccess,
    onCancel,
}: SubscriptionCheckoutProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponValid, setCouponValid] = useState(false);
    const [couponData, setCouponData] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate discounted price
    const discountedPrice = price - (price * discount / 100);

    // Create subscription on mount only if no client secret
    useEffect(() => {
        if (!clientSecret) {
            createSubscription();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const createSubscription = async (applyCouponOrPromoCode?: string) => {
        setLoading(true);
        setError(null);

        try {
            const isPromotionCode = couponData?.promotionCodeId === applyCouponOrPromoCode;
            
            const response = await fetch('/api/subscriptions/create-stripe-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    coupon: isPromotionCode ? undefined : applyCouponOrPromoCode,
                    promotionCodeId: isPromotionCode ? applyCouponOrPromoCode : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create subscription');
            }

            setSubscriptionId(data.subscriptionId);
            
            // Only set client secret if payment requires action
            if (data.requiresAction && data.clientSecret) {
                setClientSecret(data.clientSecret);
                console.log('Payment requires 3D Secure authentication', {
                    subscriptionId: data.subscriptionId,
                    hasClientSecret: !!data.clientSecret
                });
            } else if (data.status === 'active') {
                // Subscription is already active, no payment needed
                if (onSuccess) {
                    onSuccess(data.subscriptionId);
                }
            } else {
                // Subscription created but payment failed
                setError('Plata nu a putut fi procesată. Te rugăm să verifici detaliile cardului.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const validateCoupon = async () => {
        if (!couponCode) return;

        setValidatingCoupon(true);
        setError(null);

        try {
            // Validate coupon with API
            const response = await fetch('/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode: couponCode.toUpperCase() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid coupon code');
            }

            // Apply coupon discount
            setDiscount(data.percentOff || 0);
            setCouponValid(true);
            setCouponData(data);

            // Recreate subscription with coupon or promotion code
            await createSubscription(data.promotionCodeId || couponCode.toUpperCase());
        } catch (err: any) {
            setError(err.message);
            setCouponValid(false);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isSubmitting || loading) {
            return;
        }

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setIsSubmitting(true);
        setLoading(true);
        setError(null);

        try {
            // Confirm the payment
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard/services/${serviceId}?subscription_success=true`,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                throw confirmError;
            }

            // Payment succeeded
            if (onSuccess && subscriptionId) {
                onSuccess(subscriptionId);
            }
        } catch (err: any) {
            setError(err.message || 'Payment failed');
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    // Show loading while creating subscription
    if (loading && !clientSecret && !error) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
                <span className="ml-2 text-gray-400">Se creează abonamentul...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Detalii Abonament</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Serviciu:</span>
                        <span className="font-medium">{serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Preț:</span>
                        <span className="font-medium">{formatCurrency(price)}/lună</span>
                    </div>
                    {discount > 0 && (
                        <>
                            <div className="flex justify-between text-green-400">
                                <span>Discount ({discount}%):</span>
                                <span>-{formatCurrency(price * discount / 100)}</span>
                            </div>
                            <div className="border-t border-gray-800 pt-2 mt-2">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(discountedPrice)}/lună</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                    *Discount se aplică pentru primele 3 luni
                                </p>
                            </div>
                        </>
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
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Introdu codul promoțional"
                        disabled={couponValid || validatingCoupon}
                        className="flex-1"
                    />
                    <ActionButton
                        onClick={validateCoupon}
                        disabled={!couponCode || couponValid || validatingCoupon}
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

            {/* Payment Element - only show if payment requires confirmation */}
            {clientSecret && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Confirmare Plată</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Plata ta necesită confirmare suplimentară. Te rugăm să completezi procesul de autentificare.
                    </p>
                    <PaymentElement
                        options={{
                            layout: 'tabs',
                            business: { name: 'SEO Doctor' },
                            fields: {
                                billingDetails: {
                                    address: 'auto',
                                },
                            },
                        }}
                    />
                </div>
            )}

            {error && (
                <Alert type="error">
                    {error}
                </Alert>
            )}

            <div className="flex gap-4">
                <ActionButton
                    onClick={handleSubmit}
                    disabled={!stripe || loading || isSubmitting || (!clientSecret && !error)}
                    variant={clientSecret ? "danger" : "default"}
                >
                    {loading || isSubmitting ? (
                        <>
                            <Spinner size="sm" />
                            <span className="ml-2">Se procesează...</span>
                        </>
                    ) : clientSecret ? (
                        'Confirmă Plata'
                    ) : (
                        `Abonează-te pentru ${formatCurrency(discountedPrice)}/lună`
                    )}
                </ActionButton>
                {onCancel && (
                    <ActionButton
                        onClick={onCancel}
                        disabled={loading || isSubmitting}
                    >
                        Anulează
                    </ActionButton>
                )}
            </div>
        </form>
    );
}