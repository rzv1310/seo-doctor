'use client';

import { useState } from 'react';
import { ActionButton, LinkButton } from '@/components/ui';
import { BillingDetails } from '@/types/billing';



interface BillingDetailsFormProps {
    initialData: BillingDetails;
    onSave: (data: BillingDetails) => Promise<void>;
    onCancel: () => void;
}

export default function BillingDetailsForm({
    initialData,
    onSave,
    onCancel
}: BillingDetailsFormProps) {
    const [billingName, setBillingName] = useState(initialData.billingName || '');
    const [billingCompany, setBillingCompany] = useState(initialData.billingCompany || '');
    const [billingVat, setBillingVat] = useState(initialData.billingVat || '');
    const [billingRegistrationNumber, setBillingRegistrationNumber] = useState(initialData.billingRegistrationNumber || '');
    const [billingAddress, setBillingAddress] = useState(initialData.billingAddress || '');
    const [billingPhone, setBillingPhone] = useState(initialData.billingPhone || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Require either name or company
        if (!billingName.trim() && !billingCompany.trim()) {
            newErrors.general = 'Te rugăm să completezi numele persoanei fizice sau denumirea companiei';
        }

        // Require address
        if (!billingAddress.trim()) {
            newErrors.billingAddress = 'Adresa este obligatorie';
        } else if (billingAddress.trim().length < 20) {
            newErrors.billingAddress = 'Te rugăm să completezi adresa completă (stradă, oraș, etc.)';
        }

        // If company is provided, VAT and registration number are required
        if (billingCompany.trim()) {
            if (!billingVat.trim()) {
                newErrors.billingVat = 'Codul fiscal/CUI este obligatoriu pentru companii';
            }
            if (!billingRegistrationNumber.trim()) {
                newErrors.billingRegistrationNumber = 'Numărul de înregistrare este obligatoriu pentru companii';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsUpdating(true);
        await onSave({
            billingName,
            billingCompany,
            billingVat,
            billingRegistrationNumber,
            billingAddress,
            billingPhone
        });
        setIsUpdating(false);
    };

    return (
        <div className="p-4 border border-border-color rounded-lg">
            <h3 className="font-medium mb-4">Editează Detaliile de Facturare</h3>
            
            {errors.general && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-md">
                    <p className="text-red-300 text-sm">{errors.general}</p>
                </div>
            )}
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="billingName" className="block text-sm text-text-secondary mb-1">
                            Nume persoană fizică
                        </label>
                        <input
                            id="billingName"
                            type="text"
                            value={billingName}
                            onChange={(e) => setBillingName(e.target.value)}
                            placeholder="Numele și prenumele"
                            className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label htmlFor="billingCompany" className="block text-sm text-text-secondary mb-1">
                            Denumire companie
                        </label>
                        <input
                            id="billingCompany"
                            type="text"
                            value={billingCompany}
                            onChange={(e) => setBillingCompany(e.target.value)}
                            placeholder="Denumirea companiei"
                            className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="billingVat" className="block text-sm text-text-secondary mb-1">
                            Cod fiscal / CUI {billingCompany && <span className="text-danger">*</span>}
                        </label>
                        <input
                            id="billingVat"
                            type="text"
                            value={billingVat}
                            onChange={(e) => setBillingVat(e.target.value)}
                            placeholder="RO12345678"
                            className={`w-full bg-dark-blue-lighter/50 border ${errors.billingVat ? 'border-red-500' : 'border-border-color'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200`}
                        />
                        {errors.billingVat && (
                            <p className="text-red-400 text-xs mt-1">{errors.billingVat}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="billingRegistrationNumber" className="block text-sm text-text-secondary mb-1">
                            Nr. Reg. Com. {billingCompany && <span className="text-danger">*</span>}
                        </label>
                        <input
                            id="billingRegistrationNumber"
                            type="text"
                            value={billingRegistrationNumber}
                            onChange={(e) => setBillingRegistrationNumber(e.target.value)}
                            placeholder="J40/1234/2024"
                            className={`w-full bg-dark-blue-lighter/50 border ${errors.billingRegistrationNumber ? 'border-red-500' : 'border-border-color'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200`}
                        />
                        {errors.billingRegistrationNumber && (
                            <p className="text-red-400 text-xs mt-1">{errors.billingRegistrationNumber}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="billingAddress" className="block text-sm text-text-secondary mb-1">
                        Adresă <span className="text-danger">*</span>
                    </label>
                    <textarea
                        id="billingAddress"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Strada și număr, Oraș, Județ, Cod poștal, Țară (ex: Strada Mihai Eminescu nr. 15, București, Sector 1, 010511, România)"
                        className={`w-full bg-dark-blue-lighter/50 border ${errors.billingAddress ? 'border-red-500' : 'border-border-color'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 min-h-[100px]`}
                        required
                    />
                    {errors.billingAddress && (
                        <p className="text-red-400 text-xs mt-1">{errors.billingAddress}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="billingPhone" className="block text-sm text-text-secondary mb-1">
                        Telefon
                    </label>
                    <input
                        id="billingPhone"
                        type="text"
                        value={billingPhone}
                        onChange={(e) => setBillingPhone(e.target.value)}
                        placeholder="Număr de telefon"
                        className="w-full bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <LinkButton
                        onClick={onCancel}
                        variant="default"
                        size="sm"
                    >
                        Anulare
                    </LinkButton>
                    <ActionButton
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        loading={isUpdating}
                        size="sm"
                        showArrow={false}
                        fullRounded={false}
                    >
                        {isUpdating ? (
                            'Se procesează...'
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Salvează
                            </>
                        )}
                    </ActionButton>
                </div>
            </div>
        </div>
    );
}
