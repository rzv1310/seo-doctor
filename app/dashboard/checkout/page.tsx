'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCart } from '../../../context/CartContext';
import { ActionButton } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';

const PaymentMethodSelector = dynamic(
    () => import('@/components/PaymentMethodSelector'),
    {
        ssr: false,
        loading: () => (
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-2 text-text-secondary">Se încarcă opțiunile de plată...</p>
            </div>
        )
    }
);

export default function CheckoutPage() {
    const router = useRouter();
    const {
        items,
        totalPrice,
        formattedTotalPrice,
        clearCart,
        couponCode,
        setCouponCode,
        discountAmount,
        formattedDiscountAmount,
        finalPrice,
        formattedFinalPrice
    } = useCart();
    const [inputCoupon, setInputCoupon] = useState(couponCode);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Create a description for payment processing
    const paymentDescription = items.length === 1
        ? `Payment for ${items[0].name} subscription`
        : `Payment for ${items.length} services subscription`;

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0 && !paymentSuccess) {
            router.push('/dashboard/services');
        }
    }, [items, router, paymentSuccess]);

    const handlePaymentWithCard = async (cardId: string) => {
        try {
            setPaymentError(null);

            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: couponCode ? finalPrice : totalPrice,
                    currency: 'usd',
                    description: paymentDescription,
                    cardId,
                    metadata: {
                        items: items.map(item => item.name).join(', '),
                        couponCode: couponCode || '',
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment failed');
            }

            setPaymentIntentId(data.chargeId);
            setPaymentSuccess(true);
            clearCart();
        } catch (error) {
            throw error;
        }
    };

    const handlePaymentError = (error: string) => {
        console.error('Payment error:', error);
        setPaymentError(error);
    };

    const handleContinue = () => {
        // Redirect to dashboard
        router.push('/dashboard');
    };

    if (items.length === 0 && !paymentSuccess) {
        return null; // Will redirect via useEffect
    }

    return (
        <DashboardPageLayout
            title="Finalizează Comanda"
            subtitle="Completează plata pentru serviciile selectate"
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="dashboard-card mb-6">
                        <div className="p-4 border-b border-border-color">
                            <h2 className="text-xl font-semibold">Plată</h2>
                        </div>
                        <div className="p-4">
                            {paymentSuccess ? (
                                <div className="bg-green-900/20 border border-green-900/30 rounded-md p-6 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-green-300 mb-2">Plată Reușită!</h3>
                                    <p className="text-text-primary mb-6">
                                        Plata pentru {items.length === 1 ? `serviciul ${items[0].name}` : `${items.length} servicii`} a fost procesată cu succes.
                                    </p>
                                    <p className="text-sm text-text-primary mb-6">
                                        ID Plată: {paymentIntentId}
                                    </p>
                                    <button
                                        onClick={handleContinue}
                                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors"
                                    >
                                        Continuă la Panou de Control
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="mb-6 text-text-primary">
                                        Te rugăm să introduci detaliile de plată pentru a finaliza achiziția.
                                    </p>

                                    {paymentError && (
                                        <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-6 text-danger">
                                            {paymentError}
                                        </div>
                                    )}

                                    <PaymentMethodSelector
                                        amount={couponCode ? finalPrice : totalPrice}
                                        currency="USD"
                                        onPayment={handlePaymentWithCard}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-card h-fit">
                    <div className="p-4 border-b border-border-color">
                        <h2 className="text-xl font-semibold">Rezumat Comandă</h2>
                    </div>
                    <div className="p-4">
                        {/* Cart Items */}
                        <div className="mb-4 space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="pb-3 border-b border-border-color last:border-0">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-text-primary text-sm mb-2">
                                        {item.description}
                                    </p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-primary">Abonament lunar</span>
                                        <span>{item.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Code Input */}
                        <div className="pt-4 pb-4 border-t border-border-color">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <input
                                        type="text"
                                        value={inputCoupon}
                                        onChange={(e) => setInputCoupon(e.target.value)}
                                        placeholder="Cod promoțional"
                                        className="flex-1 px-3 py-2 rounded bg-dark-blue border border-border-color focus:border-primary focus:outline-none text-sm"
                                    />
                                    <ActionButton
                                        onClick={() => setCouponCode(inputCoupon)}
                                        size="sm"
                                        showArrow={false}
                                        fullRounded={false}
                                    >
                                        Aplică
                                    </ActionButton>
                                </div>
                                {couponCode && (
                                    <div className="text-xs text-green-500 flex items-center gap-1 mt-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Cod promoțional aplicat: {couponCode}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="py-2 border-t border-border-color">
                            <div className="flex justify-between mb-2">
                                <span className="text-text-primary">Subtotal</span>
                                <span>{formattedTotalPrice}</span>
                            </div>

                            {couponCode && (
                                <div className="flex justify-between mb-2">
                                    <span className="text-text-primary">Discount</span>
                                    <span className="text-green-500">-{formattedDiscountAmount}</span>
                                </div>
                            )}

                            <div className="flex justify-between mb-2">
                                <span className="text-text-primary">Taxe</span>
                                <span>$0.00</span>
                            </div>

                            <div className="flex justify-between font-bold text-lg mt-4">
                                <span>Total</span>
                                <span className="text-sky-400">{couponCode ? formattedFinalPrice : formattedTotalPrice}</span>
                            </div>
                        </div>

                        <div className="mt-6 text-xs text-text-primary">
                            <p className="mb-2">Finalizând achiziția, ești de acord cu:</p>
                            <ul className="space-y-1">
                                <li>
                                    <Link href="/legal?tab=terms" target="_blank">Termenii de Serviciu</Link>
                                </li>
                                <li>
                                    <Link href="/legal?tab=privacy" target="_blank">Politica de Confidențialitate</Link>
                                </li>
                                <li>
                                    <Link href="/legal?tab=terms#refund-policy" target="_blank">Politica de Rambursare</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <Link
                    href="/dashboard/services"
                    className="text-text-primary hover:text-sky-400 transition-colors"
                >
                    ← Înapoi la Servicii
                </Link>
            </div>
        </DashboardPageLayout>
    );
}