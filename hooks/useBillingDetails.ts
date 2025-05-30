'use client';

import { useState, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useLogger } from '@/lib/client-logger';
import { BillingDetails } from '@/types/billing';



export function useBillingDetails() {
    const logger = useLogger('useBillingDetails');
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const billingDetails: BillingDetails = {
        billingName: user?.billingName ?? null,
        billingCompany: user?.billingCompany ?? null,
        billingVat: user?.billingVat ?? null,
        billingAddress: user?.billingAddress ?? null,
        billingPhone: user?.billingPhone ?? null,
    };

    const hasDetails = !!(billingDetails.billingName || billingDetails.billingCompany);
    const hasCompleteDetails = !!(
        (billingDetails.billingName || billingDetails.billingCompany) && 
        billingDetails.billingAddress
    );

    const updateBillingDetails = async (data: BillingDetails) => {
        try {
            setIsUpdating(true);
            setError(null);

            const response = await fetch('/api/auth/update-billing-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update billing details');
            }

            await refreshUser();
            setIsEditing(false);
            logger.info('Billing details updated successfully');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update billing details';
            setError(errorMessage);
            logger.error('Failed to update billing details', err);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        billingDetails,
        hasDetails,
        hasCompleteDetails,
        isEditing,
        setIsEditing,
        isUpdating,
        error,
        setError,
        updateBillingDetails,
    };
}