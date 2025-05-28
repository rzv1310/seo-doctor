'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useLogger } from '@/lib/client-logger';
import { ActionButton, Alert, Input } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import BillingDetailsSection from '@/components/dashboard/checkout/BillingDetailsSection';
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
        removeItem,
        totalPrice,
        formattedTotalPrice,
        clearCart,
        couponCode,
        setCouponCode,
        setCouponData,
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
                    {!subscriptionSuccess && (
                        <BillingDetailsSection />
                    )}
                    
                    <div className={`dashboard-card mb-6 ${!subscriptionSuccess ? 'mt-6' : ''}`}>
                        <div className="p-4 border-b border-border-color">
                            <h2 className="text-xl font-semibold">Plată</h2>
                        </div>
                        <div className="p-4">
                            {/* Services List with Remove Option */}
                            {!subscriptionSuccess && items.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    <h3 className="text-sm font-medium text-gray-400 mb-3">Servicii selectate:</h3>
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-3 bg-dark-blue-lighter rounded-lg border border-border-color">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-sm text-text-secondary">{item.description}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold">{item.price}/lună</span>
                                                <ActionButton
                                                    onClick={() => {
                                                        removeItem(item.id);
                                                        logger.interaction('item_removed_from_checkout', {
                                                            itemId: item.id,
                                                            itemName: item.name
                                                        });
                                                    }}
                                                    variant="danger"
                                                    size="sm"
                                                    showArrow={false}
                                                    fullRounded={false}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Elimină
                                                </ActionButton>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-border-color space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Subtotal:</span>
                                            <span>{formattedTotalPrice}/lună</span>
                                        </div>
                                        {couponCode && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Discount ({couponCode}):</span>
                                                <span className="text-green-500">-{formattedDiscountAmount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 border-t border-border-color">
                                            <span className="font-medium">Total:</span>
                                            <span className="text-lg font-bold text-text-primary">{couponCode ? formattedFinalPrice : formattedTotalPrice}/lună</span>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                    <div className="p-4">
                        <div className="text-xs text-text-primary">
                            <p className="mb-2">Finalizând achiziția, sunteți de acord cu:</p>
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
