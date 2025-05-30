import { useState } from 'react';
import type { Subscription } from '@/types/subscription';



interface SubscriptionCancelModalProps {
    subscription: Subscription;
    onCancel: (subscriptionId: string, reason?: string) => Promise<boolean>;
    onClose: () => void;
    isOpen: boolean;
}

export default function SubscriptionCancelModal({
    subscription,
    onCancel,
    onClose,
    isOpen,
}: SubscriptionCancelModalProps) {
    const [reason, setReason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const success = await onCancel(subscription.id, reason);
            if (success) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-semibold mb-4">Confirmă Anularea</h3>
                <p className="text-text-secondary mb-4">
                    Ești sigur că vrei să anulezi abonamentul pentru <span className="text-white font-medium">{subscription.service?.name}</span>?
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="reason" className="block text-sm text-text-secondary mb-1">
                            Motivul anulării (opțional)
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-dark-blue/50 backdrop-blur-sm rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary min-h-[100px]"
                            placeholder="Te rugăm să ne spui de ce anulezi..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-glass-bg backdrop-blur-sm border border-glass-border hover:bg-white/10 transition-colors"
                            disabled={isSubmitting}
                        >
                            Înapoi
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-danger hover:bg-danger/80 transition-colors flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Se procesează...
                                </>
                            ) : 'Confirmă Anularea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
