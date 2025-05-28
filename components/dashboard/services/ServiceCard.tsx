'use client';

import { Card, Link, LinkButton, ActionButton, StatusBadge } from '@/components/ui';
import type { Service } from '@/data/services';
import type { Subscription } from '@/hooks/useSubscriptions';



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
}

export default function ServiceCard({
    service,
    subscription,
    isInCart,
    isSubscribing,
    onToggleCart,
    onSubscribe,
    onCancelSubscription
}: ServiceCardProps) {
    const isActive = service.status === 'active' || service.status === 'trial';
    const isSubscribed = isActive;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <Card className="overflow-hidden flex flex-col">
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

            <div className="p-4 flex-1">
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

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-color">
                    <div className="flex-1">
                        <div className="font-bold text-white text-lg">{service.price}<span className="text-xs text-text-primary">{service.period || '/mo'}</span></div>
                        {service.isPendingCancellation && service.endDate ? (
                            <div className="text-xs text-red-400">Se anulează la: {formatDate(service.endDate)}</div>
                        ) : service.renewalDate ? (
                            <div className="text-xs text-text-primary">Reînnoiește: {formatDate(service.renewalDate)}</div>
                        ) : null}
                    </div>

                    <div className="flex gap-2 items-center">
                        <Link
                            href={isSubscribed ? `/dashboard/services/${service.id}` : service.url || '/'}
                            variant="primary"
                        >
                            {isSubscribed ? 'Gestionează' : 'Detalii'}
                        </Link>

                        {isSubscribed ? (
                            service.isPendingCancellation ? (
                                <span className="text-xs text-red-400 px-3 py-1">Anulare în curs</span>
                            ) : (
                                <LinkButton
                                    variant="danger"
                                    size="sm"
                                    onClick={() => subscription && onCancelSubscription(subscription)}
                                >
                                    Anulează
                                </LinkButton>
                            )
                        ) : (
                            <ActionButton
                                variant={isInCart ? "danger" : "default"}
                                size="sm"
                                onClick={onToggleCart}
                                showArrow={false}
                                fullRounded={false}
                            >
                                {isInCart ? 'Elimină din Coș' : 'Adaugă în Coș'}
                            </ActionButton>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
