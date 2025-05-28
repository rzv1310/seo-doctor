'use client';

import { LinkButton, AcceptButton } from '@/components/ui';
import { getCardIcon } from './utils';



interface PaymentMethod {
    id: string;
    brand?: string;
    last4?: string;
    lastFour?: string;
    expMonth?: number | null;
    expYear?: number | null;
    expiryMonth?: number | null;
    expiryYear?: number | null;
    isDefault?: boolean;
    funding?: string;
    country?: string;
}

interface PaymentMethodCardProps {
    method: PaymentMethod;
    onSetDefault: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function PaymentMethodCard({
    method,
    onSetDefault,
    onDelete
}: PaymentMethodCardProps) {
    // Handle different property names from the API
    const last4 = method.last4 || method.lastFour || '****';
    const expMonth = method.expMonth ?? method.expiryMonth ?? 0;
    const expYear = method.expYear ?? method.expiryYear ?? 0;

    return (
        <div className="p-4 border border-border-color rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-12 h-12 flex items-center justify-center mr-4">
                        {getCardIcon(method.brand || 'unknown')}
                    </div>
                    <div>
                        <div className="flex items-center">
                            <h3 className="font-medium">•••• {last4}</h3>
                            {method.isDefault && (
                                <span className="ml-2 bg-primary/20 text-text-primary text-xs px-2 py-1 rounded">
                                    Implicit
                                </span>
                            )}
                        </div>
                        <p className="text-text-secondary text-sm">
                            Expiră în {expMonth}/{expYear}
                            {method.funding && ` • ${method.funding === 'credit' ? 'Credit' : method.funding === 'debit' ? 'Debit' : method.funding}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {!method.isDefault && (
                        <LinkButton
                            onClick={() => onSetDefault(method.id)}
                            variant="default"
                            size="sm"
                        >
                            Setează ca Implicit
                        </LinkButton>
                    )}
                    <AcceptButton
                        onAccept={() => onDelete(method.id)}
                        confirmTitle="Ștergeți cardul?"
                        confirmMessage={`Sunteți sigur că doriți să ștergeți cardul •••• ${last4}?`}
                        acceptText="Da"
                        cancelText="Nu"
                        variant="danger"
                        size="sm"
                        showArrow={false}
                    >
                        Șterge
                    </AcceptButton>
                </div>
            </div>
        </div>
    );
}
