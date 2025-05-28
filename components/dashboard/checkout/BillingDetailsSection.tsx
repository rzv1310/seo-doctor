'use client';

import { useState } from 'react';

import { useBillingDetails } from '@/hooks/useBillingDetails';
import BillingDetailsDisplay from '@/components/dashboard/payment-methods/BillingDetailsDisplay';
import BillingDetailsForm from '@/components/dashboard/payment-methods/BillingDetailsForm';
import { ActionButton, LinkButton } from '@/components/ui';



export default function BillingDetailsSection() {
    const {
        billingDetails,
        hasDetails,
        hasCompleteDetails,
        isEditing,
        setIsEditing,
        isUpdating,
        error,
        setError,
        updateBillingDetails,
    } = useBillingDetails();

    const handleSave = async (data: any) => {
        try {
            await updateBillingDetails(data);
        } catch (err) {
            // Error is handled in the hook
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
    };

    if (isEditing) {
        return (
            <div className="dashboard-card">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold">Detalii Facturare</h2>
                    <p className="text-sm text-text-secondary mt-1">
                        Completează datele pentru emiterea facturilor
                    </p>
                </div>
                <div className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-md">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}
                    <BillingDetailsForm
                        initialData={billingDetails}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-card">
            <div className="p-4 border-b border-border-color">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold">Detalii Facturare</h2>
                        <p className="text-sm text-text-secondary mt-1">
                            Datele utilizate pentru emiterea facturilor
                        </p>
                    </div>
                    <ActionButton
                        onClick={() => setIsEditing(true)}
                        size="sm"
                        showArrow={false}
                        fullRounded={false}
                        variant={hasCompleteDetails ? "default" : "success"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {hasDetails ? 'Editează' : 'Adaugă'}
                    </ActionButton>
                </div>
            </div>
            <div className="p-4">
                {!hasCompleteDetails && (
                    <div className="mb-4 p-3 bg-amber-900/20 border border-amber-900/30 rounded-md">
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="text-amber-300 font-medium text-sm">Detalii de facturare incomplete</p>
                                <p className="text-amber-200 text-xs mt-1">
                                    Te rugăm să completezi datele de facturare pentru a putea emite facturile corespunzător.
                                    {!hasDetails && " Pentru companii, adaugă și codul fiscal/CUI."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                <BillingDetailsDisplay details={billingDetails} />
                
                {hasCompleteDetails && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-900/30 rounded-md">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-300 text-sm">
                                Detaliile de facturare sunt complete și vor fi utilizate pentru emiterea facturilor.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}