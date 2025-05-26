'use client';

import { Card, Link, LinkButton, ActionButton, StatusBadge } from '@/components/ui';
import type { Service } from '@/data/services';
import type { Subscription } from '@/hooks/useSubscriptions';



interface ServiceCardProps {
    service: Service & {
        status: string;
        renewalDate?: string;
        usage?: number;
        subscriptionId?: string | number;
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

    return (
        <Card className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border-color">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <StatusBadge status={service.status} />
                </div>
                <p className="text-text-primary text-sm mt-2">{service.description}</p>
            </div>

            <div className="p-4 flex-1">
                {service.status && service.status !== 'available' && service.usage !== undefined && (
                    <div className="mb-4">
                        <div className="text-sm text-text-primary mb-1">Utilizare</div>
                        <div className="w-full bg-dark-blue rounded-full h-2 mb-1">
                            <div
                                className={`h-2 rounded-full ${service.usage > 80 ? 'bg-danger' : 'bg-accent'}`}
                                style={{ width: `${service.usage}%` }}>
                            </div>
                        </div>
                        <div className="text-xs text-text-primary">{service.usage}%</div>
                    </div>
                )}

                <div className="mb-4">
                    <div className="text-sm text-text-primary mb-1">Caracteristici</div>
                    <ul className="text-sm space-y-1">
                        {service.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        {service.renewalDate && (
                            <div className="text-xs text-text-primary">Reînnoiește: {service.renewalDate}</div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        <Link
                            href={`/dashboard/services/${service.id}`}
                            variant="primary"
                        >
                            {isSubscribed ? 'Gestionează' : 'Detalii'}
                        </Link>

                        {isSubscribed ? (
                            <LinkButton
                                variant="danger"
                                size="sm"
                                onClick={() => subscription && onCancelSubscription(subscription)}
                            >
                                Anulează
                            </LinkButton>
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
