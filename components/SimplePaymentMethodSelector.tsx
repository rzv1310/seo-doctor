'use client';

interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
}

interface SimplePaymentMethodSelectorProps {
    paymentMethods: PaymentMethod[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function SimplePaymentMethodSelector({
    paymentMethods,
    selectedId,
    onSelect
}: SimplePaymentMethodSelectorProps) {
    const getCardIcon = (brand: string) => {
        const brandLower = brand.toLowerCase();
        switch (brandLower) {
            case 'visa':
                return (
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="#1434CB">
                        <rect width="24" height="16" rx="2" fill="#1434CB" />
                        <text x="4" y="12" fill="white" fontSize="8" fontWeight="bold">VISA</text>
                    </svg>
                );
            case 'mastercard':
                return (
                    <svg className="h-8 w-8" viewBox="0 0 24 24">
                        <circle cx="9" cy="8" r="7" fill="#EB001B" />
                        <circle cx="15" cy="8" r="7" fill="#F79E1B" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-8 w-8 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
        }
    };

    return (
        <div className="space-y-3">
            {paymentMethods.map((method) => (
                <label
                    key={method.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedId === method.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border-color hover:border-primary/50'
                    }`}
                >
                    <div className="flex items-center">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedId === method.id}
                            onChange={(e) => onSelect(e.target.value)}
                            className="sr-only"
                        />
                        <div className="flex-shrink-0 mr-4">
                            {getCardIcon(method.brand)}
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center">
                                <span className="font-medium">•••• {method.last4}</span>
                                {method.isDefault && (
                                    <span className="ml-2 text-xs bg-primary/20 text-text-primary px-2 py-1 rounded">
                                        Implicit
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-text-secondary">
                                Expiră în {method.expMonth}/{method.expYear}
                            </p>
                        </div>
                        <div className="ml-4">
                            {selectedId === method.id && (
                                <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </div>
                </label>
            ))}
        </div>
    );
}