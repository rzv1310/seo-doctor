'use client';

import { useState } from 'react';
import { Modal, ActionButton, LinkButton, Input } from './ui';
import { services } from '@/data/services';
import type { Subscription } from '@/types/subscription';



interface PendingPaymentCancelModalProps {
    subscription: Subscription;
    isOpen: boolean;
    onClose: () => void;
    onCancel: (subscriptionId: string, reason?: string) => Promise<boolean>;
}

export default function PendingPaymentCancelModal({
    subscription,
    isOpen,
    onClose,
    onCancel
}: PendingPaymentCancelModalProps) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get service name from services data
    const service = services.find(s => s.id.toString() === subscription.serviceId);
    const serviceName = service?.name || `Serviciu ID: ${subscription.serviceId}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const success = await onCancel(subscription.id, reason || undefined);
            if (success) {
                setReason('');
                onClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'A apărut o eroare');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setReason('');
            setError(null);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Anulează Plata în Așteptare"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <div className="bg-amber-900/20 border border-amber-900/30 rounded-md p-4">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-amber-300 font-medium">Confirmare Anulare</span>
                        </div>
                        <p className="text-amber-200 text-sm mt-2">
                            Sigur vrei să anulezi plata în așteptare pentru serviciul <strong>{serviceName}</strong>?
                        </p>
                        <p className="text-amber-200 text-xs mt-2">
                            Această acțiune va șterge plata în așteptare și vei putea încerca din nou mai târziu.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-300 mb-2">
                            Motiv (opțional)
                        </label>
                        <Input
                            id="cancel-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="De ce anulezi această plată?"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Acest motiv ne ajută să îmbunătățim serviciile noastre.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-900/30 text-red-300 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                    <LinkButton
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Înapoi
                    </LinkButton>
                    <ActionButton
                        type="submit"
                        variant="danger"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Se anulează...' : 'Anulează Plata'}
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
}