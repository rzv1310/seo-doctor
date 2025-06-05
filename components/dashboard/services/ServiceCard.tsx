'use client';

import { useState } from 'react';
import { Card, Link, LinkButton, ActionButton, StatusBadge } from '@/components/ui';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import type { Service } from '@/types/service';
import type { Subscription } from '@/types/subscription';



interface ServiceCardProps {
    service: Service & {
        status: string;
        renewalDate?: string;
        endDate?: string;
        usage?: number;
        subscriptionId?: string | number;
        isPendingCancellation?: boolean;
        cancelledAt?: string;
    };
    subscription?: Subscription | null;
    isInCart: boolean;
    isSubscribing: boolean;
    onToggleCart: () => void;
    onSubscribe: () => void;
    onCancelSubscription: (subscription: Subscription) => void;
    onRenewSubscription?: (serviceId: string) => void;
}

export default function ServiceCard({
    service,
    subscription,
    isInCart,
    isSubscribing,
    onToggleCart,
    onSubscribe,
    onCancelSubscription,
    onRenewSubscription
}: ServiceCardProps) {
    const [isCancellingPending, setIsCancellingPending] = useState(false);
    const { hasValidPaymentMethod } = usePaymentMethods();
    const isActive = service.status === 'active' || service.status === 'trial';
    const isSubscribed = isActive && !service.isPendingCancellation;
    const isCancelled = service.status === 'cancelled' || (service.status === 'inactive' && !subscription);
    const isPendingCancellation = service.isPendingCancellation;
    const isPendingPayment = service.status === 'pending_payment' || (service.status === 'inactive' && subscription?.status === 'pending_payment');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const handleCancelPendingPayment = async () => {
        if (!subscription?.id || !confirm('Sigur vrei să anulezi această plată în așteptare?')) {
            return;
        }

        setIsCancellingPending(true);
        try {
            const response = await fetch('/api/subscriptions/cancel-pending-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId: subscription.id }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to cancel pending payment');
            }

            // Refresh the page to update the subscription list
            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Eroare la anularea plății');
        } finally {
            setIsCancellingPending(false);
        }
    };

    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-border-color">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <StatusBadge
                        status={service.isPendingCancellation ? 'cancelled' : service.status}
                        variant={service.isPendingCancellation ? 'warning' : undefined}
                    />
                </div>
                <p className="text-text-primary text-sm mt-2">{service.description}</p>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                    <div className="text-sm text-text-primary mb-1">Caracteristici</div>
                    <ul className="text-sm space-y-1">
                        {service.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {service.offers && service.offers.length > 0 && service.offers.map((offer, index) => (
                    <span key={index} className={`inline-block mb-4 text-xs ${offer.bgClass} ${offer.textClass} px-2 py-1 rounded`}>
                        {offer.text}
                    </span>
                ))}

                {isPendingPayment && (
                    <div className="mb-4 p-3 bg-amber-900/20 border border-amber-900/30 rounded-md">
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-amber-300 font-medium text-sm">Plată în așteptare</p>
                                <p className="text-amber-200 text-xs mt-1">
                                    Ai deja o plată în așteptare pentru acest serviciu. Te rugăm să finalizezi plata existentă.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-color">
                    <div className="flex items-center">
                        <Link
                            href={isSubscribed ? `/dashboard/services/${service.id}` : service.url || '/'}
                            variant="primary"
                        >
                            {isSubscribed ? 'Gestionează' : 'Detalii'}
                        </Link>
                    </div>

                    <div className="flex gap-2 items-center">

                        {isPendingPayment ? (
                            <>
                                <ActionButton
                                    variant="default"
                                    size="sm"
                                    onClick={() => window.location.href = `/dashboard/services/${service.id}`}
                                    showArrow={false}
                                    fullRounded={false}
                                >
                                    Finalizează Plata
                                </ActionButton>
                                <LinkButton
                                    variant="danger"
                                    size="sm"
                                    onClick={handleCancelPendingPayment}
                                    disabled={isCancellingPending}
                                >
                                    {isCancellingPending ? 'Se anulează...' : 'Anulează Plata'}
                                </LinkButton>
                            </>
                        ) : isSubscribed ? (
                            <LinkButton
                                variant="danger"
                                size="sm"
                                onClick={() => subscription && onCancelSubscription(subscription)}
                            >
                                Anulează
                            </LinkButton>
                        ) : (isCancelled || isPendingCancellation) && onRenewSubscription && !isPendingPayment ? (
                            <ActionButton
                                variant={hasValidPaymentMethod ? "success" : "default"}
                                size="sm"
                                onClick={() => hasValidPaymentMethod ? onRenewSubscription(service.id.toString()) : window.location.href = '/dashboard/payment-methods'}
                                showArrow={false}
                                fullRounded={false}
                                disabled={!hasValidPaymentMethod}
                            >
                                {hasValidPaymentMethod ? 'Reactivează' : 'Adaugă Card'}
                            </ActionButton>
                        ) : !subscription ? (
                            <ActionButton
                                variant={isInCart ? "danger" : "default"}
                                size="sm"
                                onClick={onToggleCart}
                                showArrow={false}
                                fullRounded={false}
                            >
                                {isInCart ? 'Elimină din Coș' : 'Adaugă în Coș'}
                            </ActionButton>
                        ) : null}
                    </div>
                </div>
            </div>
        </Card>
    );
}
