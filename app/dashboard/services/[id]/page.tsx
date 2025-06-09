'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { DashboardPageLayout } from '@/components/layout';
import { ActionButton, Alert, Spinner, StatusBadge, Modal } from '@/components/ui';
import { services } from '@/data/services';
import { formatCurrency } from '@/lib/utils';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/context/AuthContext';
import { getPriceIdByServiceId } from '@/data/payment';
import { usePendingPayments } from '@/hooks/usePendingPayments';
import { useLogger } from '@/lib/client-logger';


const SubscriptionCheckout = dynamic(() => import('@/components/SubscriptionCheckout'), {
    ssr: false,
});

const PendingPaymentCheckout = dynamic(() => import('@/components/PendingPaymentCheckout'), {
    ssr: false,
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const logger = useLogger('ServiceDetailPage');
    const serviceId = parseInt(params.id as string);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [processing3DS, setProcessing3DS] = useState(false);
    const [incompletePayment, setIncompletePayment] = useState<any>(null);
    const [checkingPayments, setCheckingPayments] = useState(false);
    const { subscriptions, fetchSubscriptions, isSubscribed } = useSubscriptions();
    const { user } = useAuth();
    const { pendingSubscriptions, refresh: refreshPendingPayments } = usePendingPayments();

    // Get service from static data
    const service = services.find(s => s.id === serviceId);
    const subscription = subscriptions.find(s => s.serviceId === serviceId.toString());
    const hasActive = isSubscribed(serviceId.toString());
    const isPendingPayment = subscription?.status === 'pending_payment';
    
    // Find pending payment subscription for this service
    const pendingSubscription = pendingSubscriptions.find(s => 
        s.serviceId === serviceId.toString()
    );

    useEffect(() => {
        fetchSubscriptions();
        checkForIncompletePayments();

        // Check for success redirect
        if (searchParams.get('subscription_success') === 'true') {
            setShowSuccessModal(true);
            // Clean up URL
            router.replace(`/dashboard/services/${serviceId}`);
        }
    }, [serviceId, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const checkForIncompletePayments = async () => {
        if (!user) return;
        
        setCheckingPayments(true);
        try {
            const response = await fetch('/api/subscriptions/check-incomplete-payments');
            if (response.ok) {
                const data = await response.json();
                // Find incomplete payment for this service
                const servicePayment = data.incompletePayments?.find((payment: any) => 
                    payment.metadata?.serviceId === serviceId.toString()
                );
                if (servicePayment) {
                    logger.info('Found incomplete payment for service', { 
                        serviceId, 
                        paymentIntentId: servicePayment.paymentIntentId 
                    });
                    setIncompletePayment(servicePayment);
                }
            }
        } catch (error) {
            logger.error('Failed to check incomplete payments', error);
        } finally {
            setCheckingPayments(false);
        }
    };

    const handleSubscriptionSuccess = (subscriptionId?: string) => {
        setShowCheckout(false);
        setShowSuccessModal(true);
        fetchSubscriptions();
        refreshPendingPayments();
        checkForIncompletePayments();
    };

    const handlePendingPaymentSuccess = () => {
        setShowCheckout(false);
        setShowSuccessModal(true);
        setIncompletePayment(null);
        fetchSubscriptions();
        refreshPendingPayments();
        // Reload to ensure all data is fresh
        window.location.reload();
    };
    

    if (!service) {
        return (
            <DashboardPageLayout title="Service Not Found">
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
                    <p className="text-gray-400 mb-4">We couldn't find the service you're looking for.</p>
                    <ActionButton href="/dashboard/services">
                        Back to Services
                    </ActionButton>
                </div>
            </DashboardPageLayout>
        );
    }

    const priceId = getPriceIdByServiceId(serviceId);

    return (
        <DashboardPageLayout
            title={service.name}
            subtitle={service.description}
        >
            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Abonare Reușită!"
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Felicitări! Te-ai abonat cu succes la {service.name}.
                    </p>
                    <p className="text-gray-300">
                        Poți gestiona abonamentul oricând din pagina de servicii.
                    </p>
                    <div className="flex justify-end gap-2">
                        <ActionButton
                            onClick={() => router.push('/dashboard/services')}
                        >
                            Vezi Servicii
                        </ActionButton>
                        <ActionButton onClick={() => setShowSuccessModal(false)}>
                            Continuă
                        </ActionButton>
                    </div>
                </div>
            </Modal>

            {/* Pending Payment Notice */}
            {(isPendingPayment || pendingSubscription || incompletePayment) && (
                <Alert type="warning" className="mb-6">
                    <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-medium">Plată în așteptare</p>
                            <p className="text-sm mt-1">
                                Ai o plată în așteptare pentru acest serviciu. Te rugăm să finalizezi plata pentru a activa abonamentul.
                            </p>
                            {(pendingSubscription || incompletePayment) && (
                                <p className="text-xs mt-2 text-amber-200">
                                    Suma: {new Intl.NumberFormat('ro-RO', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(
                                        incompletePayment ? incompletePayment.amount / 100 : (pendingSubscription?.price || 0) / 100
                                    )}
                                </p>
                            )}
                            {incompletePayment && incompletePayment.paymentIntentStatus === 'requires_action' && (
                                <p className="text-xs mt-1 text-amber-200">
                                    Plata necesită autentificare 3D Secure pentru a fi finalizată.
                                </p>
                            )}
                        </div>
                        {checkingPayments && (
                            <Spinner size="sm" />
                        )}
                    </div>
                </Alert>
            )}

            {/* Action Buttons */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    {subscription && (
                        <StatusBadge
                            status={subscription.status}
                            variant={subscription.status === 'active' ? 'success' : 'info'}
                        />
                    )}
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    {(isPendingPayment || pendingSubscription || incompletePayment) ? (
                        <ActionButton
                            onClick={() => setShowCheckout(true)}
                            variant="danger"
                            disabled={checkingPayments}
                        >
                            {checkingPayments ? (
                                <>
                                    <Spinner size="sm" />
                                    <span className="ml-2">Se verifică...</span>
                                </>
                            ) : (
                                'Finalizează Plata'
                            )}
                        </ActionButton>
                    ) : !hasActive && priceId ? (
                        <ActionButton
                            onClick={() => setShowCheckout(true)}
                            disabled={!user}
                        >
                            Abonează-te Acum
                        </ActionButton>
                    ) : null}
                </div>
            </div>

            {/* Service Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">Preț</h3>
                    <div className="text-2xl font-bold text-green-400">
                        {formatCurrency(service.priceValueEUR)}
                        <span className="text-sm text-gray-400">{service.period}</span>
                    </div>
                    {service.offers && service.offers.length > 0 && (
                        <div className="mt-2">
                            {service.offers.map((offer, idx) => (
                                <p key={idx} className={`text-sm ${offer.textClass}`}>
                                    {offer.text}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
                {subscription && (
                    <>
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3">Următoarea Reînnoire</h3>
                            <div className="font-medium">
                                {subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3">Membru Din</h3>
                            <div className="font-medium">
                                {new Date(subscription.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Features */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg mb-6">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold">Caracteristici</h2>
                </div>
                <div className="p-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-300">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Checkout Section */}
            {showCheckout && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                    {incompletePayment && !checkingPayments ? (
                        <Elements 
                            stripe={stripePromise} 
                            options={{
                                clientSecret: incompletePayment.clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#3b82f6',
                                    },
                                },
                            }}
                        >
                            <PendingPaymentCheckout
                                incompletePayment={incompletePayment}
                                serviceName={service.name}
                                onSuccess={handlePendingPaymentSuccess}
                                onCancel={() => setShowCheckout(false)}
                            />
                        </Elements>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold mb-4">Abonează-te la {service.name}</h2>
                            <Elements stripe={stripePromise}>
                                <SubscriptionCheckout
                                    serviceId={serviceId}
                                    serviceName={service.name}
                                    price={service.priceValueEUR}
                                    onSuccess={handleSubscriptionSuccess}
                                    onCancel={() => setShowCheckout(false)}
                                />
                            </Elements>
                        </>
                    )}
                </div>
            )}

            {/* Service Support */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold">Suport</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-700 rounded-lg">
                            <h3 className="font-semibold mb-2">Ai nevoie de ajutor cu serviciul?</h3>
                            <p className="text-gray-400 text-sm mb-4">Echipa noastră de suport este disponibilă 24/7 pentru a te asista cu orice întrebări.</p>
                            <ActionButton href="/dashboard/chat" fullWidth>
                                Contactează Suportul
                            </ActionButton>
                        </div>

                        <div className="p-4 border border-gray-700 rounded-lg">
                            <h3 className="font-semibold mb-2">Mai Multe Informații</h3>
                            <p className="text-gray-400 text-sm mb-4">Află mai multe despre acest serviciu pe website-ul nostru.</p>
                            <ActionButton href={service.url} fullWidth>
                                Vezi Detalii
                            </ActionButton>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPageLayout>
    );
}
