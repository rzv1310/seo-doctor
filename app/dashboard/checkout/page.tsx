'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useLogger } from '@/lib/client-logger';
import { ActionButton, Alert, Input } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import { getPriceIdByServiceId } from '@/data/payment';
import { stripeIds } from '@/data/payment';



const MultiSubscriptionCheckout = dynamic(
    () => import('@/components/MultiSubscriptionCheckout'),
    {
        ssr: false,
        loading: () => (
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-2 text-gray-400">Se încarcă opțiunile de plată...</p>
            </div>
        )
    }
);


export default function CheckoutPage() {
    const router = useRouter();
    const logger = useLogger('CheckoutPage');
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
    const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
    const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);
    const [subscribedServicesCount, setSubscribedServicesCount] = useState(0);
    const [subscribedServicesNames, setSubscribedServicesNames] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const subscriptionDescription = items.length === 1
        ? `Abonament pentru ${items[0].name}`
        : `Abonament pentru ${items.length} servicii`;

    useEffect(() => {
        logger.info('Checkout page loaded', {
            itemCount: items.length,
            totalPrice,
            hasCoupon: !!couponCode
        });

        if (items.length === 0 && !subscriptionSuccess) {
            logger.info('Redirecting to services - empty cart');
            router.push('/dashboard/services');
        }
    }, [items, router, subscriptionSuccess, logger, totalPrice, couponCode]);

    const handleSubscriptionSuccess = (createdSubscriptionIds: string[]) => {
        logger.info('Subscriptions created successfully', {
            subscriptionIds: createdSubscriptionIds,
            serviceCount: items.length
        });
        // Store the items info before clearing cart
        setSubscribedServicesCount(items.length);
        setSubscribedServicesNames(items.map(item => item.name));
        setSubscriptionIds(createdSubscriptionIds);
        setSubscriptionSuccess(true);
        clearCart();
    };

    const handleSubscriptionError = (error: string) => {
        logger.error('Subscription error received', new Error(error));
        setError(error);
    };

    const handleContinue = () => {
        logger.interaction('continue_to_dashboard');
        router.push('/dashboard');
    };

    if (items.length === 0 && !subscriptionSuccess) {
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
                            {subscriptionSuccess ? (
                                <div className="bg-green-900/20 border border-green-900/30 rounded-md p-6 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-green-300 mb-2">Abonare Reușită!</h3>
                                    <p className="text-gray-300 mb-6">
                                        Abonarea pentru {subscribedServicesCount === 1 ? `serviciul ${subscribedServicesNames[0]}` : `${subscribedServicesCount} servicii`} a fost creată cu succes.
                                    </p>
                                    <p className="text-sm text-gray-400 mb-6">
                                        {subscriptionIds.length} abonament{subscriptionIds.length > 1 ? 'e' : ''} creat{subscriptionIds.length > 1 ? 'e' : ''}
                                    </p>
                                    <ActionButton onClick={handleContinue}>
                                        Continuă la Servicii
                                    </ActionButton>
                                </div>
                            ) : (
                                <MultiSubscriptionCheckout
                                    items={items}
                                    couponCode={couponCode}
                                    onSuccess={handleSubscriptionSuccess}
                                    onError={handleSubscriptionError}
                                />
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
                                        <span className="text-gray-400">Abonament lunar</span>
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
                                        onClick={() => {
                                            setCouponCode(inputCoupon);
                                            logger.interaction('coupon_applied', { couponCode: inputCoupon });
                                        }}
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
                        <div className="py-2 border-t border-gray-800">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{formattedTotalPrice}</span>
                            </div>

                            {couponCode && (
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Discount</span>
                                    <span className="text-green-500">-{formattedDiscountAmount}</span>
                                </div>
                            )}

                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Taxe</span>
                                <span>€0.00</span>
                            </div>

                            <div className="flex justify-between font-bold text-lg mt-4">
                                <span>Total lunar</span>
                                <span className="text-green-400">{couponCode ? formattedFinalPrice : formattedTotalPrice}</span>
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
